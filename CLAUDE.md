# Instrucciones para Claude — El Cartero de Ajedrez

**Leé esto antes de tocar código.** El resto de la documentación vive en dos lugares
nada más: [README.md](README.md) (qué es la app, cómo se usa, decisiones de diseño y por
qué) y [backlog.md](backlog.md) (qué se hizo, por qué, y qué sigue — es la fuente de
verdad del proyecto, más que este archivo).

## Qué es esto

App de ajedrez por correspondencia para aprender notación algebraica española, hecha
para Celeste (6 años). React + Vite + Tailwind, **100% estática** (sin backend, sin base
de datos), desplegada en GitHub Pages. El detalle completo está en el README.

## Al empezar una sesión

```bash
git pull origin main
npm install
npm test
```

Si algo falla, arreglarlo antes de seguir — no construir sobre una base rota.

## Reglas no negociables

- **Tests primero.** Cambio de lógica (motor de ajedrez, notación, storage) → test en
  Vitest en el mismo commit. Cambio de UI → test con `@testing-library/react`. Un cambio
  puramente cosmético puede saltearse.
- **Commits chicos y en capas.** Un cambio lógico por commit; una feature grande (por
  ejemplo, el enroque) se separa en capas — motor, notación, storage, UI — en vez de un
  commit gigante. El mensaje explica el *por qué*, no sólo el qué; eso es lo que hace que
  `git log` sirva de documentación por sí solo.
- **Documentar en `backlog.md` en el mismo bloque de trabajo**, no después. Cuando algo se
  termina, se tacha con `~~texto~~` y se mueve a la sección "✅ Hecho" — los números son
  identificadores estables, no se renumera el resto.
- **Nunca hacer `git push` sin confirmación explícita de Pablo.** Acá no hay staging:
  GitHub Pages *es* producción, y el deploy es automático (GitHub Actions) en cada push a
  `main`. El push ES el deploy — la aprobación antes de pushear cumple el mismo rol que el
  gate de staging→producción en un proyecto con backend.
- **Probar en el navegador antes de dar un cambio de UI por terminado**, no sólo confiar
  en los tests automáticos. `npm run dev` y mirarlo de verdad; si no hay navegador a mano,
  Playwright headless apuntando al dev server sirve igual.

## Nunca hacer

- Force-push a `main`.
- Pushear con tests, lint o build rotos.
- Ignorar un test que falla en vez de entender por qué falla.
- Hardcodear nombres o datos de menores en el código — por eso `nombres` se cargan desde
  la app y no del código fuente (ver README, tabla de decisiones de diseño).
- Bajar el nivel de un test para que pase, en vez de arreglar lo que prueba.

## Antes de terminar

```bash
npm run format:check && npm run lint && npm test && npm run build
```

Los cuatro en verde antes de pushear — es lo mismo que corre
[`.github/workflows/ci.yml`](.github/workflows/ci.yml) en cada push y cada PR.
