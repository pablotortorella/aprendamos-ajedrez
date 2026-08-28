/* ============ Paleta y tipografía ============
   Tema: "Cartero de Ajedrez" — inspirado en la partida por correspondencia
   por correspondencia que le da origen. Tablero tipo sello postal, acentos dorados
   de estampilla, y una "carta" que se puede copiar y mandar de verdad. */

export const COLORS = {
  paper: "#EAF2F0",
  paperCard: "#FFFFFF",
  ink: "#1F3A3E",
  inkSoft: "#4C6B6E",
  teal: "#1F6F76",
  tealDark: "#164E53",
  lightSquare: "#F5ECD9",
  darkSquare: "#2A6F77",
  gold: "#E8A33D",
  goldSoft: "#F6D8A0",
  coral: "#E0574C",
  moveHint: "#7FBF8F",
  // Versiones oscurecidas de gold/coral, sólo para texto: las versiones
  // normales dan bien como acento (fondos, bordes, estados seleccionados),
  // pero como texto sobre blanco no llegan al contraste 4.5:1 de WCAG AA
  // (gold da 2.16:1, coral 3.27-3.73:1 según el fondo real) — se nota poco
  // en un texto grande, pero las letras y números que se están aprendiendo
  // a leer merecen el contraste completo. Calculado para pasar 4.5:1 contra
  // los tres fondos reales de la app (paper, paperCard, y el semitransparente
  // de <main>): gold al 60% de su brillo, coral al 80%.
  goldDark: "#8B6225",
  coralDark: "#B3463D",
};

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
