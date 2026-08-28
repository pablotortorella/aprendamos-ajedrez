// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("App — menú", () => {
  it("muestra los niveles en orden: piezas, cómo se mueven, casillas, carta, consejos", () => {
    render(<App />);
    const etiquetas = screen.getAllByRole("button", { name: /\d\.|Consejos/ }).map((b) => b.textContent);
    expect(etiquetas).toEqual([
      "♟️ 1. Conocé piezas",
      "🧭 2. Cómo se mueven",
      "🗺️ 3. Ubicá casillas",
      "✉️ 4. Escribí tu carta",
      "👑 Consejos",
    ]);
  });
});

describe("App — link cruzado entre 'Conocé piezas' y 'Cómo se mueven'", () => {
  it("desde una pieza abierta en 'Conocé piezas', ir a 'Cómo se mueven' la deja preseleccionada", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText("Torre").closest("button"));
    await user.click(screen.getByRole("button", { name: /Ver cómo se mueve la torre/i }));

    // "Cómo se mueven" quedó activo, con la Torre seleccionada en su selector de piezas.
    expect(screen.getByText(/adónde puede ir la torre/)).toBeInTheDocument();
  });

  it("desde 'Cómo se mueven', volver a 'Conocé piezas' deja esa pieza expandida", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /2\. Cómo se mueven/ }));
    // Nivel 3 (Cómo se mueven) arranca con el Caballo seleccionado por defecto.
    await user.click(screen.getByRole("button", { name: /Conocé más sobre el caballo/i }));

    // De vuelta en "Conocé piezas", con el panel del Caballo ya abierto.
    expect(screen.getByText("Valor:")).toBeInTheDocument();
    expect(screen.getByText(/3 puntos/)).toBeInTheDocument();
  });

  it("navegar por el menú normal (sin cross-link) no deja pegada una pieza de una visita anterior", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Cruzamos de Torre (Conocé piezas) a Cómo se mueven...
    await user.click(screen.getByText("Torre").closest("button"));
    await user.click(screen.getByRole("button", { name: /Ver cómo se mueve la torre/i }));
    // ...y volvemos a "Conocé piezas" por la pestaña del menú, no por el link cruzado.
    await user.click(screen.getByRole("button", { name: /1\. Conocé piezas/ }));

    // Ninguna tarjeta debería quedar abierta sola por la navegación anterior.
    expect(screen.queryByText("Valor:")).not.toBeInTheDocument();
  });
});
