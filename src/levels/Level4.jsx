import { useEffect, useMemo, useRef, useState } from "react";
import {
  applyMove,
  createInitialBoard,
  findKing,
  generateLegalMoves,
  hasAnyLegalMoves,
  isInCheck,
  isWhite,
} from "../chess/engine.js";
import { moveNotation, parseMove, resolveMove } from "../chess/notation.js";
import Board from "../components/Board.jsx";
import { extraerJugadas, recortarMientrasEscribe, textoCarta } from "../carta.js";
import { guardarPartida, leerPartida } from "../storage.js";
import { descargarTableroComoImagen } from "../tableroImagen.js";
import { COLORS, FONTS } from "../theme.js";

/* ============ Nivel 4: escribí tu carta ============ */

/** Una partida recién empezada, sin nada para deshacer. */
function partidaNueva() {
  return { board: createInitialBoard(), turn: "w", log: [], previous: null };
}

/**
 * Agrega una jugada al historial de la carta.
 *
 * El caso raro: que jueguen las negras con el historial vacío. Hoy no debería
 * pasar porque siempre empiezan las blancas, pero la partida se lee de
 * localStorage y un dato viejo o corrupto podría llegar así. Antes eso rompía
 * la app; ahora anota la jugada blanca desconocida como "…".
 */
function agregarJugada(log, turn, notation) {
  const copia = log.slice();
  if (turn === "w") {
    copia.push({ number: copia.length + 1, white: notation, black: null });
  } else if (copia.length === 0) {
    copia.push({ number: 1, white: "…", black: notation });
  } else {
    copia[copia.length - 1] = { ...copia[copia.length - 1], black: notation };
  }
  return copia;
}

/**
 * Escribe la notación de una jugada ya aplicada, agregando "+" o "#" según
 * si deja al rival en jaque o en jaque mate. Un solo lugar para esta lógica:
 * la usan tanto el click en el tablero como la reconstrucción de una carta.
 */
function notarJugada(boardPrevio, fromRow, fromCol, toRow, toCol, boardNuevo, turnQueMueve, opciones) {
  const rivalEsBlanco = turnQueMueve !== "w";
  const check = isInCheck(boardNuevo, rivalEsBlanco);
  const checkmate = check && !hasAnyLegalMoves(boardNuevo, rivalEsBlanco);
  return moveNotation(boardPrevio, fromRow, fromCol, toRow, toCol, { ...opciones, check, checkmate });
}

/**
 * Reconstruye una partida a partir de un texto pegado (la carta entera, o
 * sólo la lista de jugadas): arranca de la posición inicial y aplica cada
 * jugada en orden, la misma forma en que se jugarían a mano.
 *
 * Se corta ante la primera jugada que no se entiende o que ninguna pieza
 * propia puede hacer ahí, y devuelve el motivo en vez de una partida a medio
 * reconstruir: mejor pedir que se revise el texto que dejar el tablero en un
 * estado que no corresponde a ninguna carta real.
 *
 * @returns {{ partida: object } | { error: string }}
 */
function reconstruirPartida(texto) {
  const jugadas = extraerJugadas(texto);
  if (jugadas.length === 0) {
    return { error: "No encontré ninguna jugada en ese texto." };
  }

  let board = createInitialBoard();
  let turn = "w";
  let log = [];
  let previous = null;

  for (const jugada of jugadas) {
    for (const texto of [jugada.white, jugada.black]) {
      if (!texto) continue;
      const parsed = parseMove(texto);
      const resolved = parsed && resolveMove(board, turn, parsed);
      if (!resolved) {
        return { error: `No pude entender la jugada "${texto}" (número ${jugada.number}).` };
      }
      const { board: newBoard, promoted } = applyMove(
        board,
        resolved.fromRow,
        resolved.fromCol,
        resolved.toRow,
        resolved.toCol,
      );
      const notation = notarJugada(
        board,
        resolved.fromRow,
        resolved.fromCol,
        resolved.toRow,
        resolved.toCol,
        newBoard,
        turn,
        {
          capture: parsed.capture,
          promoted,
        },
      );
      previous = { board, turn, log };
      log = agregarJugada(log, turn, notation);
      board = newBoard;
      turn = turn === "w" ? "b" : "w";
    }
  }

  return { partida: { board, turn, log, previous } };
}

