/* ============ Motor de movimientos ============
   Funciones puras, sin React y sin nada de interfaz: entra un tablero, sale
   una lista de movimientos. Eso es lo que las hace testeables.

   Representación del tablero: matriz de 8x8, `board[fila][columna]`, donde la
   fila 0 es la 8 del ajedrez y la columna 0 es la "a". Las piezas blancas van
   en mayúscula (P N B R Q K) y las negras en minúscula. Una casilla vacía es
   null.

   Ojo: los movimientos son PSEUDO-LEGALES. No se verifica si la jugada deja al
   rey propio en jaque. Es una limitación deliberada de esta etapa. */

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

/** Convierte fila/columna internas a coordenada de ajedrez: (0,4) -> "e8". */
export const algebraic = (row, col) => `${FILES[col]}${8 - row}`;

export function isWhite(piece) {
  return piece === piece.toUpperCase();
}

export function pieceType(piece) {
  return piece.toUpperCase();
}

export function createInitialBoard() {
  const back = ["R", "N", "B", "Q", "K", "B", "N", "R"];
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let c = 0; c < 8; c++) {
    board[0][c] = back[c].toLowerCase();
    board[1][c] = "p";
    board[6][c] = "P";
    board[7][c] = back[c];
  }
  return board;
}

export function createEmptyBoard() {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

export function cloneBoard(board) {
  return board.map((row) => row.slice());
}

/** Piezas que se deslizan hasta chocar: alfil, torre y dama. */
function slide(board, row, col, white, directions) {
  const moves = [];
  for (const [dr, dc] of directions) {
    let r = row + dr,
      c = col + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const target = board[r][c];
      if (!target) {
        moves.push({ row: r, col: c, capture: false });
      } else {
        if (isWhite(target) !== white) moves.push({ row: r, col: c, capture: true });
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return moves;
}

/** Piezas de un solo salto: caballo y rey. */
function stepMoves(board, row, col, white, offsets) {
  const moves = [];
  for (const [dr, dc] of offsets) {
    const r = row + dr,
      c = col + dc;
    if (r < 0 || r > 7 || c < 0 || c > 7) continue;
    const target = board[r][c];
    if (!target || isWhite(target) !== white) {
      moves.push({ row: r, col: c, capture: !!target });
    }
  }
  return moves;
}

const DIAG = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const ORTH = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const KNIGHT_OFFSETS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const KING_OFFSETS = [...DIAG, ...ORTH];

/**
 * Devuelve los destinos posibles de la pieza que está en (row, col).
 * Cada movimiento es `{ row, col, capture }`. Si la casilla está vacía, [].
 */
export function generateMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];
  const white = isWhite(piece);
  const type = pieceType(piece);

  if (type === "P") {
    const moves = [];
    const dir = white ? -1 : 1;
    const startRow = white ? 6 : 1;
    const oneStep = row + dir;
    if (oneStep >= 0 && oneStep < 8 && !board[oneStep][col]) {
      moves.push({ row: oneStep, col, capture: false });
      const twoStep = row + 2 * dir;
      if (row === startRow && !board[twoStep][col]) {
        moves.push({ row: twoStep, col, capture: false });
      }
    }
    for (const dc of [-1, 1]) {
      const nc = col + dc;
      const nr = row + dir;
      if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
      const target = board[nr][nc];
      if (target && isWhite(target) !== white) moves.push({ row: nr, col: nc, capture: true });
    }
    return moves;
  }
  if (type === "N") return stepMoves(board, row, col, white, KNIGHT_OFFSETS);
  if (type === "K") return stepMoves(board, row, col, white, KING_OFFSETS);
  if (type === "B") return slide(board, row, col, white, DIAG);
  if (type === "R") return slide(board, row, col, white, ORTH);
  if (type === "Q") return slide(board, row, col, white, [...DIAG, ...ORTH]);
  return [];
}
