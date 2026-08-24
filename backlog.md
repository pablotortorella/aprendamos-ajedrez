# Backlog — El Cartero de Ajedrez

Ideas para seguir el desarrollo, ordenadas por prioridad. No son compromisos: son
candidatas a discutir. Cada una dice **qué**, **por qué** y **qué implica**.

Criterio de orden: primero lo que hace que la herramienta cumpla su promesa real
(que Celeste pueda mandar y leer jugadas sin errores), después lo que la hace
sostenible, y al final lo que la hace más linda.

---

## P0 — Rompe la promesa del producto

Cosas que pueden hacer que una carta salga mal o que se pierda trabajo real.

### 1. Desambiguación en la notación

Hoy si dos caballos pueden llegar a la misma casilla, la app escribe `Cd2` para los dos.
La notación correcta sería `Cbd2` o `C1d2`. **Es el bug más importante del proyecto**:
Paulina recibiría una jugada que no se puede reproducir sin adivinar, que es exactamente
lo que la app viene a evitar.

- Dónde: `moveNotation(...)` en `src/App.jsx`.
- Cómo: antes de escribir, buscar todas las piezas del mismo tipo y color que también
  podrían ir a esa casilla. Si hay más de una, desambiguar por columna; si comparten
  columna, por fila.
- Es una función pura → primer candidato natural para tener tests.

### 2. Guardar la partida del nivel 4

Una partida por correspondencia dura semanas. Hoy recargar la página borra todo. Si
Celeste cierra la pestaña, perdió la partida.

- Guardar en `localStorage`: tablero, turno e historial de jugadas.
- Guardar también el puntaje del nivel 1 (hoy también se reinicia).
- Agregar un botón explícito de "Empezar una partida nueva" que confirme antes de borrar
  (el botón actual "Empezar de nuevo" ya borra sin preguntar).

### 3. Deshacer la última jugada

Una nena de 6 años va a tocar la casilla equivocada, y hoy no hay vuelta atrás: hay que
reiniciar la partida entera. Es la causa más probable de frustración con la app.

- Guardar el historial de tableros (no solo de notaciones) y permitir volver un paso.

### 4. Sacar los nombres del código

`Paulina` y `Celeste` están hardcodeados en el texto de la carta. Son nenas de 6 años y
el repositorio es público.

- Mover a una pantalla de configuración simple (o un `config.js`) los nombres de quien
  escribe y quien recibe.
- Beneficio doble: privacidad, y la app queda reutilizable por cualquier otra familia.

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

### 9. Partir `src/App.jsx`

Son ~800 líneas con todo adentro: tokens, motor, notación, UI y los cinco niveles.

Propuesta de división:

```
src/
  chess/engine.js       generateMoves, board helpers  (funciones puras)
  chess/notation.js     moveNotation + futuro parser   (funciones puras)
  content/pieces.js     PIECE_INFO
  content/tips.js       TIPS
  components/Board.jsx  Board, Square
  levels/Level1.jsx ... un archivo por nivel
  theme.js              COLORS y tipografías
```

El motor y la notación son funciones puras sin React: separarlas es lo que hace posible
testearlas.

### 10. Tests con Vitest

El motor es el candidato perfecto: entra un tablero, sale una lista de movimientos.

Casos que hay que cubrir sí o sí:

- Caballo en la esquina (a1) → 2 movimientos, no 8.
- Peón con el doble paso bloqueado por una pieza justo adelante.
- Peón que no puede comer de frente.
- Torre/alfil/dama frenados por pieza propia vs. capturando pieza rival.
- Promoción → notación `=D`.
- Desambiguación (punto 1), una vez implementada.

### 11. Linter, formato y CI

- ESLint + Prettier, para que el estilo no se discuta a mano.
- GitHub Actions que corra `lint + test + build` en cada PR. Hoy nada impide subir algo
  que no compila.

### 12. Bugs técnicos concretos ya detectados

- **`Level1`**: `setReveal(true)` se llama **dentro** del updater de `setMisses`. Los
  updaters de estado deben ser puros; en `StrictMode` React los ejecuta dos veces en
  desarrollo. Mover ese efecto afuera.
- **`Level1`**: durante los 700 ms de la animación de acierto se puede volver a tocar la
  casilla correcta y sumar puntos repetidos. Bloquear la entrada mientras hay feedback
  activo.
- **`Level1`**: los `setTimeout` no se limpian al desmontar. Si se cambia de nivel justo
  después de responder, queda un `setState` huérfano. Usar `useEffect` con cleanup.
- **`Level4`**: `copy[copy.length - 1]` asume que ya existe una entrada de las blancas.
  Hoy es cierto porque siempre empiezan blancas, pero se rompe apenas se agregue "cargar
  una posición" o "empezar con negras". Manejar el caso explícitamente.
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
Depende de tener persistencia (punto 2).

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
