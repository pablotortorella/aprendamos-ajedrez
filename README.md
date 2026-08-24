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

| Comando           | Qué hace                                     |
| ----------------- | -------------------------------------------- |
| `npm run build`   | Genera el sitio estático en `dist/`          |
| `npm run preview` | Sirve el `dist/` ya compilado, para revisarlo |

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
- **El progreso no se guarda**: el puntaje y la partida se reinician al recargar.

Las tres primeras están anotadas también en el pie de la app, para que quede claro dentro
del producto y no solo en el repo.

## Estructura

```
index.html            Punto de entrada
public/favicon.svg    Ícono
src/
  main.jsx            Monta React en el DOM
  index.css           Tailwind + reset mínimo
  App.jsx             Toda la app: tokens, motor de movimientos y los 5 niveles
```

Hoy `App.jsx` es un único archivo autocontenido (~800 líneas). Las piezas clave:

- `generateMoves(board, row, col)` — el motor: devuelve los destinos válidos según el
  tipo de pieza, sin chequear jaque.
- `moveNotation(...)` — arma el texto de la jugada usando las letras de `PIECE_INFO`.
- `PIECE_INFO` y `TIPS` — todo el contenido de texto está centralizado acá. Para sumar
  o corregir contenido no hace falta tocar la UI.

Dividir ese archivo es una de las primeras tareas pendientes.

## Qué sigue

Las ideas para continuar —funcionales, técnicas y de UX, ordenadas por prioridad— están
en [`backlog.md`](./backlog.md).

## Licencia

[GPL-3.0-or-later](./LICENSE).
