/* ============ Notación algebraica española ============
   Traduce un movimiento a texto: el formato que se manda por carta.
   Usa las letras españolas (C, A, T, D, R), que son las que se comparten por
   escrito. Funciones puras: dependen sólo del tablero que reciben. */

import { FILES, algebraic, generateMoves, isWhite, pieceType } from "./engine.js";

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
 * @param {boolean} [opciones.capture]   Si la jugada come una pieza.
 * @param {boolean} [opciones.promoted]  Si un peón corona (siempre a Dama).
 * @returns {string} Por ejemplo: "e4", "Cbd2", "Axf6", "exd5", "e8=D".
 */
export function moveNotation(board, fromRow, fromCol, toRow, toCol, opciones = {}) {
  const { capture = false, promoted = false } = opciones;
  const piece = board[fromRow][fromCol];
  if (!piece) return "";

  const type = pieceType(piece);
  const dest = algebraic(toRow, toCol);

  if (type === "P") {
    let n = capture ? `${FILES[fromCol]}x${dest}` : dest;
    if (promoted) n += "=D";
    return n;
  }

  const letra = PIECE_LETTERS[type];
  const desambigua = disambiguation(board, fromRow, fromCol, toRow, toCol);
  return `${letra}${desambigua}${capture ? "x" : ""}${dest}`;
}
