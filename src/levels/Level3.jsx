import { useMemo, useState } from "react";
import { createEmptyBoard, generateMoves } from "../chess/engine.js";
import { moveNotation } from "../chess/notation.js";
import Board from "../components/Board.jsx";
import { PIECE_INFO, UNICODE } from "../content/pieces.js";
import { COLORS } from "../theme.js";

/* ============ Nivel 3: cómo se mueven ============ */

export default function Level3() {
  const order = ["P", "N", "B", "R", "Q", "K"];
  const [selected, setSelected] = useState("N");
  const origin = selected === "P" ? { row: 6, col: 3 } : { row: 3, col: 3 };
  const board = useMemo(() => {
    const b = createEmptyBoard();
    b[origin.row][origin.col] = selected;
    return b;
  }, [selected, origin.row, origin.col]);
  const moves = useMemo(() => generateMoves(board, origin.row, origin.col), [board, origin.row, origin.col]);
  const [destNote, setDestNote] = useState(null);

  const handleClick = (row, col) => {
    const m = moves.find((mv) => mv.row === row && mv.col === col);
    if (m) {
      setDestNote(moveNotation(board, origin.row, origin.col, row, col));
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        {order.map((type) => (
          <button
            key={type}
            onClick={() => {
              setSelected(type);
              setDestNote(null);
            }}
            style={{
              fontFamily: "Baloo 2",
              background: selected === type ? COLORS.gold : COLORS.paperCard,
              color: selected === type ? "#FFFFFF" : COLORS.tealDark,
              border: `2px solid ${COLORS.gold}`,
            }}
            className="px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1"
          >
            <span className="text-xl">{UNICODE["w" + type]}</span>
            {PIECE_INFO[type].name}
          </button>
        ))}
      </div>
      <p style={{ fontFamily: "Nunito", color: COLORS.inkSoft }} className="text-sm text-center max-w-sm">
        Los círculos verdes muestran adónde puede ir el {PIECE_INFO[selected].name.toLowerCase()}. Tocá uno para ver
        cómo se escribe esa jugada.
      </p>
      <Board board={board} legalMoves={moves} onSquareClick={handleClick} />
      <div style={{ fontFamily: "Baloo 2", color: COLORS.tealDark, minHeight: 28 }} className="text-lg font-bold">
        {destNote ? (
          <>
            Esa jugada se escribe: <span style={{ color: COLORS.coral }}>{destNote}</span>
          </>
        ) : (
          "\u00A0"
        )}
      </div>
    </div>
  );
}
