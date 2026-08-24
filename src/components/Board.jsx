import { algebraic } from "../chess/engine.js";
import { pieceGlyph } from "../content/pieces.js";
import { COLORS } from "../theme.js";

function Square({ dark, children, onClick, highlight, capture, selected, coordLabel, flash, correctReveal, inCheck }) {
  return (
    <div
      onClick={onClick}
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
      className="aspect-square flex items-center justify-center select-none"
    >
      {children}
      {highlight && !capture && (
        <div style={{ background: COLORS.moveHint, opacity: 0.85 }} className="absolute rounded-full w-1/3 h-1/3" />
      )}
      {capture && (
        <div style={{ border: `4px solid ${COLORS.coral}`, opacity: 0.9 }} className="absolute inset-1 rounded-md" />
      )}
      {inCheck && (
        <div
          style={{ border: `4px solid ${COLORS.coral}`, opacity: 0.9 }}
          className="absolute inset-1 rounded-md animate-pulse"
        />
      )}
      {coordLabel && (
        <span
          style={{ color: dark ? COLORS.goldSoft : COLORS.teal, fontFamily: "Nunito" }}
          className="absolute bottom-0.5 right-1 text-[9px] sm:text-xs font-bold opacity-80"
        >
          {coordLabel}
        </span>
      )}
    </div>
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
        border: `6px solid ${COLORS.tealDark}`,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(22,78,83,0.25)",
      }}
      className="grid grid-cols-8 w-full max-w-md mx-auto"
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
          return (
            <Square
              key={`${row}-${col}`}
              dark={dark}
              selected={selectedSquare && selectedSquare.row === row && selectedSquare.col === col}
              highlight={!!move}
              capture={move?.capture}
              coordLabel={showCoords ? algebraic(row, col) : null}
              onClick={onSquareClick ? () => onSquareClick(row, col) : undefined}
              flash={isFlash ? flashSquare.result : null}
              correctReveal={isReveal}
              inCheck={isCheck}
            >
              <span className={pieceSize} style={{ lineHeight: 1 }}>
                {pieceGlyph(piece)}
              </span>
            </Square>
          );
        }),
      )}
    </div>
  );
}
