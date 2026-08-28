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

/** Estado inicial de los derechos de enroque: los cuatro lados todavía disponibles. */
export function initialCastlingRights() {
  return { wK: true, wQ: true, bK: true, bQ: true };
}

/**
 * Los derechos de enroque se pierden para siempre, no se recuperan: si el rey
 * o esa torre se movieron alguna vez (o la torre fue comida en su propia
 * casilla de origen), ya no se puede enrocar de ese lado aunque una pieza
 * vuelva a esa casilla más tarde. Por eso hace falta guardarlos aparte del
 * tablero: la posición sola no alcanza para saber si "todavía se puede".
 */
function updateCastlingRights(rights, fromRow, fromCol, toRow, toCol) {
  if (!rights) return rights;
  const next = { ...rights };
  const perder = (r, c) => {
    if (r === 7 && c === 4) {
      next.wK = false;
      next.wQ = false;
    } else if (r === 0 && c === 4) {
      next.bK = false;
      next.bQ = false;
    } else if (r === 7 && c === 0) next.wQ = false;
    else if (r === 7 && c === 7) next.wK = false;
    else if (r === 0 && c === 0) next.bQ = false;
    else if (r === 0 && c === 7) next.bK = false;
  };
  perder(fromRow, fromCol); // la pieza se movió desde ahí
  perder(toRow, toCol); // o la comieron ahí
  return next;
}

/**
 * La casilla que un peón rival podría capturar al paso en la PRÓXIMA jugada.
 * Sólo existe justo después de que un peón avanza dos casillas, y dura una
 * sola jugada: se recalcula desde cero en cada movimiento (no se "apaga" a
 * mano), así que cualquier otra jugada la borra sola.
 */
function nextEnPassantTarget(piece, fromRow, fromCol, toRow) {
  if (pieceType(piece) === "P" && Math.abs(toRow - fromRow) === 2) {
    return { row: (fromRow + toRow) / 2, col: fromCol };
  }
  return null;
}

/**
 * Aplica un movimiento y devuelve el tablero resultante (no muta el original).
 * Corona automáticamente a Dama: es la única coronación que la app conoce.
 *
 * El enroque (el rey se mueve 2 casillas) y la captura al paso (un peón se
 * mueve en diagonal a una casilla vacía) no hace falta señalarlos aparte: en
 * una jugada legal esa forma sólo puede significar eso, así que se detectan
 * solos mirando la geometría del movimiento.
 *
 * `castling` es opcional: si no llega, el `castling` devuelto también es
 * `undefined` (isSquareAttacked/generateLegalMoves llaman así, porque sólo
 * les importa el tablero resultante). El `enPassant` devuelto no necesita
 * ningún estado anterior como entrada: siempre se puede calcular de cero
 * mirando nada más esta jugada.
 *
 * No valida legalidad ni que la jugada exista: eso es responsabilidad de quien
 * llama (el click en el tablero, o el que reconstruye una partida pegada).
 */
export function applyMove(board, fromRow, fromCol, toRow, toCol, castling) {
  const piece = board[fromRow][fromCol];
  const type = pieceType(piece);
  const white = isWhite(piece);
  const newBoard = cloneBoard(board);
  newBoard[fromRow][fromCol] = null;
  let finalPiece = piece;
  let promoted = false;

  if (type === "K" && Math.abs(toCol - fromCol) === 2) {
    // Enroque: la torre salta al lado opuesto del rey, en la misma jugada.
    const rookFromCol = toCol > fromCol ? 7 : 0;
    const rookToCol = toCol > fromCol ? toCol - 1 : toCol + 1;
    newBoard[fromRow][rookToCol] = newBoard[fromRow][rookFromCol];
    newBoard[fromRow][rookFromCol] = null;
  }

  if (type === "P" && toCol !== fromCol && !board[toRow][toCol]) {
    // Captura al paso: el peón comido queda al lado del destino, no en él.
    newBoard[fromRow][toCol] = null;
  }

  if (type === "P" && (toRow === 0 || toRow === 7)) {
    finalPiece = white ? "Q" : "q";
    promoted = true;
  }
  newBoard[toRow][toCol] = finalPiece;

  return {
    board: newBoard,
    promoted,
    castling: updateCastlingRights(castling, fromRow, fromCol, toRow, toCol),
    enPassant: nextEnPassantTarget(piece, fromRow, fromCol, toRow),
  };
}

/**
 * Agrega al enroque a `moves` si están dadas las condiciones: derecho
 * todavía vigente, casillas del medio vacías, la torre en su lugar, y ni la
 * casilla de salida ni las que el rey cruza están atacadas (no se puede
 * enrocar estando en jaque, ni "pasando por" un jaque).
 */
function appendCastlingMoves(board, row, col, white, rights, moves) {
  if (!rights) return;
  const homeRow = white ? 7 : 0;
  if (row !== homeRow || col !== 4) return;
  const enemigoEsBlanco = !white;
  const torreDelColor = white ? "R" : "r";

  // No se puede enrocar estando en jaque: se chequea una sola vez para los
  // dos lados, ya que la casilla de salida (columna 4) es la misma.
  if (isSquareAttacked(board, homeRow, 4, enemigoEsBlanco)) return;

  const derechoCorto = white ? rights.wK : rights.bK;
  if (
    derechoCorto &&
    !board[homeRow][5] &&
    !board[homeRow][6] &&
    board[homeRow][7] === torreDelColor &&
    !isSquareAttacked(board, homeRow, 5, enemigoEsBlanco) &&
    !isSquareAttacked(board, homeRow, 6, enemigoEsBlanco)
  ) {
    moves.push({ row: homeRow, col: 6, capture: false });
  }

  const derechoLargo = white ? rights.wQ : rights.bQ;
  if (
    derechoLargo &&
    !board[homeRow][1] &&
    !board[homeRow][2] &&
    !board[homeRow][3] &&
    board[homeRow][0] === torreDelColor &&
    !isSquareAttacked(board, homeRow, 3, enemigoEsBlanco) &&
    !isSquareAttacked(board, homeRow, 2, enemigoEsBlanco)
  ) {
    moves.push({ row: homeRow, col: 2, capture: false });
  }
}

/**
 * Devuelve los destinos posibles de la pieza que está en (row, col).
 * Cada movimiento es `{ row, col, capture }`. Si la casilla está vacía, [].
 *
 * `context.castling` y `context.enPassant` son opcionales: sin ellos, el rey
 * no ofrece enroque y el peón no ofrece captura al paso — es lo que quiere
 * el nivel "Cómo se mueven", que muestra una pieza sola en un tablero vacío.
 */
export function generateMoves(board, row, col, context = {}) {
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
      else if (context.enPassant && context.enPassant.row === nr && context.enPassant.col === nc) {
        moves.push({ row: nr, col: nc, capture: true });
      }
    }
    return moves;
  }
  if (type === "N") return stepMoves(board, row, col, white, KNIGHT_OFFSETS);
  if (type === "K") {
    const moves = stepMoves(board, row, col, white, KING_OFFSETS);
    appendCastlingMoves(board, row, col, white, context.castling, moves);
    return moves;
  }
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
 * también para el enroque: ni la casilla de salida ni las que el rey cruza
 * pueden estar atacadas.
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
export function generateLegalMoves(board, row, col, context = {}) {
  const piece = board[row][col];
  if (!piece) return [];
  const white = isWhite(piece);
  return generateMoves(board, row, col, context).filter((m) => {
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
