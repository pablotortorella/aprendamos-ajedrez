# Backlog — El Cartero de Ajedrez

Ideas para seguir el desarrollo, ordenadas por prioridad. No son compromisos: son
candidatas a discutir. Cada una dice **qué**, **por qué** y **qué implica**.

Criterio de orden: primero lo que hace que la herramienta cumpla su promesa real
(que Celeste pueda mandar y leer jugadas sin errores), después lo que la hace
sostenible, y al final lo que la hace más linda.

Los números son identificadores estables: cuando algo se termina queda tachado en su
lugar, no se renumera el resto.

---

## ✅ Hecho

- **~~1. Desambiguación en la notación~~** — `moveNotation` ahora escribe `Cbd2` / `C3d4`
  / `Da1e5` según haga falta. Motor y notación salieron a `src/chess/` como módulos puros,
  con tests.
- **~~2. Guardar la partida del nivel 4~~** — la partida y el puntaje del nivel 1 se
  guardan en `localStorage` (`src/storage.js`). Todo lo que se lee se valida: un guardado
  corrupto se descarta y se borra, en vez de dejar la app rota en cada recarga. "Empezar
  de nuevo" ahora pide confirmación.
- **~~3. Deshacer la última jugada~~** — botón de deshacer un paso, que sobrevive a
  recargar. El rebobinado completo quedó como idea aparte (punto 24).
- **~~4. Sacar los nombres del código~~** — quien escribe y quien recibe se cargan desde
  la app y se guardan. No queda ningún nombre de menores en el código. El saludo de la
  carta pasó a ser neutro ("¡Hola Ana!" en vez de "Querida Ana"), porque los nombres los
  pone quien usa la app y no se sabe a quién le escribe.
- **~~12a. Doble punteo en el nivel 1~~** — durante la animación de acierto se podían
  sumar varios puntos con la misma casilla. El tablero ahora ignora los toques mientras
  festeja, la pista dorada se deriva de los errores en vez de ser estado aparte, y los
  temporizadores se cancelan al cambiar de nivel.
- **~~8. Girar el tablero cuando juegan las negras~~** — botón manual (🔄, junto al
  indicador de turno) que gira el tablero 180° en el nivel "Escribí tu carta": coordenadas
  y piezas se relabelan, el estado de la partida no cambia. Manual y no automático por
  turno, para no sorprender a mitad de jugada.
- **~~6. Subir las jugadas de una partida en curso~~** — pegar la lista de jugadas de una
  carta (propia o pegada) reconstruye el tablero desde cero: `parseMove` + `resolveMove` en
  `chess/notation.js` son el inverso exacto de `moveNotation`, `extraerJugadas` en
  `carta.js` es el inverso de `textoCarta`. Pide confirmación antes de reemplazar una
  partida local que ya tenía jugadas, igual que "Empezar de nuevo".
- **~~7. Detección de jaque~~** — `generateLegalMoves` filtra las jugadas que dejan al
  propio rey en jaque (`isInCheck` + `isSquareAttacked` en `chess/engine.js`), cerrando el
  agujero de "comerse el rey". El nivel 4 ahora usa jugadas legales, marca al rey en
  peligro con un borde coral pulsante, muestra "¡Jaque!" / "¡Jaque mate!" junto al turno, y
  la notación agrega `+`/`#` automáticamente (también al reconstruir una carta subida).
- **Publicar en GitHub Pages** — deploy automático por GitHub Actions
  (`.github/workflows/deploy.yml`) en cada push a `main`, en
  https://pablotortorella.github.io/aprendamos-ajedrez/
- **Reordenar los niveles 1 y 2 del menú** — "Conocé piezas" pasó a ser el primer nivel y
  "Ubicá casillas" el segundo (antes era al revés). Sólo cambia el orden del menú; el
  contenido de cada nivel es el mismo de siempre.
- **Autoría en el pie de página** — nombre de Pablo Tortorella, "en colaboración con
  Claude Code", la licencia (GPL-3.0) y un link al repositorio en GitHub.
- **Bug: el tablero se agrandaba al tocar "Empezar de nuevo"** — el aviso de confirmación
  ("¿Seguro?... Sí, borrar / No") iba en una sola fila más ancha que los controles
  normales, y al compartir con el tablero la misma columna de ancho automático, lo
  estiraba con ella (326px → 434px medido en un viewport de escritorio). Se solucionó
  poniendo el aviso y los botones en líneas separadas, así nunca es lo más ancho de esa
  columna. Reportado por Pablo tras probar el nivel 4 en su compu.
