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
      // Es un halo de dos aros (blanco + oscuro) y no un solo color: ver el
      // comentario largo en index.css sobre por qué ningún color único
      // contrasta contra las dos casillas del tablero en todos los temas.
      //
      // focus-visible:z-10 es necesario además del box-shadow: las casillas
      // son hermanas en el grid con z-index "auto", así que sin esto el
      // navegador las pinta en orden de aparición en el HTML y las casillas
      // siguientes tapan la mayor parte del halo (sólo se veía una rayita a
      // la izquierda, del lado de la casilla ya pintada antes).
      className="aspect-square flex items-center justify-center select-none focus-visible:z-10 focus-visible:[box-shadow:0_0_0_2px_white,0_0_0_6px_var(--color-cartero-piece-ink)]!"
    >
      {children}
      {highlight && !capture && (
        <div
          style={{ opacity: 0.85, background: dark ? COLORS.moveHintOnDark : COLORS.moveHintOnLight }}
          className="absolute rounded-full w-1/3 h-1/3"
        />
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
        // Cada casilla usa el color de la OTRA como texto: simétrico, y pasa
        // WCAG en los dos temas sin necesitar un color aparte sólo para esto
        // (ver #30 del backlog — antes era goldSoft con opacity, que no
        // llegaba a 4.5:1 ni a pleno brillo).
        <span
          style={{ color: dark ? COLORS.lightSquare : COLORS.darkSquare, fontFamily: FONTS.nunito }}
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
                  // El glyph "blanco" es sólo contorno, sin relleno propio (ver
                  // pieceGlyph): las dos piezas necesitan relleno + trazo
                  // explícitos para leerse solas sin depender de qué casilla
                  // les toque. Colores de identidad de la pieza (blanca/negra),
                  // no de UI: no cambian con el tema — ver index.css.
                  piece && isWhite(piece)
                    ? { lineHeight: 1, color: "#FFFFFF", WebkitTextStroke: `1.5px ${COLORS.pieceWhiteStroke}` }
                    : piece
                      ? { lineHeight: 1, color: COLORS.pieceInk, WebkitTextStroke: `1.5px ${COLORS.pieceInkStroke}` }
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
