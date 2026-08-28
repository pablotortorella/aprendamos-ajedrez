import { AYUDA } from "../content/ayuda.js";
import { COLORS, FONTS } from "../theme.js";

/* ============ Ayuda: qué hace cada sección del menú ============ */

export default function LevelHelp() {
  return (
    <div className="max-w-md mx-auto flex flex-col gap-3">
      <p style={{ fontFamily: FONTS.nunito, color: COLORS.inkSoft }} className="text-sm text-center">
        Qué encontrás en cada botón del menú de arriba:
      </p>
      {AYUDA.map((item) => (
        <div
          key={item.titulo}
          style={{ background: COLORS.paperCard, border: `2px solid ${COLORS.goldSoft}` }}
          className="rounded-2xl p-3 flex items-start gap-3 shadow-sm"
        >
          <span className="text-2xl leading-none" aria-hidden="true">
            {item.emoji}
          </span>
          <div>
            <p style={{ fontFamily: FONTS.baloo, color: COLORS.tealDark }} className="font-extrabold text-sm">
              {item.titulo}
            </p>
            <p style={{ fontFamily: FONTS.nunito, color: COLORS.ink }} className="text-sm mt-0.5">
              {item.texto}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
