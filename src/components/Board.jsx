import { algebraic, isWhite } from "../chess/engine.js";
import { pieceAriaLabel, pieceGlyph } from "../content/pieces.js";
import { COLORS, FONTS } from "../theme.js";

function Square({
  dark,
  children,
  onClick,
  highlight,
  capture,
  selected,
  coordLabel,
  flash,
  correctReveal,
  inCheck,
  ariaLabel,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={ariaLabel}
      style={{
        background: dark ? COLORS.darkSquare : COLORS.lightSquare,
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        outline: selected ? `3px solid ${COLORS.gold}` : "none",
        outlineOffset: "-3px",
        transition: "box-shadow 0.15s ease",
        boxShadow:
          flash === "bien"
            ? `inset 0 0 0 999px rgba(46,139,87,0.55)`
            : flash === "mal"
              ? `inset 0 0 0 999px rgba(224,87,76,0.55)`
              : correctReveal
                ? `inset 0 0 0 999px rgba(232,163,61,0.55)`
                : "none",
      }}
      // El outline de "seleccionada" (arriba) va inline y gana por especificidad,
      // así que el foco de teclado necesita !important para no quedar tapado.
      // Distinto color que "seleccionada" (gold) y que jaque/captura (coral),
      // para no confundir "estoy parado acá" con esos otros estados.
      className="aspect-square flex items-center justify-center select-none focus-visible:outline-4! focus-visible:outline-cartero-focus!"
    >
      {children}
      {highlight && !capture && (
        <div style={{ opacity: 0.85 }} className="absolute rounded-full w-1/3 h-1/3 bg-cartero-move-hint" />
      )}
      {capture && (
        <div style={{ opacity: 0.9 }} className="absolute inset-1 rounded-md border-4 border-cartero-coral" />
      )}
      {inCheck && (
        <div
          style={{ opacity: 0.9 }}
          className="absolute inset-1 rounded-md animate-pulse border-4 border-cartero-coral"
        />
      )}
      {(flash === "bien" || flash === "mal") && (
        // El acierto/error no se distingue sólo por el color (verde/rojo):
        // así también funciona para quien no distingue esos colores.
        <span
          aria-hidden="true"
          className="absolute text-2xl sm:text-3xl font-extrabold pointer-events-none"
          style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
        >
          {flash === "bien" ? "✓" : "✗"}
        </span>
      )}
      {coordLabel && (
        // Sin opacity: mezclado con el color de fondo real, bajaba el contraste
        // por debajo de lo legible (goldSoft quedaba en 3.26:1 sobre la casilla
        // oscura). lightSquare como texto en la oscura, en vez de goldSoft: a
        // pleno contraste goldSoft todavía no llegaba a 4.5:1 (quedaba en
        // 4.19); lightSquare sí (4.91), reutilizando el mismo cream del tablero.
        <span
          style={{ color: dark ? COLORS.lightSquare : COLORS.teal, fontFamily: FONTS.nunito }}
          className="absolute bottom-0.5 right-1 text-[9px] sm:text-xs font-bold"
        >
          {coordLabel}
        </span>
      )}
    </button>
  );
}

export default function Board({
  board,
  onSquareClick,
  selectedSquare,
  legalMoves,
  showCoords = true,
  pieceSize = "text-3xl sm:text-4xl",
  flashSquare,
  revealSquare,
  flipped = false,
  checkSquare,
}) {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(22,78,83,0.25)",
      }}
      className="grid grid-cols-8 w-full max-w-md mx-auto border-6 border-cartero-teal-dark"
    >
      {board.map((rowArr, displayRow) =>
        rowArr.map((_, displayCol) => {
          // flipped invierte la posición visual, no la del estado: las jugadas
          // y la notación siguen viendo siempre las coordenadas reales.
          const row = flipped ? 7 - displayRow : displayRow;
          const col = flipped ? 7 - displayCol : displayCol;
          const piece = board[row][col];
          const dark = (row + col) % 2 === 1;
          const move = legalMoves?.find((m) => m.row === row && m.col === col);
          const isFlash = flashSquare && flashSquare.row === row && flashSquare.col === col;
          const isReveal = revealSquare && revealSquare.row === row && revealSquare.col === col;
          const isCheck = checkSquare && checkSquare.row === row && checkSquare.col === col;
          const coord = algebraic(row, col);
          return (
            <Square
              key={`${row}-${col}`}
              dark={dark}
              selected={selectedSquare && selectedSquare.row === row && selectedSquare.col === col}
              highlight={!!move}
              capture={move?.capture}
              coordLabel={showCoords ? coord : null}
              ariaLabel={`${coord}, ${pieceAriaLabel(piece) ?? "vacía"}`}
              onClick={onSquareClick ? () => onSquareClick(row, col) : undefined}
              flash={isFlash ? flashSquare.result : null}
              correctReveal={isReveal}
              inCheck={isCheck}
            >
              <span
                className={pieceSize}
                style={
                  piece && isWhite(piece)
                    ? // El glyph blanco es sólo contorno: sobre la casilla clara
                      // (o cualquier fondo claro) casi no se distingue. Se rellena
                      // de blanco y se le agrega un trazo oscuro, así se lee sola
                      // incluso si se mira sin el resto del tablero alrededor.
                      { lineHeight: 1, color: "#FFFFFF", WebkitTextStroke: `1.5px ${COLORS.tealDark}` }
                    : { lineHeight: 1 }
                }
              >
                {pieceGlyph(piece)}
              </span>
            </Square>
          );
        }),
      )}
    </div>
  );
}
