import { useState } from "react";
import { PIECE_INFO, pieceArticleName, UNICODE } from "../content/pieces.js";
import { COLORS, FONTS } from "../theme.js";

/* ============ Nivel 2: piezas ============ */

export default function Level2({ piezaInicial = null, onVerComoSeMueve }) {
  const order = ["P", "N", "B", "R", "Q", "K"];
  const [expanded, setExpanded] = useState(piezaInicial);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
      {order.map((type) => {
        const info = PIECE_INFO[type];
        const isOpen = expanded === type;
        return (
          <div
            key={type}
            style={{
              background: COLORS.paperCard,
              border: `2px solid ${isOpen ? COLORS.teal : COLORS.goldSoft}`,
              textAlign: "center",
              gridColumn: isOpen ? "1 / -1" : undefined,
            }}
            className="rounded-2xl p-3 shadow-sm transition-all"
          >
            <button onClick={() => setExpanded(isOpen ? null : type)} className="w-full flex flex-col items-center">
              <span className="text-4xl">{UNICODE["w" + type]}</span>
              <p style={{ fontFamily: FONTS.baloo, color: COLORS.tealDark }} className="font-bold mt-1">
                {info.name}
              </p>
              <p style={{ fontFamily: FONTS.nunito, color: COLORS.goldDark }} className="text-xs font-extrabold">
                Se anota: {info.letter === "" ? "(sin letra)" : info.letter}
              </p>
              <p style={{ fontFamily: FONTS.nunito, color: COLORS.inkSoft }} className="text-xs mt-1">
                {info.desc}
              </p>
              <span style={{ fontFamily: FONTS.nunito, color: COLORS.tealDark }} className="text-[10px] mt-2 font-bold">
                {isOpen ? "Tocá para cerrar ▲" : "Tocá para saber más ▼"}
              </span>
            </button>

            {isOpen && (
              <div
                style={{ borderTop: `2px dashed ${COLORS.goldSoft}` }}
                className="mt-3 pt-3 w-full flex flex-col gap-2 text-left"
              >
                <p style={{ fontFamily: FONTS.nunito, color: COLORS.tealDark }} className="text-xs">
                  <span className="font-extrabold">Valor: </span>
                  {info.value}
                </p>
                <p style={{ fontFamily: FONTS.nunito, color: COLORS.tealDark }} className="text-xs">
                  <span className="font-extrabold">Ejemplo de jugada: </span>
                  {info.example}
                </p>
                <p
                  style={{ fontFamily: FONTS.nunito, color: COLORS.ink, background: "#F6D8A040" }}
                  className="text-xs rounded-lg p-2"
                >
                  💡 <span className="font-extrabold">Dato curioso: </span>
                  {info.funFact}
                </p>
                <button
                  onClick={() => onVerComoSeMueve(type)}
                  style={{ fontFamily: FONTS.baloo, color: COLORS.tealDark }}
                  className="text-xs font-bold text-left underline"
                >
                  🧭 Ver cómo se mueve {pieceArticleName(type)} →
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