export default function Level4({ nombres, onCambiarNombres }) {
  // Tablero, turno, jugadas y la posición anterior van en un solo estado: así
  // guardar y deshacer son operaciones atómicas, sin riesgo de que queden
  // desincronizados entre sí.
  const [partida, setPartida] = useState(() => leerPartida() ?? partidaNueva());
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState([]);
  const [copied, setCopied] = useState(false);
  const [errorCopiado, setErrorCopiado] = useState(false);
  const cartaRef = useRef(null);
  const [confirmandoReinicio, setConfirmandoReinicio] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [textoPegado, setTextoPegado] = useState("");
  const [errorSubida, setErrorSubida] = useState("");
  const [confirmandoSubida, setConfirmandoSubida] = useState(false);

  const { board, turn, log } = partida;

  const descargarImagen = () => {
    const jugadasJugadas = log.reduce((total, j) => total + (j.white ? 1 : 0) + (j.black ? 1 : 0), 0);
    descargarTableroComoImagen(board, {
      flipped,
      nombreArchivo: `cartero-ajedrez-jugada-${jugadasJugadas}.png`,
    });
  };

  // Se derivan del tablero en cada render, no se guardan como estado aparte:
  // así nunca pueden quedar desincronizados de la posición real.
  const enJaque = useMemo(() => isInCheck(board, turn === "w"), [board, turn]);
  const enJaqueMate = useMemo(() => enJaque && !hasAnyLegalMoves(board, turn === "w"), [board, turn, enJaque]);
  const casillaDeJaque = useMemo(() => (enJaque ? findKing(board, turn === "w") : null), [board, turn, enJaque]);

  // Una partida por correspondencia dura semanas: recargar no puede borrarla.
  useEffect(() => {
    guardarPartida(partida);
  }, [partida]);

  const limpiarSeleccion = () => {
    setSelected(null);
    setMoves([]);
  };

  const empezarDeNuevo = () => {
    setPartida(partidaNueva());
    limpiarSeleccion();
    setCopied(false);
    setErrorCopiado(false);
    setConfirmandoReinicio(false);
  };

  // Deshace UNA jugada: alcanza para el caso real de haber tocado mal.
  const deshacer = () => {
    if (!partida.previous) return;
    setPartida({ ...partida.previous, previous: null });
    limpiarSeleccion();
    setCopied(false);
    setErrorCopiado(false);
    setConfirmandoReinicio(false);
  };

  // Reemplaza la partida actual por la que resulte de las jugadas pegadas.
  // Si ya había una partida en curso, pide confirmación antes de pisarla:
  // mismo criterio que "Empezar de nuevo".
  const subirJugadas = () => {
    const resultado = reconstruirPartida(textoPegado);
    if (resultado.error) {
      setErrorSubida(resultado.error);
      setConfirmandoSubida(false);
      return;
    }
    if (log.length > 0 && !confirmandoSubida) {
      setErrorSubida("");
      setConfirmandoSubida(true);
      return;
    }
    setPartida(resultado.partida);
    setTextoPegado("");
    setErrorSubida("");
    setConfirmandoSubida(false);
    limpiarSeleccion();
    setCopied(false);
    setErrorCopiado(false);
    setConfirmandoReinicio(false);
  };

  const handleClick = (row, col) => {
    const piece = board[row][col];
    if (selected) {
      const m = moves.find((mv) => mv.row === row && mv.col === col);
      if (m) {
        const { board: newBoard, promoted } = applyMove(board, selected.row, selected.col, row, col);
        // Se escribe con el tablero PREVIO: la desambiguación necesita ver
        // dónde estaban las otras piezas antes de mover.
        const notation = notarJugada(board, selected.row, selected.col, row, col, newBoard, turn, {
          capture: m.capture,
          promoted,
        });

        setPartida({
          board: newBoard,
          turn: turn === "w" ? "b" : "w",
          log: agregarJugada(log, turn, notation),
          // Se guarda la posición de antes para poder volver un paso atrás.
          previous: { board, turn, log },
        });
        limpiarSeleccion();
        setCopied(false);
        setErrorCopiado(false);
        setConfirmandoReinicio(false);
        return;
      }
      // clicking another own piece re-selects
      if (piece && isWhite(piece) === (turn === "w")) {
        setSelected({ row, col });
        setMoves(generateLegalMoves(board, row, col));
        return;
      }
      limpiarSeleccion();
      return;
    }
    if (piece && isWhite(piece) === (turn === "w")) {
      setSelected({ row, col });
      setMoves(generateLegalMoves(board, row, col));
    }
  };

  const cartaTexto = useMemo(() => textoCarta(log, nombres), [log, nombres]);

  /**
   * Si el clipboard no está disponible (contexto no seguro, permisos
   * denegados, navegador viejo), no basta con no hacer nada: hay que avisar y
   * dejar el texto listo para copiar a mano. Seleccionarlo automáticamente
   * hace que alcance con un Ctrl+C / Cmd+C, o "Copiar" desde el menú del
   * celular.
   */
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(cartaTexto);
      setCopied(true);
      setErrorCopiado(false);
    } catch {
      setCopied(false);
      setErrorCopiado(true);
      const nodo = cartaRef.current;
      const seleccion = typeof window !== "undefined" ? window.getSelection?.() : null;
      if (nodo && seleccion) {
        const rango = document.createRange();
        rango.selectNodeContents(nodo);
        seleccion.removeAllRanges();
        seleccion.addRange(rango);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start justify-center">
      <div className="flex flex-col items-center gap-3 w-full lg:w-auto">
        <div className="flex items-center gap-2">
          <div
            role="status"
            aria-live="polite"
            style={{ fontFamily: FONTS.baloo, color: COLORS.tealDark }}
            className="font-bold text-sm"
          >
            {enJaqueMate ? (
              // En jaque mate no hay "próximo turno": el juego terminó. Ganó
              // quien acaba de mover, es decir el color contrario al que está
              // trabado sin jugadas (`turn`).
              <span style={{ color: COLORS.coral }}>
                ¡Jaque mate! Ganaron las {turn === "w" ? "Negras" : "Blancas"} {turn === "w" ? "⚫" : "⚪"} 🏆
              </span>
            ) : (
              <>
                Juegan las {turn === "w" ? "Blancas" : "Negras"} {turn === "w" ? "⚪" : "⚫"}
                {enJaque && <span style={{ color: COLORS.coral }}> · ¡Jaque! ⚠️</span>}
              </>
            )}
          </div>
          <button
            onClick={() => setFlipped((f) => !f)}
            title="Girar el tablero"
            aria-label="Girar el tablero"
            style={{
              fontFamily: FONTS.baloo,
              background: "transparent",
              color: COLORS.tealDark,
              border: `2px solid ${COLORS.goldSoft}`,
            }}
            className="w-6 h-6 rounded-full text-xs leading-none shadow-sm"
          >
            🔄
          </button>
          <button
            onClick={descargarImagen}
            title="Descargar imagen del tablero"
            aria-label="Descargar imagen del tablero"
            style={{
              fontFamily: FONTS.baloo,
              background: "transparent",
              color: COLORS.tealDark,
              border: `2px solid ${COLORS.goldSoft}`,
            }}
            className="w-6 h-6 rounded-full text-xs leading-none shadow-sm"
          >
            📷
          </button>
        </div>
        <Board
          board={board}
          onSquareClick={handleClick}
          selectedSquare={selected}
          legalMoves={moves}
          flipped={flipped}
          checkSquare={casillaDeJaque}
        />

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={deshacer}
            disabled={!partida.previous}
            style={{
              fontFamily: FONTS.baloo,
              background: partida.previous ? COLORS.teal : "transparent",
              color: partida.previous ? "#fff" : COLORS.inkSoft,
              border: `2px solid ${partida.previous ? COLORS.teal : COLORS.goldSoft}`,
              cursor: partida.previous ? "pointer" : "default",
            }}
            className="px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors"
          >
            ↩ Deshacer jugada
          </button>

          {confirmandoReinicio ? (
            // En columna, no en fila: si va todo en una sola línea, este bloque
            // es más ancho que los botones normales y estira el tablero con él
            // (comparten la misma columna de ancho automático).
            <div className="flex flex-col items-center gap-1.5">
              <span style={{ fontFamily: FONTS.nunito, color: COLORS.coral }} className="text-xs font-bold">
                ¿Seguro? Se borra la partida
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={empezarDeNuevo}
                  style={{ fontFamily: FONTS.baloo, background: COLORS.coral, color: "#fff" }}
                  className="px-3 py-1.5 rounded-full text-sm font-bold shadow"
                >
                  Sí, borrar
                </button>
                <button
                  onClick={() => setConfirmandoReinicio(false)}
                  style={{ fontFamily: FONTS.baloo, background: COLORS.paperCard, color: COLORS.tealDark }}
                  className="px-3 py-1.5 rounded-full text-sm font-bold shadow"
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmandoReinicio(true)}
              style={{
                fontFamily: FONTS.baloo,
                background: "transparent",
                color: COLORS.coral,
                border: `2px solid ${COLORS.coral}`,
              }}
              className="px-4 py-1.5 rounded-full text-sm font-bold"
            >
              Empezar de nuevo
            </button>
          )}
        </div>

        <p style={{ fontFamily: FONTS.nunito, color: COLORS.inkSoft }} className="text-[11px] text-center">
          Tu partida se guarda sola: podés cerrar y seguir después. 💾
        </p>
      </div>

      <div
        style={{
          fontFamily: FONTS.caveat,
          background: COLORS.paperCard,
          border: `2px dashed ${COLORS.gold}`,
          color: COLORS.ink,
        }}
        className="rounded-2xl p-4 w-full lg:w-72 shadow-md"
      >
        <p style={{ fontFamily: FONTS.baloo, color: COLORS.tealDark }} className="text-sm font-bold mb-2 not-italic">
          ✉️ Tu carta{nombres.destinataria ? ` para ${nombres.destinataria}` : ""}
        </p>

        <div className="flex flex-col gap-1.5 mb-3 not-italic">
          <label style={{ fontFamily: FONTS.nunito }} className="flex flex-col gap-0.5">
            <span style={{ color: COLORS.inkSoft }} className="text-[11px] font-bold">
              ¿A quién le escribís?
            </span>
            <input
              type="text"
              value={nombres.destinataria}
              onChange={(e) => onCambiarNombres({ ...nombres, destinataria: recortarMientrasEscribe(e.target.value) })}
              placeholder="Su nombre"
              style={{ fontFamily: FONTS.nunito, border: `1.5px solid ${COLORS.goldSoft}`, color: COLORS.ink }}
              className="rounded-lg px-2 py-1 text-xs w-full"
            />
          </label>
          <label style={{ fontFamily: FONTS.nunito }} className="flex flex-col gap-0.5">
            <span style={{ color: COLORS.inkSoft }} className="text-[11px] font-bold">
              ¿Quién escribe?
            </span>
            <input
              type="text"
              value={nombres.remitente}
              onChange={(e) => onCambiarNombres({ ...nombres, remitente: recortarMientrasEscribe(e.target.value) })}
              placeholder="Tu nombre"
              style={{ fontFamily: FONTS.nunito, border: `1.5px solid ${COLORS.goldSoft}`, color: COLORS.ink }}
              className="rounded-lg px-2 py-1 text-xs w-full"
            />
          </label>
        </div>
        <pre
          ref={cartaRef}
          style={{ fontFamily: FONTS.caveat, fontSize: "1.15rem", whiteSpace: "pre-wrap", color: COLORS.ink }}
          className="min-h-[120px] leading-snug"
        >
          {log.length === 0 ? "Todavía no jugaste ninguna jugada..." : cartaTexto}
        </pre>
        {log.length > 0 && (
          <button
            onClick={copiar}
            style={{ fontFamily: FONTS.nunito, background: COLORS.teal, color: "#fff" }}
            className="mt-2 px-3 py-1.5 rounded-full text-xs font-bold"
          >
            {copied ? "¡Copiada! ✅" : "Copiar carta"}
          </button>
        )}
        {errorCopiado && (
          <p style={{ fontFamily: FONTS.nunito, color: COLORS.coral }} className="text-[11px] font-bold mt-1">
            No se pudo copiar sola. Ya te dejé el texto de arriba seleccionado: copialo con Ctrl+C (o "Copiar" desde el
            celular).
          </p>
        )}

        <div className="mt-3 pt-3 not-italic" style={{ borderTop: `1px dashed ${COLORS.gold}` }}>
          <label style={{ fontFamily: FONTS.nunito }} className="flex flex-col gap-0.5">
            <span style={{ color: COLORS.inkSoft }} className="text-[11px] font-bold">
              ¿Te llegó una carta? Pegala acá para seguir la partida
            </span>
            <textarea
              value={textoPegado}
              onChange={(e) => {
                setTextoPegado(e.target.value);
                setErrorSubida("");
                setConfirmandoSubida(false);
              }}
              placeholder={"1. e4  e5\n2. Cf3  Cc6"}
              rows={3}
              style={{ fontFamily: FONTS.nunito, border: `1.5px solid ${COLORS.goldSoft}`, color: COLORS.ink }}
              className="rounded-lg px-2 py-1 text-xs w-full"
            />
          </label>

          {errorSubida && (
            <p style={{ fontFamily: FONTS.nunito, color: COLORS.coral }} className="text-[11px] font-bold mt-1">
              {errorSubida}
            </p>
          )}

          {confirmandoSubida ? (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span style={{ fontFamily: FONTS.nunito, color: COLORS.coral }} className="text-[11px] font-bold">
                ¿Seguro? Se reemplaza la partida actual
              </span>
              <button
                onClick={subirJugadas}
                style={{ fontFamily: FONTS.baloo, background: COLORS.coral, color: "#fff" }}
                className="px-3 py-1 rounded-full text-xs font-bold shadow"
              >
                Sí, reemplazar
              </button>
              <button
                onClick={() => setConfirmandoSubida(false)}
                style={{ fontFamily: FONTS.baloo, background: COLORS.paperCard, color: COLORS.tealDark }}
                className="px-3 py-1 rounded-full text-xs font-bold shadow"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={subirJugadas}
              disabled={!textoPegado.trim()}
              style={{
                fontFamily: FONTS.nunito,
                background: textoPegado.trim() ? COLORS.tealDark : "transparent",
                color: textoPegado.trim() ? "#fff" : COLORS.inkSoft,
                border: `1.5px solid ${textoPegado.trim() ? COLORS.tealDark : COLORS.goldSoft}`,
                cursor: textoPegado.trim() ? "pointer" : "default",
              }}
              className="mt-2 px-3 py-1.5 rounded-full text-xs font-bold"
            >
              Subir jugadas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
