import { COLORS, THEMES } from "../theme.js";

/** Selector de tema: un emoji por tema, igual de simple que elegir un nivel. */
export default function ThemePicker({ tema, onCambiarTema }) {
  return (
    <div className="flex items-center justify-center gap-1.5" role="group" aria-label="Elegir tema de colores">
      {THEMES.map((t) => {
        const activo = t.id === tema;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onCambiarTema(t.id)}
            aria-label={t.label}
            aria-current={activo ? "true" : undefined}
            title={t.label}
            style={{
              background: activo ? COLORS.teal : "transparent",
              border: `2px solid ${activo ? COLORS.teal : COLORS.goldSoft}`,
            }}
            className="w-8 h-8 rounded-full text-base leading-none shadow-sm"
          >
            {t.emoji}
          </button>
        );
      })}
    </div>
  );
}
