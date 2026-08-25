import { PIECE_LETTERS } from "../chess/notation.js";

/* Los textos de las piezas. Las letras de notación vienen de chess/notation.js
   para que haya un solo lugar donde estén definidas. */
export const PIECE_INFO = {
  P: {
    name: "Peón",
    letter: PIECE_LETTERS.P,
    desc: "Camina derecho, come en diagonal. ¡Es lento pero de a muchos!",
    value: "1 punto",
    funFact: "Si un peón llega hasta el final del tablero, ¡se transforma en otra pieza! Casi siempre en Dama.",
    example: "Si mueve de e2 a e4, se escribe: e4",
  },
  N: {
    name: "Caballo",
    letter: PIECE_LETTERS.N,
    desc: "Salta en forma de L. Es el único que salta sobre otras piezas.",
    value: "3 puntos",
    funFact: "Es la única pieza que puede moverse al principio de la partida sin que nadie le abra camino.",
    example: "Si salta a f3, se escribe: Cf3",
  },
  B: {
    name: "Alfil",
    letter: PIECE_LETTERS.B,
    desc: "Se mueve en diagonal, siempre por el mismo color de casilla.",
    value: "3 puntos",
    funFact: "Cada jugador tiene un alfil de casillas claras y otro de casillas oscuras, ¡y nunca cambian de color!",
    example: "Si va a g5, se escribe: Ag5",
  },
  R: {
    name: "Torre",
    letter: PIECE_LETTERS.R,
    desc: "Se mueve en línea recta: adelante, atrás o al costado.",
    value: "5 puntos",
    funFact: "Empieza encerrada en la esquina, pero cuando el tablero se abre se vuelve durísima de enfrentar.",
    example: "Si va a d8, se escribe: Td8",
  },
  Q: {
    name: "Dama",
    letter: PIECE_LETTERS.Q,
    desc: "La más poderosa: combina Torre + Alfil.",
    value: "9 puntos",
    funFact: "Es la pieza más fuerte, ¡pero perderla no significa perder la partida! Solo el Rey es insustituible.",
    example: "Si va a h5, se escribe: Dh5",
  },
  K: {
    name: "Rey",
    letter: PIECE_LETTERS.K,
    desc: "Un paso para cualquier lado. ¡Hay que cuidarlo siempre!",
    value: "No tiene puntos",
    funFact: "No se compara en puntos con las demás piezas: si lo atrapan (jaque mate), se termina la partida.",
    example: "Si va a f1, se escribe: Rf1",
  },
};

// prettier-ignore
export const UNICODE = {
  wP: "♙", wN: "♘", wB: "♗", wR: "♖", wQ: "♕", wK: "♔",
  bP: "♟", bN: "♞", bB: "♝", bR: "♜", bQ: "♛", bK: "♚",
};

/**
 * Glyph para dibujar la pieza en el tablero (Board.jsx pinta el color con
 * CSS encima, según isWhite).
 *
 * Siempre devuelve la forma "negra" (rellena) de Unicode, sea cual sea el
 * color real de la pieza: la forma "blanca" (♙♘♗♖♕♔) es un contorno hueco
 * por diseño de la fuente, sin área interior — pintarla de blanco no rellena
 * nada, sólo se nota el hueco (más aún sobre una casilla oscura). La forma
 * "negra" (♟♞♝♜♛♚) sí es un área sólida, así que rellena de verdad sea cual
 * sea el color que se le ponga por CSS.
 */
export const pieceGlyph = (piece) => {
  if (!piece) return "";
  return UNICODE["b" + piece.toUpperCase()];
};
