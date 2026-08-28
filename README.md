# El Cartero de Ajedrez 📮

Un espacio para aprender a jugar al ajedrez. Para principiantes... y más allá.

Esta primera aplicación es un **tutorial interactivo de notación algebraica española**,
pensado para Celeste (6 años), que empezó una partida por correspondencia con su
compañerita Paulina y el papá de Paulina, Alejo.

Celeste ya sabe mover las piezas, pero no sabía escribir las jugadas. Sin eso no podía
seguir la partida sola. La app cubre exactamente ese hueco: ubicarse en el tablero,
reconocer cada pieza y su letra, entender cómo se mueve, y practicar el gesto real de
anotar una jugada antes de mandarla.

---

## Cómo se usa

```bash
npm install
npm run dev      # abre http://localhost:5173
```

Otros comandos:

| Comando            | Qué hace                                      |
| ------------------ | --------------------------------------------- |
| `npm test`         | Corre los tests del motor, la notación y el guardado |
| `npm run test:watch` | Los mismos tests, reejecutándose al guardar |
| `npm run lint`     | ESLint sobre todo el proyecto                 |
| `npm run format`   | Prettier: reformatea el código (no toca los `.md`) |
| `npm run format:check` | Prettier en modo chequeo, sin escribir nada |
| `npm run build`    | Genera el sitio estático en `dist/`           |
| `npm run preview`  | Sirve el `dist/` ya compilado, para revisarlo  |

Un GitHub Actions (`.github/workflows/ci.yml`) corre `format:check + lint + test + build`
en cada push a `main` y en cada Pull Request.

Stack: **Vite + React 19 + Tailwind CSS 4**. No hay backend ni base de datos: es una
app 100% estática, se puede publicar en cualquier hosting de archivos.

## Los 5 niveles

1. **Conocé las piezas** — seis tarjetas (Peón, Caballo, Alfil, Torre, Dama, Rey). Se
   tocan para expandir y ver valor en puntos, ejemplo de notación y un dato curioso. Cada
   tarjeta abierta linkea a "Cómo se mueven" con esa pieza ya seleccionada, y viceversa.
2. **Cómo se mueven** — elegís una pieza sobre un tablero vacío, ves todos sus destinos
   posibles marcados en verde, y al tocar uno te muestra cómo se escribe esa jugada.
3. **Ubicá las casillas** — juego de encontrar la casilla que se pide (por ejemplo `f3`),
   con puntaje. La casilla se pinta verde si acertás, roja si no, y después de dos
   errores se revela en dorado para no frustrarse.
4. **Escribí tu carta** — partida jugable completa desde la posición inicial, con jugadas
   legales de verdad (no se puede dejar el rey propio en jaque; incluye enroque y captura
   al paso). Cada jugada se va anotando con `+`/`#` si corresponde, y la app arma sola el
   texto de la carta, listo para copiar y mandar. También se puede:
   - Girar el tablero (🔄), para ver la partida desde el lado de las negras.
   - Descargar la posición actual como imagen PNG (📷), para mandarla junto con la carta.
   - Pegar las jugadas de una carta recibida y que la app reconstruya el tablero, para
     seguir una partida que se viene jugando por otro canal (por ejemplo WhatsApp).
   - Deshacer la última jugada, y empezar de nuevo (ambos piden confirmación antes de
     borrar algo). La partida se guarda sola, y los nombres de quien escribe y quien
     recibe quedan guardados también.
5. **Consejos** — carrusel de seis tips estratégicos básicos.

## Decisiones de diseño (y por qué)

| Decisión                                                   | Por qué                                                                                                                    |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Notación **española** (C, A, T, D, R) y no inglesa (N, B, R, Q, K) | Es la que van a usar por escrito con la familia de Paulina. La inglesa agregaría una confusión que no hace falta todavía. |
| Concepto visual "Cartero de Ajedrez"                       | Se apoya en el hecho real de que juegan por correspondencia: el tablero tiene aire de sello postal y la carta usa letra manuscrita. |
| Progresión en niveles numerados                            | Es una secuencia real de aprendizaje (ubicar → conocer → mover → escribir → estrategia), no una decoración.                 |
| Peones promocionan siempre a Dama, sin preguntar           | Cubre el caso habitual sin sumar un selector de piezas que complicaría la interfaz a esta edad.                             |
| La carta es copiable con un botón                          | Lo que se practica en el nivel 4 es literalmente lo que se manda. La herramienta conecta con el uso real.                   |
| Los nombres se cargan desde la app, no están en el código  | Doble motivo: no deja nombres de menores en un repositorio público, y la app queda usable por cualquier familia.            |
| El saludo de la carta es neutro ("¡Hola Ana!")             | Los nombres los pone quien usa la app, así que no se puede asumir a quién le escribe.                                       |
| Tablero y controles navegables por teclado (Tab + Enter/Espacio), con `aria-label` por casilla y anuncios de turno/jaque por voz | Hoy la usa una nena de 6 años con un adulto al lado, pero no hay motivo para que sólo funcione con mouse — y es la clase de cosa que después cuesta mucho más agregar. |

**Paleta y tipografía** están definidas como tokens en `src/theme.js`: papel verde agua
`#EAF2F0`, tablero crema `#F5ECD9` y verde azulado `#2A6F77`, acentos dorados de estampilla
`#E8A33D`, coral `#E0574C` para errores, capturas y jaque. Tipografías Baloo 2 (títulos y
botones, redondeada para lectura infantil), Nunito (cuerpo) y Caveat (solo la carta).

