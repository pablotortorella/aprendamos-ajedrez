/* ============ Motor de movimientos ============
   Funciones puras, sin React y sin nada de interfaz: entra un tablero, sale
   una lista de movimientos. Eso es lo que las hace testeables.

   Representación del tablero: matriz de 8x8, `board[fila][columna]`, donde la
   fila 0 es la 8 del ajedrez y la columna 0 es la "a". Las piezas blancas van
   en mayúscula (P N B R Q K) y las negras en minúscula. Una casilla vacía es
   null.

   generateMoves da movimientos PSEUDO-LEGALES: no mira si la jugada deja al
   rey propio en jaque. generateLegalMoves sí lo filtra, y es lo que hay que
   usar para jugar de verdad; generateMoves queda como su bloque de base y
   para el nivel 3, que sólo quiere mostrar cómo se mueve una pieza sola en
   un tablero vacío, sin noción de jaque. */

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

// prettier-ignore
const DIAG = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
// prettier-ignore
const ORTH = [[-1, 0], [1, 0], [0, -1], [0, 1]];
// prettier-ignore
const KNIGHT_OFFSETS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const KING_OFFSETS = [...DIAG, ...ORTH];

/**
 * Aplica un movimiento y devuelve el tablero resultante (no muta el original).
 * Corona automáticamente a Dama: es la única coronación que la app conoce.
 *
 * No valida legalidad ni que la jugada exista: eso es responsabilidad de quien
 * llama (el click en el tablero, o el que reconstruye una partida pegada).
 */
export function applyMove(board, fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const type = pieceType(piece);
  const white = isWhite(piece);
  const newBoard = cloneBoard(board);
  newBoard[fromRow][fromCol] = null;
  let finalPiece = piece;
  let promoted = false;
  if (type === "P" && (toRow === 0 || toRow === 7)) {
    finalPiece = white ? "Q" : "q";
    promoted = true;
  }
  newBoard[toRow][toCol] = finalPiece;
  return { board: newBoard, promoted };
}

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

/** Casillas que un peón amenaza, coma o no coma algo ahí: para detectar jaque. */
function pawnAttackSquares(row, col, white) {
  const nr = row + (white ? -1 : 1);
  return [-1, 1]
    .map((dc) => ({ row: nr, col: col + dc }))
    .filter(({ row: r, col: c }) => r >= 0 && r < 8 && c >= 0 && c < 8);
}

/**
 * ¿Alguna pieza de color `byWhite` ataca la casilla (row, col)? No importa si
 * la casilla está ocupada o no. Se usa para saber si el rey está en jaque, y
 * en el futuro podría servir también para el enroque (no soportado todavía).
 */
export function isSquareAttacked(board, row, col, byWhite) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || isWhite(piece) !== byWhite) continue;
      if (pieceType(piece) === "P") {
        if (pawnAttackSquares(r, c, byWhite).some((s) => s.row === row && s.col === col)) return true;
        continue;
      }
      if (generateMoves(board, r, c).some((m) => m.row === row && m.col === col)) return true;
    }
  }
  return false;
}

/** Busca el rey de ese color. Devuelve null si no está (no debería pasar en una partida real). */
export function findKing(board, white) {
  const target = white ? "K" : "k";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === target) return { row: r, col: c };
    }
  }
  return null;
}

/** ¿El rey de ese color está en jaque en esta posición? */
export function isInCheck(board, white) {
  const king = findKing(board, white);
  if (!king) return false;
  return isSquareAttacked(board, king.row, king.col, !white);
}

/**
 * Los movimientos de generateMoves que además no dejan al propio rey en
 * jaque: son los que de verdad se pueden jugar. Esto es lo que cierra el
 * agujero de "comerse el rey": una jugada nunca deja al rey capturable,
 * porque quien estaba en jaque tiene que resolverlo antes de mover otra cosa.
 */
export function generateLegalMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];
  const white = isWhite(piece);
  return generateMoves(board, row, col).filter((m) => {
    const { board: after } = applyMove(board, row, col, m.row, m.col);
    return !isInCheck(after, white);
  });
}

/** ¿Ese color tiene al menos una jugada legal? Si no, y está en jaque, es mate. */
export function hasAnyLegalMoves(board, white) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && isWhite(piece) === white && generateLegalMoves(board, r, c).length > 0) return true;
    }
  }
  return false;
}
