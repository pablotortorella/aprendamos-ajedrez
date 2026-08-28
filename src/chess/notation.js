/* ============ Notación algebraica española ============
   Traduce un movimiento a texto: el formato que se manda por carta.
   Usa las letras españolas (C, A, T, D, R), que son las que se comparten por
   escrito. Funciones puras: dependen sólo del tablero que reciben. */

import { FILES, algebraic, generateLegalMoves, generateMoves, isWhite, pieceType } from "./engine.js";

/** Única fuente de verdad de las letras. PIECE_INFO las toma de acá. */
export const PIECE_LETTERS = {
  P: "",
  N: "C",
  B: "A",
  R: "T",
  Q: "D",
  K: "R",
};

/**
 * Calcula el prefijo que hace falta para que la jugada no sea ambigua.
 *
 * Si dos caballos pueden llegar a d2, escribir "Cd2" no alcanza: del otro lado
 * de la carta no se sabe cuál se movió. La regla estándar es agregar la columna
 * de origen ("Cbd2"); si las dos piezas comparten columna, la fila ("C1d2"); y
 * si comparten las dos (posible con tres piezas), la casilla entera.
 *
 * Peones y rey nunca lo necesitan: el peón se desambigua solo con su columna al
 * capturar, y rey hay uno solo.
 *
 * Nota: como los movimientos son pseudo-legales, una pieza clavada contra su
 * propio rey cuenta igual como candidata. Eso puede hacer que la app escriba
 * "Cbd2" donde "Cd2" ya alcanzaba. Se prefiere ese error: de más es siempre
 * legible, de menos es ambiguo.
 */
export function disambiguation(board, fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  if (!piece) return "";
  const type = pieceType(piece);
  if (type === "P" || type === "K") return "";

  const white = isWhite(piece);
  const candidatas = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (r === fromRow && c === fromCol) continue;
      const otra = board[r][c];
      if (!otra || pieceType(otra) !== type || isWhite(otra) !== white) continue;
      if (generateMoves(board, r, c).some((m) => m.row === toRow && m.col === toCol)) {
        candidatas.push({ row: r, col: c });
      }
    }
  }
  if (candidatas.length === 0) return "";

  const compartenColumna = candidatas.some((p) => p.col === fromCol);
  if (!compartenColumna) return FILES[fromCol];

  const compartenFila = candidatas.some((p) => p.row === fromRow);
  if (!compartenFila) return String(8 - fromRow);

  return algebraic(fromRow, fromCol);
}

/**
 * Escribe una jugada en notación algebraica española.
 *
 * IMPORTANTE: `board` tiene que ser el tablero ANTES del movimiento, porque la
 * desambiguación necesita ver dónde estaban las demás piezas.
 *
 * @param {Array} board          Tablero previo a la jugada.
 * @param {number} fromRow       Fila de origen.
 * @param {number} fromCol       Columna de origen.
 * @param {number} toRow         Fila de destino.
 * @param {number} toCol         Columna de destino.
 * @param {object} [opciones]
 * @param {boolean} [opciones.capture]    Si la jugada come una pieza.
 * @param {boolean} [opciones.promoted]   Si un peón corona (siempre a Dama).
 * @param {boolean} [opciones.check]      Si deja al rey rival en jaque.
 * @param {boolean} [opciones.checkmate]  Si lo deja en jaque mate (implica check).
 * @returns {string} Por ejemplo: "e4", "Cbd2", "Axf6", "exd5", "e8=D", "Dh5+", "Dh7#",
 *   "O-O" (enroque corto), "O-O-O" (enroque largo).
 */
export function moveNotation(board, fromRow, fromCol, toRow, toCol, opciones = {}) {
  const { capture = false, promoted = false, check = false, checkmate = false } = opciones;
  const piece = board[fromRow][fromCol];
  if (!piece) return "";

  const type = pieceType(piece);
  const dest = algebraic(toRow, toCol);
  const sufijoJaque = checkmate ? "#" : check ? "+" : "";

  // El enroque no se escribe como una jugada de rey normal: en un movimiento
  // legal, un rey que se mueve 2 casillas sólo puede ser eso, así que no hace
  // falta que quien llama lo señale aparte.
  if (type === "K" && Math.abs(toCol - fromCol) === 2) {
    return (toCol > fromCol ? "O-O" : "O-O-O") + sufijoJaque;
  }

  if (type === "P") {
    let n = capture ? `${FILES[fromCol]}x${dest}` : dest;
    if (promoted) n += "=D";
    return n + sufijoJaque;
  }

  const letra = PIECE_LETTERS[type];
  const desambigua = disambiguation(board, fromRow, fromCol, toRow, toCol);
  return `${letra}${desambigua}${capture ? "x" : ""}${dest}${sufijoJaque}`;
}