### Temas de color

Selector de tema (un emoji por tema, junto al encabezado): **Estándar** (♟️), **Oscuro**
(🌙), **Verde** (🌳), **Unicornio** (🦄) y **Agua** (💧). Se guarda solo y se aplica de
nuevo al volver a abrir la app.

Técnicamente, cada color de `theme.js` no es un valor fijo sino una variable CSS
(`var(--color-cartero-x)`, definida en `index.css`); cambiar de tema sólo cambia qué
paleta de esas variables está activa (según el atributo `data-theme` de `<html>`), sin
tocar ningún componente. Sumar un tema nuevo es agregar un bloque
`[data-theme="nombre"] { ... }` en `index.css` y una entrada en `THEMES` — nada más.

El tablero es la excepción a "todo cambia con el tema": casilla clara y oscura se
mantienen en un rango de luminosidad parecido al del tema estándar (sólo cambia el matiz)
porque las piezas dependen de esa distancia de brillo para leerse — un tablero que se
oscurece del todo deja una pieza negra invisible contra una casilla oscura. Por el mismo
motivo, el color de las piezas (negras/blancas) es fijo: es identidad de la pieza, no un
estilo de interfaz que deba aclararse en modo oscuro.

Cada paleta nueva se verifica con la misma fórmula de contraste de WCAG que se usó para
el tema estándar (ver la tabla de "Decisiones de diseño" y el punto #30 del backlog) —
no alcanza con "invertir los colores".

## Limitaciones conocidas

Son deliberadas para esta primera versión, no bugs:

- **Se deshace una sola jugada**, no la partida entera. Es deliberado (ver punto 24 del
  backlog).

El guardado usa `localStorage`, así que vive **en ese navegador y en ese dispositivo**: la
partida no se sincroniza entre la tablet y la compu (para eso está "pegar las jugadas de
una carta", que reconstruye la posición a mano en el dispositivo que haga falta).

## Estructura

```
index.html                  Punto de entrada, con metadata de Open Graph / Twitter Card
public/favicon.svg          Ícono
public/apple-touch-icon.png Ícono para "agregar a inicio" en iOS
public/og-image.png         Imagen de vista previa al compartir el link
src/
  main.jsx                  Monta React en el DOM
  index.css                 Tailwind + reset mínimo
  App.jsx                   Esqueleto: encabezado, menú de niveles, pie
  theme.js                  Paleta de colores y tipografías
  carta.js                  Texto de la carta y limpieza de nombres (sin React)
  storage.js                Guardado en localStorage, con validación de lo que se lee
  tableroImagen.js          Dibuja el tablero en un <canvas> y descarga el PNG
  chess/engine.js           Motor de movimientos, legales y pseudo-legales (sin React)
  chess/notation.js         Notación algebraica española, escribir y leer (sin React)
  content/pieces.js         Info de cada pieza (PIECE_INFO) y sus glyphs Unicode
  content/tips.js           Los seis consejos del nivel 5
  components/Board.jsx      El tablero: Board y Square
  components/LevelTab.jsx   Botón de navegación entre niveles
  components/ThemePicker.jsx Selector de tema (ver "Temas de color" arriba)
  levels/Level1.jsx ... 4   Un archivo por nivel jugable
  levels/LevelTip.jsx       Nivel 5 (consejos)
  *.test.js                 Tests — se corren con `npm test`
```

La regla de la división: **lo que no depende de React vive afuera de los componentes**,
porque eso es lo que se puede testear sin levantar un navegador.

- `generateMoves(board, row, col, context)` — movimientos pseudo-legales, sin chequear
  jaque; lo usa "Cómo se mueven" para mostrar cómo se mueve una pieza sola (sin `context`,
  así que sin enroque ni captura al paso — ese nivel muestra una pieza sola). `context` es
  `{ castling, enPassant }`: viaja junto al tablero en el estado de la partida, no adentro
  de él, porque ninguna de las dos jugadas se puede derivar mirando sólo la posición.
  `generateLegalMoves` es el que filtra las jugadas que dejan al propio rey en jaque, y es
  el que se usa para jugar de verdad en el nivel 4.
- `moveNotation(board, ...)` — arma el texto de la jugada. Recibe el tablero **anterior**
  a la jugada, porque necesita ver las otras piezas para desambiguar. `parseMove` +
  `resolveMove` son el camino inverso: de texto a jugada, para reconstruir una carta pegada.
- `leerPartida()` / `guardarPartida()` — persistencia. Todo lo que entra se valida: un
  guardado corrupto se descarta y se borra, así no deja la app rota en cada recarga.
- `textoCarta(log, nombres)` — arma la carta que se copia y se manda. `extraerJugadas` es
  el inverso: saca la lista de jugadas de un texto pegado.
- `PIECE_INFO` (`content/pieces.js`) y `TIPS` (`content/tips.js`) — todo el contenido de
  texto está centralizado ahí. Para sumar o corregir contenido no hace falta tocar la UI.

## Qué sigue

Las ideas para continuar —funcionales, técnicas y de UX, ordenadas por prioridad— están
en [`backlog.md`](./backlog.md).

## Licencia

[GPL-3.0-or-later](./LICENSE).
