/* ============ Paleta y tipografía ============
   Tema: "Cartero de Ajedrez" — inspirado en la partida por correspondencia
   por correspondencia que le da origen. Tablero tipo sello postal, acentos dorados
   de estampilla, y una "carta" que se puede copiar y mandar de verdad.

   Los valores de verdad viven en `index.css` (bloque @theme + [data-theme="dark"]):
   son variables CSS de verdad, no sólo tokens de Tailwind — por eso acá cada
   entrada es `var(--color-cartero-x)` y no un hex fijo. Así, el mismo
   `style={{ color: COLORS.ink }}` que ya se usa en toda la app responde solo
   al tema activo (según el atributo `data-theme` del `<html>`), sin tener que
   tocar un solo componente cuando se agrega un tema nuevo — sólo hace falta
   sumar un bloque de variables en index.css y una entrada en THEMES, más
   abajo. */

export const COLORS = {
  paper: "var(--color-cartero-paper)",
  paperCard: "var(--color-cartero-paper-card)",
  contentBg: "var(--color-cartero-content-bg)",
  ink: "var(--color-cartero-ink)",
  inkSoft: "var(--color-cartero-ink-soft)",
  teal: "var(--color-cartero-teal)",
  tealDark: "var(--color-cartero-teal-dark)",
  lightSquare: "var(--color-cartero-square-light)",
  darkSquare: "var(--color-cartero-square-dark)",
  gold: "var(--color-cartero-gold)",
  goldSoft: "var(--color-cartero-gold-soft)",
  coral: "var(--color-cartero-coral)",
  // El punto de "movimiento legal" (Board.jsx) tiene un verde por tipo de
  // casilla, no uno solo: mismo problema que el anillo de foco (un verde que
  // se lea bien en la clara es demasiado oscuro para la oscura), pero acá sí
  // alcanza con elegir por casilla en vez de necesitar un halo.
  moveHintOnLight: "var(--color-cartero-move-hint-on-light)",
  moveHintOnDark: "var(--color-cartero-move-hint-on-dark)",
  // Versiones de gold/coral sólo para texto (ver #30 del backlog): las
  // normales no llegan al contraste 4.5:1 de WCAG AA sobre fondos claros.
  // Bordes y fondos decorativos siguen usando gold/coral tal cual, que ahí
  // sólo necesitan 3:1.
  goldDark: "var(--color-cartero-gold-dark)",
  coralDark: "var(--color-cartero-coral-dark)",
  // Coral que se mantiene oscuro en cualquier tema: para fondos de botón con
  // texto blanco encima ("Sí, borrar"). coralDark de arriba no sirve para
  // este rol porque en el tema oscuro se aclara (para leerse como texto
  // sobre fondo oscuro), y un fondo de botón claro con texto blanco no se lee.
  coralStrong: "var(--color-cartero-coral-strong)",
  // Piezas: ver el comentario largo en index.css — son colores de identidad
  // de la pieza, no de UI, así que no se aclaran/oscurecen con el tema.
  pieceInk: "var(--color-cartero-piece-ink)",
  pieceInkStroke: "var(--color-cartero-piece-ink-stroke)",
  pieceWhiteStroke: "var(--color-cartero-piece-white-stroke)",
};

/**
 * Los temas disponibles, con el emoji que los representa en el selector.
 * "estandar" es el default y el único que existía antes de sumar esto — el
 * peón negro por lo que ya es: la pieza, sin ningún filtro de color encima.
 */
export const THEMES = [
  { id: "estandar", emoji: "♟️", label: "Estándar" },
  { id: "dark", emoji: "🌙", label: "Oscuro" },
  { id: "arbol", emoji: "🌳", label: "Verde" },
];

// Las fuentes (Baloo 2, Nunito, Caveat) están auto-hospedadas con @fontsource
// y se cargan en main.jsx: la app no depende de Google Fonts por internet.
//
// Van entre comillas literales adentro del string porque "Baloo 2" tiene un
// espacio y termina en un número: sin comillas, `font-family: Baloo 2` es CSS
// inválido (el "2" no es un identificador válido) y el navegador descarta la
// propiedad entera y hereda la fuente del contenedor sin avisar. Usar estas
// constantes en vez de escribir el nombre a mano evita reintroducir el bug.
export const FONTS = {
  baloo: '"Baloo 2"',
  nunito: '"Nunito"',
  caveat: '"Caveat"',
};
