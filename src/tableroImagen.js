/* ============ Imagen del tablero ============
   Dibuja la posición actual en un <canvas> y arma la descarga como PNG.
   Toca el DOM (canvas, enlaces, blobs), así que no es un módulo puro como
   chess/engine.js — por eso no tiene tests unitarios, igual que el resto de
   lo que necesita un navegador real (ver backlog #10).

   Los glyphs blancos (♙♘♗...) son de contorno y casi no se ven de por sí:
   acá se les agrega un trazo oscuro además del relleno, para que la imagen
   se pueda leer sola cuando se manda por WhatsApp sin el resto de la app
   alrededor. Es el mismo problema que el backlog #16 marca para la UI en
   vivo, resuelto acá porque una imagen fija no se puede arreglar después. */

import { FILES, isWhite, pieceType } from "./chess/engine.js";

// prettier-ignore
const UNICODE = {
  wP: "♙", wN: "♘", wB: "♗", wR: "♖", wQ: "♕", wK: "♔",
  bP: "♟", bN: "♞", bB: "♝", bR: "♜", bQ: "♛", bK: "♚",
};

const COLOR_CLARA = "#F5ECD9";
const COLOR_OSCURA = "#2A6F77";
const COLOR_BORDE = "#164E53";
const COLOR_COORD_CLARA = "#164E53";
const COLOR_COORD_OSCURA = "#E8D9B0";

const algebraic = (row, col) => `${FILES[col]}${8 - row}`;

/**
 * Dibuja la posición en un <canvas> ya existente. `flipped` respeta la misma
 * orientación que esté usando el tablero en pantalla en ese momento.
 */
export function dibujarTablero(canvas, board, { flipped = false, size = 512 } = {}) {
  const squareSize = size / 8;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size, size);

  for (let displayRow = 0; displayRow < 8; displayRow++) {
    for (let displayCol = 0; displayCol < 8; displayCol++) {
      const row = flipped ? 7 - displayRow : displayRow;
      const col = flipped ? 7 - displayCol : displayCol;
      const dark = (row + col) % 2 === 1;
      const x = displayCol * squareSize;
      const y = displayRow * squareSize;

      ctx.fillStyle = dark ? COLOR_OSCURA : COLOR_CLARA;
      ctx.fillRect(x, y, squareSize, squareSize);

      ctx.font = `bold ${Math.round(squareSize * 0.15)}px sans-serif`;
      ctx.fillStyle = dark ? COLOR_COORD_OSCURA : COLOR_COORD_CLARA;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText(algebraic(row, col), x + squareSize - 4, y + squareSize - 3);

      const piece = board[row][col];
      if (!piece) continue;
      const glyph = UNICODE[(isWhite(piece) ? "w" : "b") + pieceType(piece)];
      const cx = x + squareSize / 2;
      const cy = y + squareSize / 2 + squareSize * 0.03;
      ctx.font = `${Math.round(squareSize * 0.72)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (isWhite(piece)) {
        ctx.lineWidth = Math.max(2, squareSize * 0.035);
        ctx.strokeStyle = COLOR_BORDE;
        ctx.strokeText(glyph, cx, cy);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(glyph, cx, cy);
      } else {
        ctx.fillStyle = COLOR_BORDE;
        ctx.fillText(glyph, cx, cy);
      }
    }
  }

  ctx.strokeStyle = COLOR_BORDE;
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, size - 6, size - 6);
}

/** Arma el PNG y dispara la descarga en el navegador. */
export function descargarTableroComoImagen(board, { flipped = false, nombreArchivo = "tablero.png" } = {}) {
  const canvas = document.createElement("canvas");
  dibujarTablero(canvas, board, { flipped });
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }, "image/png");
}
