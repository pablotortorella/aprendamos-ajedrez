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

**Los cuatro P0 están cerrados.**

---

## P1 — Cierra el círculo de la correspondencia

### 5. Nivel "Leé la carta de Paulina"

Hoy la app solo sirve para **escribir**. La mitad del intercambio —entender lo que llega—
sigue siendo trabajo de un adulto.

- Pegar el texto de la carta que llegó y que el tablero reproduzca las jugadas, una por una,
  con botones de anterior/siguiente.
- Necesita un parser de notación española → movimiento, que es el inverso exacto de
  `moveNotation`. Bien testeado, se puede reusar para validar lo que la app misma escribe.
- Es la funcionalidad de mayor valor pedagógico que falta: le enseña a leer, no solo a anotar.

### 6. Continuar una partida ya empezada

Poder pegar las jugadas anteriores y que la app reconstruya la posición, en vez de tener
que rejugarlas a mano cada vez. Depende del parser del punto 5.

### 7. Detección de jaque

Marcar el rey en peligro con un borde coral y escribir el `+` en la notación (y `#` en
mate). Es el próximo concepto de ajedrez que corresponde aprender, y también hace que las
cartas sean notacionalmente correctas.

- Implica pasar de movimientos pseudo-legales a legales: filtrar las jugadas que dejan al
  propio rey en jaque. Es lo que hoy permite "comerse el rey" y que la partida siga.

### 8. Girar el tablero cuando juegan las negras

Si Celeste juega con negras, hoy ve la partida al revés. Un botón de girar (o giro
automático según el turno) resuelve el modo "dos jugadores en el mismo dispositivo".

---

## P2 — Salud técnica

Nada de esto se ve, pero sin esto cada cambio nuevo cuesta más que el anterior.

### 9. Terminar de partir `src/App.jsx`

Ya salieron el motor (`chess/engine.js`), la notación (`chess/notation.js`) y el guardado
(`storage.js`). Falta lo que sigue siendo UI en un solo archivo:

```
src/
  content/pieces.js     PIECE_INFO
  content/tips.js       TIPS
  components/Board.jsx  Board, Square
  levels/Level1.jsx ... un archivo por nivel
  theme.js              COLORS y tipografías
```

Menos urgente que antes: lo testeable ya está afuera. Es prolijidad, no riesgo.

### 10. Tests de los componentes

El motor, la notación y el guardado ya tienen tests (`npm test`). Lo que no tiene son los
componentes React: hoy esa parte se verifica a mano en el navegador.

- Sumar `@testing-library/react` y cubrir el flujo del nivel 4 (jugar, deshacer, reiniciar).
- Un test que valide que la partida guardada se recupera al montar el componente.

### 11. Linter, formato y CI

- ESLint + Prettier, para que el estilo no se discuta a mano.
- GitHub Actions que corra `lint + test + build` en cada PR. Hoy nada impide subir algo
  que no compila.

### 12. Bugs técnicos concretos ya detectados

- ~~**`Level1`**: `setReveal(true)` dentro del updater de `setMisses`.~~ Resuelto: la
  pista dorada ya no es estado, se deriva de `misses >= 2`.
- ~~**`Level1`**: se podían sumar puntos repetidos tocando la casilla correcta durante la
  animación.~~ Resuelto: el tablero ignora los toques mientras muestra el acierto.
- ~~**`Level1`**: los `setTimeout` no se limpiaban al desmontar.~~ Resuelto: un solo
  temporizador a la vez, cancelado al desmontar.
- ~~**`Level4`**: `copy[copy.length - 1]` asumía que ya existía una entrada de las
  blancas.~~ Resuelto al guardar la partida: ahora `agregarJugada` anota `"…"` si llegara
  una jugada de negras con el historial vacío.
- **Copiar la carta**: si `navigator.clipboard` falla (contexto no seguro, permisos), el
  `catch` sólo hace `setCopied(false)` y no pasa nada visible. Hay que mostrar un mensaje
  y ofrecer el texto seleccionable como alternativa.

### 13. Fuentes

Se importan con `@import` dentro de un `<style>` inyectado en el body. Funciona, pero es
la ruta más lenta y depende de tener internet.

- Moverlas a `index.html` con `preconnect`, o
- Auto-hospedarlas (`@fontsource`) para que la app ande sin conexión.

### 14. Tokens de color como tema de Tailwind

Hoy conviven `style={{}}` inline con clases de Tailwind, así que la paleta vive en dos
lugares. Tailwind 4 permite declarar los colores con `@theme` en `index.css` y usarlos
como `bg-tablero-oscuro`. Menos ruido en el JSX y un solo lugar donde cambiar la paleta.

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
- **Porque el nivel "leer la carta" (punto 5) ya necesita ese mecanismo**: avanzar y
  retroceder jugadas es exactamente lo que hace ese nivel.

Por eso conviene hacerlo *con* el punto 5 y no antes: ahí el rebobinado no es una función
extra en un tablero de juego, sino el modo de uso natural de una pantalla nueva.

Implica cambiar `previous` (una sola posición) por un historial de posiciones. El estado
del nivel 4 ya está agrupado en un solo objeto, así que el cambio queda contenido.

---

## P5 — Más adelante

- **Más contenido**: mates básicos (mate del pasillo, mate del loco), un glosario, y
  consejos que se desbloqueen a medida que avanza.
- **PWA**: instalable y funcionando sin internet, para usarla en la tablet en cualquier lado.
- **Publicar en GitHub Pages**: hoy hay que clonar el repo y correr `npm install` para
  verla. Un link haría que Alejo y Paulina la puedan usar también. El `base: "./"` del
  `vite.config.js` ya está puesto para eso.
- **Modo dos jugadores en un dispositivo**, con el tablero girando en cada turno.
- **Exportar la partida en PGN**, para poder abrirla en Lichess y revisarla juntos.
