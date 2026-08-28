import { AYUDA } from "../content/ayuda.js";
import { COLORS, FONTS } from "../theme.js";

/* ============ Ayuda: qué hace cada sección del menú ============ */

export default function LevelHelp({ onIrANivel }) {
  return (
    <div className="max-w-md mx-auto flex flex-col gap-3">
      <p style={{ fontFamily: FONTS.nunito, color: COLORS.inkSoft }} className="text-sm text-center">
        Qué encontrás en cada botón del menú de arriba. Tocá una tarjeta para ir directo ahí.
      </p>
      {AYUDA.map((item) => (
        <button
          key={item.titulo}
          type="button"
          onClick={() => onIrANivel(item.nivel)}
          aria-label={`Ir a ${item.titulo}`}
          style={{ background: COLORS.paperCard, border: `2px solid ${COLORS.goldSoft}`, textAlign: "left" }}
          className="rounded-2xl p-3 flex items-start gap-3 shadow-sm w-full"
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
            <span
              style={{ fontFamily: FONTS.nunito, color: COLORS.tealDark }}
              className="text-[10px] mt-1.5 font-bold block"
            >
              Ir acá →
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
