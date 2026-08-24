import { useState } from "react";
import { TIPS } from "../content/tips.js";
import { COLORS } from "../theme.js";

/* ============ Nivel 5: consejo ============ */

export default function LevelTip() {
  const [index, setIndex] = useState(0);
  const tip = TIPS[index];

  const go = (delta) => {
    setIndex((i) => (i + delta + TIPS.length) % TIPS.length);
  };

  return (
    <div className="max-w-md mx-auto flex flex-col items-center gap-4">
      <div
        style={{ background: COLORS.paperCard, border: `2px solid ${COLORS.coral}`, minHeight: 220 }}
        className="rounded-2xl p-5 text-center shadow-md w-full flex flex-col items-center justify-center"
      >
        <span className="text-5xl">{tip.emoji}</span>
        <p style={{ fontFamily: "Baloo 2", color: COLORS.tealDark }} className="font-extrabold text-lg mt-2">
          {tip.titulo}
        </p>
        <p style={{ fontFamily: "Nunito", color: COLORS.inkSoft }} className="text-sm mt-2">
          {tip.texto}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => go(-1)}
          style={{ fontFamily: "Baloo 2", background: COLORS.teal, color: "#fff" }}
          className="w-9 h-9 rounded-full font-bold text-lg shadow"
          aria-label="Consejo anterior"
        >
          ‹
        </button>
        <div className="flex gap-1.5">
          {TIPS.map((_, i) => (
            <span
              key={i}
              onClick={() => setIndex(i)}
              style={{
                background: i === index ? COLORS.gold : COLORS.goldSoft,
                cursor: "pointer",
              }}
              className="w-2.5 h-2.5 rounded-full inline-block"
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          style={{ fontFamily: "Baloo 2", background: COLORS.teal, color: "#fff" }}
          className="w-9 h-9 rounded-full font-bold text-lg shadow"
          aria-label="Siguiente consejo"
        >
          ›
        </button>
      </div>
      <p style={{ fontFamily: "Nunito", color: COLORS.inkSoft }} className="text-xs">
        Consejo {index + 1} de {TIPS.length}
      </p>
    </div>
  );
}
