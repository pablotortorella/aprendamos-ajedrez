import { COLORS } from "../theme.js";

export default function LevelTab({ active, onClick, label, emoji }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "Baloo 2",
        background: active ? COLORS.teal : COLORS.paperCard,
        color: active ? "#FFFFFF" : COLORS.teal,
        border: `2px solid ${COLORS.teal}`,
      }}
      className="px-3 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-colors"
    >
      {emoji} {label}
    </button>
  );
}
