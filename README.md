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
| `npm run build`    | Genera el sitio estático en `dist/`           |
| `npm run preview`  | Sirve el `dist/` ya compilado, para revisarlo  |

Stack: **Vite + React 19 + Tailwind CSS 4**. No hay backend ni base de datos: es una
app 100% estática, se puede publicar en cualquier hosting de archivos.

## Los 5 niveles

1. **Ubicá las casillas** — juego de encontrar la casilla que se pide (por ejemplo `f3`),
   con puntaje. La casilla se pinta verde si acertás, roja si no, y después de dos
   errores se revela en dorado para no frustrarse.
2. **Conocé las piezas** — seis tarjetas (Peón, Caballo, Alfil, Torre, Dama, Rey). Se
   tocan para expandir y ver valor en puntos, ejemplo de notación y un dato curioso.
3. **Cómo se mueven** — elegís una pieza sobre un tablero vacío, ves todos sus destinos
   posibles marcados en verde, y al tocar uno te muestra cómo se escribe esa jugada.
4. **Escribí tu carta** — partida jugable completa desde la posición inicial. Cada jugada
   se va anotando y la app arma sola el texto de la carta, listo para copiar y mandar.
   La partida se guarda sola (una partida por correspondencia dura semanas), se puede
   deshacer la última jugada, y empezar de nuevo pide confirmación antes de borrar.
5. **Consejos** — carrusel de seis tips estratégicos básicos.

## Decisiones de diseño (y por qué)

| Decisión                                                   | Por qué                                                                                                                    |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Notación **española** (C, A, T, D, R) y no inglesa (N, B, R, Q, K) | Es la que van a usar por escrito con la familia de Paulina. La inglesa agregaría una confusión que no hace falta todavía. |
| Concepto visual "Cartero de Ajedrez"                       | Se apoya en el hecho real de que juegan por correspondencia: el tablero tiene aire de sello postal y la carta usa letra manuscrita. |
| Progresión en niveles numerados                            | Es una secuencia real de aprendizaje (ubicar → conocer → mover → escribir → estrategia), no una decoración.                 |
| Peones promocionan siempre a Dama, sin preguntar           | Cubre el caso habitual sin sumar un selector de piezas que complicaría la interfaz a esta edad.                             |
| La carta es copiable con un botón                          | Lo que se practica en el nivel 4 es literalmente lo que se manda. La herramienta conecta con el uso real.                   |

**Paleta y tipografía** están definidas como tokens al principio de `src/App.jsx`:
papel verde agua `#EAF2F0`, tablero crema `#F5ECD9` y verde azulado `#2A6F77`, acentos
dorados de estampilla `#E8A33D`, coral `#E0574C` para errores y capturas. Tipografías
Baloo 2 (títulos y botones, redondeada para lectura infantil), Nunito (cuerpo) y Caveat
(solo la carta).

## Limitaciones conocidas

Son deliberadas para esta primera versión, no bugs:

- **No hay enroque ni captura al paso.**
- **No hay detección de jaque ni de jaque mate.**
- Los movimientos son **pseudo-legales**: la app no valida si una jugada deja al rey
  propio en jaque. En un contexto de partida amistosa entre chicas y sus papás, esa capa
  todavía no hace falta.
- Como consecuencia de lo anterior, la desambiguación puede **aclarar de más**: una pieza
  clavada cuenta igual como candidata, así que a veces escribe `Cbd2` donde `Cd2` ya
  alcanzaba. Es el lado seguro del error — de más siempre se entiende, de menos es ambiguo.
- **Se deshace una sola jugada**, no la partida entera. Es deliberado (ver punto 24 del
  backlog).

Las dos primeras están anotadas también en el pie de la app, para que quede claro dentro
del producto y no solo en el repo.

El guardado usa `localStorage`, así que vive **en ese navegador y en ese dispositivo**: la
partida no se sincroniza entre la tablet y la compu.

## Estructura

```
index.html               Punto de entrada
public/favicon.svg       Ícono
src/
  main.jsx               Monta React en el DOM
  index.css              Tailwind + reset mínimo
  App.jsx                Interfaz: tokens visuales, contenido y los 5 niveles
  storage.js             Guardado en localStorage, con validación de lo que se lee
  chess/engine.js        Motor de movimientos (sin React)
  chess/notation.js      Notación algebraica española (sin React)
  chess/*.test.js        Tests — se corren con `npm test`
  storage.test.js
```

La regla de la división: **lo que no depende de React vive afuera de `App.jsx`**, porque
eso es lo que se puede testear sin levantar un navegador.

- `generateMoves(board, row, col)` — el motor: devuelve los destinos válidos según el
  tipo de pieza, sin chequear jaque.
- `moveNotation(board, ...)` — arma el texto de la jugada. Recibe el tablero **anterior**
  a la jugada, porque necesita ver las otras piezas para desambiguar.
- `leerPartida()` / `guardarPartida()` — persistencia. Todo lo que entra se valida: un
  guardado corrupto se descarta y se borra, así no deja la app rota en cada recarga.
- `PIECE_INFO` y `TIPS` en `App.jsx` — todo el contenido de texto está centralizado ahí.
  Para sumar o corregir contenido no hace falta tocar la UI.

Terminar de dividir la parte de interfaz sigue pendiente (punto 9 del backlog), pero ya
no es urgente: lo testeable está afuera.

## Qué sigue

Las ideas para continuar —funcionales, técnicas y de UX, ordenadas por prioridad— están
en [`backlog.md`](./backlog.md).

## Licencia

[GPL-3.0-or-later](./LICENSE).