/** Inverso de PIECE_LETTERS, para leer una jugada en vez de escribirla. */
const LETTER_TO_TYPE = Object.fromEntries(
  Object.entries(PIECE_LETTERS)
    .filter(([type]) => type !== "P")
    .map(([type, letra]) => [letra, type]),
);

/**
 * Interpreta un token de notación algebraica española suelto (sin el número
 * de jugada adelante). No mira el tablero: sólo separa la forma del texto en
 * sus partes. La resolución contra una posición concreta la hace resolveMove.
 *
 * Tolera el `+`/`#` de jaque y jaque mate si aparecen, aunque hoy la app
 * todavía no los escribe.
 *
 * @returns {{type: string, disambig: string, capture: boolean, dest: string,
 *   promoted: boolean} | {type: "K", castle: "K"|"Q"} | null} null si el
 *   token no tiene forma de jugada.
 */
export function parseMove(token) {
  let t = typeof token === "string" ? token.trim() : "";
  if (!t) return null;
  t = t.replace(/[+#]+$/, "");

  // El enroque no tiene casilla de destino en el texto (de qué lado depende
  // de a quién le toca jugar, no del token): se resuelve aparte en
  // resolveMove. Tolera "0-0" además de "O-O": son indistinguibles a mano.
  if (t === "O-O" || t === "0-0") return { type: "K", castle: "K" };
  if (t === "O-O-O" || t === "0-0-0") return { type: "K", castle: "Q" };

  let promoted = false;
  if (/=D$/.test(t)) {
    promoted = true;
    t = t.slice(0, -2);
  }

  let type = "P";
  if (LETTER_TO_TYPE[t[0]]) {
    type = LETTER_TO_TYPE[t[0]];
    t = t.slice(1);
  }

  const capture = t.includes("x");
  if (capture) t = t.replace("x", "");

  if (t.length < 2) return null;
  const dest = t.slice(-2);
  const disambig = t.slice(0, -2);

  if (!/^[a-h][1-8]$/.test(dest)) return null;
  if (disambig && !/^[a-h]$|^[1-8]$|^[a-h][1-8]$/.test(disambig)) return null;

  return { type, disambig, capture, dest, promoted };
}

/**
 * Busca en el tablero la jugada que escribió `parsed` (salida de parseMove) y
 * devuelve sus coordenadas de origen y destino, o null si ninguna pieza propia
 * puede hacer esa jugada ahí (texto inválido, o jugada ilegal en esa posición).
 *
 * Usa movimientos LEGALES (no deja al propio rey en jaque): una carta pegada
 * respeta las mismas reglas que jugar a mano.
 *
 * `context` es el mismo `{ castling, enPassant }` que generateLegalMoves: sin
 * él, ni el enroque ni una captura al paso van a aparecer como candidatas.
 */
export function resolveMove(board, turn, parsed, context = {}) {
  if (!parsed) return null;
  const white = turn === "w";

  if (parsed.castle) {
    const homeRow = white ? 7 : 0;
    const destCol = parsed.castle === "K" ? 6 : 2;
    const move = generateLegalMoves(board, homeRow, 4, context).find((m) => m.row === homeRow && m.col === destCol);
    if (!move) return null;
    return { fromRow: homeRow, fromCol: 4, toRow: homeRow, toCol: destCol };
  }

  const { type, disambig, capture, dest } = parsed;
  const destCol = FILES.indexOf(dest[0]);
  const destRow = 8 - Number(dest[1]);
  if (destCol < 0) return null;

  const candidatas = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || pieceType(piece) !== type || isWhite(piece) !== white) continue;
      const move = generateLegalMoves(board, r, c, context).find((m) => m.row === destRow && m.col === destCol);
      if (!move || move.capture !== capture) continue;
      if (disambig.length === 2 && algebraic(r, c) !== disambig) continue;
      if (disambig.length === 1 && /[a-h]/.test(disambig) && FILES[c] !== disambig) continue;
      if (disambig.length === 1 && /[1-8]/.test(disambig) && String(8 - r) !== disambig) continue;
      candidatas.push({ row: r, col: c });
    }
  }
  if (candidatas.length !== 1) return null;
  return { fromRow: candidatas[0].row, fromCol: candidatas[0].col, toRow: destRow, toCol: destCol };
}
