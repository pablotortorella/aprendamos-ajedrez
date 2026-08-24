import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { algebraic, createEmptyBoard } from "../chess/engine.js";
import Board from "../components/Board.jsx";
import { guardarPuntos, leerPuntos } from "../storage.js";
import { COLORS, FONTS } from "../theme.js";

/* ============ Nivel 1: coordenadas ============ */

export default function Level1() {
  const emptyBoard = useMemo(() => createEmptyBoard(), []);
  const [target, setTarget] = useState(() => ({
    row: Math.floor(Math.random() * 8),
    col: Math.floor(Math.random() * 8),
  }));
  const [feedback, setFeedback] = useState(null);
  const [flashSquare, setFlashSquare] = useState(null);
  const [score, setScore] = useState(leerPuntos);
  const [misses, setMisses] = useState(0);
  const temporizador = useRef(null);

  // La pista dorada no es un estado aparte: es simplemente "ya erró dos veces".
  // Derivarlo evita que pueda quedar desincronizado de los errores.
  const reveal = misses >= 2;

  // El puntaje sobrevive a recargar la página.
  useEffect(() => {
    guardarPuntos(score);
  }, [score]);

  /** Un solo temporizador a la vez; el anterior se cancela. */
  const programar = useCallback((fn, ms) => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => {
      temporizador.current = null;
      fn();
    }, ms);
  }, []);

  // Si se cambia de nivel con un temporizador pendiente, hay que cancelarlo.
  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  const newTarget = useCallback(() => {
    setTarget({ row: Math.floor(Math.random() * 8), col: Math.floor(Math.random() * 8) });
    setFeedback(null);
    setFlashSquare(null);
    setMisses(0);
  }, []);

  const handleClick = (row, col) => {
    // Mientras se festeja el acierto el tablero no acepta más toques: si no,
    // volver a tocar la casilla correcta sumaba un punto por cada toque.
    if (feedback === "bien") return;

    if (row === target.row && col === target.col) {
      setFeedback("bien");
      setFlashSquare({ row, col, result: "bien" });
      setScore((s) => s + 1);
      programar(newTarget, 700);
      return;
    }

    setFeedback("mal");
    setFlashSquare({ row, col, result: "mal" });
    setMisses((m) => m + 1);
    programar(() => {
      setFlashSquare(null);
      setFeedback(null);
    }, 500);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div style={{ fontFamily: FONTS.baloo, color: COLORS.tealDark }} className="text-center">
        <p className="text-lg sm:text-xl font-bold">
          ¿Dónde está <span style={{ color: COLORS.coral }}>{algebraic(target.row, target.col)}</span>?
        </p>
        <p style={{ fontFamily: FONTS.nunito, color: COLORS.inkSoft }} className="text-sm mt-1">
          Tocá esa casilla en el tablero. Las letras van de a a h, los números de 1 a 8.
        </p>
      </div>
      <Board
        board={emptyBoard}
        onSquareClick={handleClick}
        flashSquare={flashSquare}
        revealSquare={reveal ? target : null}
      />
      <div className="flex items-center gap-3">
        <span
          style={{
            fontFamily: FONTS.nunito,
            color: feedback === "bien" ? "#2E8B57" : feedback === "mal" ? COLORS.coral : COLORS.inkSoft,
          }}
          className="font-bold text-sm h-5"
        >
          {feedback === "bien"
            ? "¡Muy bien! 🎉"
            : feedback === "mal" && reveal
              ? "¡Mirá, ahí es! (la casilla dorada) 👉"
              : feedback === "mal"
                ? "Ahí no era, ¡probá de nuevo!"
                : "\u00A0"}
        </span>
      </div>
      <div style={{ fontFamily: FONTS.baloo, color: COLORS.gold }} className="text-base font-extrabold">
        Puntos: {score}
      </div>
    </div>
  );
}