- **Descargar el tablero como imagen** — botón 📷 junto al de girar tablero, en el nivel
  "Escribí tu carta". Dibuja la posición actual en un `<canvas>` (`src/tableroImagen.js`)
  y descarga un PNG, sin backend ni dependencias nuevas; respeta el giro del tablero. Las
  piezas blancas llevan un trazo oscuro además del relleno para que se lean solas en la
  imagen — el mismo glyph de contorno que el backlog #16 marca como bug en la UI en vivo,
  resuelto acá porque una imagen ya mandada no se puede arreglar después.
- **~~11. Linter, formato y CI~~** — ESLint (flat config, `eslint.config.js`) con
  react-hooks + react-refresh, y Prettier (`printWidth: 120`, sin tocar los `.md`). Las
  tablas compactas (offsets de movimiento, mapas de glyphs) quedan con `// prettier-ignore`
  porque Prettier las expande a una línea por elemento por default. Encontró dos cosas
  reales: un import de `React` sin usar y un `catch (e)` con el error sin usar. Nuevo
  workflow `.github/workflows/ci.yml`: `format:check + lint + test + build` en cada push a
  `main` y en cada PR, separado del deploy para no bloquearlo.
- **~~9. Terminar de partir `src/App.jsx`~~** — `App.jsx` bajó de 1104 a 71 líneas: sólo
  encabezado, menú y armado de niveles. Salieron `theme.js`, `content/pieces.js`,
  `content/tips.js`, `components/Board.jsx`, `components/LevelTab.jsx` y un archivo por
  nivel en `levels/`. Movimiento puro de código, sin cambios de lógica; verificado a mano
  en los 5 niveles además de tests y build. De paso, el README (que nunca se había
  actualizado desde el clon inicial) quedó al día: ya no dice "no hay detección de jaque"
  ni "movimientos pseudo-legales", que habían quedado desactualizados desde el punto 7.
- **~~10. Tests de los componentes~~** — `@testing-library/react` + `jsdom`, sólo para los
  archivos que lo piden (`// @vitest-environment jsdom` por archivo; el resto sigue en
  `node`, más rápido). `levels/Level4.test.jsx` cubre jugar, deshacer, empezar de nuevo
  (confirmado y cancelado), que la partida guardada se recupera al montar, y el fallback de
  copiar la carta (punto 12). 7 tests nuevos, 153 en total.
- **~~12. Bugs técnicos concretos ya detectados~~** — el último bug de la lista ("Copiar
  la carta" fallaba en silencio) quedó resuelto: ahora avisa y deja el texto de la carta
  seleccionado automáticamente, para que alcance con Ctrl+C. Con éste, los cinco bugs que
  tenía esta lista ya están cerrados.
- **~~13. Fuentes~~** — auto-hospedadas con `@fontsource` (subset `latin`, alcanza para
  español), importadas en `main.jsx`: la app ya no depende de Google Fonts por internet.
  De paso salió un bug real, anterior a esta sesión: `fontFamily: "Baloo 2"` sin comillas
  es CSS inválido (el "2" no es un identificador válido), así que el navegador la
  descartaba en silencio y todo lo que debía verse en Baloo 2 se veía en Nunito heredado
  — desde el primer commit del proyecto. Se agregó `FONTS` en `theme.js` (con las
  comillas puestas) y se reemplazaron los 20 usos sueltos, en toda la app.
- **~~14. Tokens de color como tema de Tailwind~~** — `@theme` en `index.css` define la
  paleta como `--color-cartero-*` (prefijo a propósito, para no pisar la escala
  incorporada de Tailwind), generando clases como `bg-cartero-teal-dark`. Se aplicó a los
  colores que son siempre fijos (bordes, fondos que no dependen de estado) en `App.jsx`,
  `components/Board.jsx` y `levels/LevelTip.jsx`. Los colores condicionales (por ejemplo
  `activo ? COLORS.teal : COLORS.paperCard`) se dejaron en `theme.js` a propósito: Tailwind
  no expresa bien un color que cambia en tiempo de ejecución sin lógica extra de por medio,
  así que ahí `theme.js` sigue siendo la fuente de verdad. Verificado con capturas antes y
  después en los 5 niveles: pixel a pixel, sin cambios visuales.

**Los cuatro P0 están cerrados.**

---

## P1 — Cierra el círculo de la correspondencia

### ~~5. Nivel "Leé la carta de Paulina"~~ — bajado de prioridad (2026-08-24)

La idea original era un nivel de lectura paso a paso ("pegar el texto de la carta y que
el tablero reproduzca las jugadas una por una, con anterior/siguiente"), pensado como la
mitad pedagógica que falta a la app: hoy solo enseña a *escribir* jugadas, no a *leer* las
que llegan.

Se saca de foco porque la carta real vive **fuera de la app** (hoy por WhatsApp) y eso no
va a cambiar: no tiene sentido construir una lección de lectura dentro de la app para un
paso que ya pasa por otro canal. Si en algún momento se necesita reconstruir una posición
a partir de jugadas pegadas, esa necesidad más chica y concreta quedó capturada en el
punto 6 — sin la capa de "lección" encima.

---

## P2 — Salud técnica

Nada de esto se ve, pero sin esto cada cambio nuevo cuesta más que el anterior.

Por ahora está vacío: todo lo que había acá (#10, #12, #13, #14) ya está hecho — ver la
sección "✅ Hecho" al principio del archivo.

---

## P3 — Accesibilidad

Vale la pena aun siendo una app familiar: es lo que la hace usable para otros chicos.

### 15. Tablero navegable con teclado

Las casillas son `<div onClick>`: no se llega con Tab, no responden a Enter, y un lector
de pantalla no las anuncia.

- Convertirlas en `<button>` con `aria-label` (`"casilla e4, peón blanco"`).
- Lo mismo con los puntitos del carrusel del nivel 5, que también son `<span onClick>`.

### 16. Contraste de las piezas blancas

Los glyphs Unicode blancos (♙♘♗) son de contorno: sobre las casillas crema casi no se
distinguen. Se nota en cuanto se mira el tablero.

- Usar el glyph relleno con `color` blanco y un borde oscuro vía `text-shadow`, o pasar a
  piezas SVG (que además escalan mejor y permiten animarlas).

### 17. No comunicar sólo por color

El feedback del nivel 1 es verde/rojo. Sumar un ícono (✓ / ✗) para que funcione también
con daltonismo.

---

## P4 — Que dé más ganas de usarla

### 18. Sonidos

Un clic suave al mover, un sonido de acierto y otro de error. Para 6 años, el sonido es
la mitad de la recompensa. Con un botón de silencio bien visible.

### 19. Animar la pieza al moverse

Hoy desaparece y aparece. Una transición corta ayuda a *ver* el movimiento, que es
justamente lo que se está enseñando.

### 20. Piezas capturadas y balance de puntos

Mostrar al costado del tablero las piezas comidas y quién va ganando en material. Conecta
directamente con los valores que se enseñan en el nivel 2 (peón 1, caballo 3, torre 5...).

### 21. Nivel 1 al revés

Que la app señale una casilla y Celeste escriba su nombre. Hoy sólo se practica leer la
coordenada; esto practica escribirla, que es lo que hace falta para la carta.

### 22. Decir por qué una jugada no se puede

Cuando toca una casilla no válida no pasa nada. Un mensaje corto ("el alfil sólo va en
diagonal") convierte cada error en una mini-lección.

### 23. Progreso visible entre niveles

Una marca de completado por nivel y algún logro simple ("¡encontraste 20 casillas!").
La persistencia (punto 2) ya está, así que esto quedó destrabado.

### 24. Rebobinar la partida entera

Hoy se deshace **una** jugada. Se decidió así a propósito: resuelve el caso real (tocar
la casilla equivocada) sin agregar una función que hay que aprender a los 6 años.

La versión amplia —volver a cualquier jugada anterior, como un navegador de partida—
tiene sentido más adelante, y por dos motivos distintos:

- **Para repasar juntos**: recorrer la partida jugada por jugada y comentar qué pasó.
- **Para revisar una carta subida**: el punto 6 ("Subir las jugadas") ya reconstruye toda
  la partida internamente, pero hoy sólo se ve el resultado final. Con historial de
  posiciones, subir una carta podría dejar navegar jugada por jugada en vez de aterrizar
  directo en la última.

Sigue sin ser urgente: el punto 6 ya funciona sin esto. Vale la pena cuando alguna de las
dos razones de arriba se vuelva concreta, no antes.

Implica cambiar `previous` (una sola posición) por un historial de posiciones. El estado
del nivel 4 ya está agrupado en un solo objeto, así que el cambio queda contenido.

---

## P5 — Más adelante

- **Más contenido**: mates básicos (mate del pasillo, mate del loco), un glosario, y
  consejos que se desbloqueen a medida que avanza.
- **PWA**: instalable y funcionando sin internet, para usarla en la tablet en cualquier lado.
- **Exportar la partida en PGN**, para poder abrirla en Lichess y revisarla juntos.
