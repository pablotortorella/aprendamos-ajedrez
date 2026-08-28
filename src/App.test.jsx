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
  // document.documentElement es global y no lo toca cleanup(): si un test deja
  // data-theme puesto, el siguiente test arrancaría con eso ya sucio.
  document.documentElement.removeAttribute("data-theme");
});

describe("App — menú", () => {
  it("muestra los niveles en orden: piezas, cómo se mueven, casillas, carta, consejos, ayuda", () => {
    render(<App />);
    const etiquetas = screen.getAllByRole("button", { name: /\d\.|Consejos|Ayuda/ }).map((b) => b.textContent);
    expect(etiquetas).toEqual([
      "♟️ 1. Conocé piezas",
      "🧭 2. Cómo se mueven",
      "🗺️ 3. Ubicá casillas",
      "✉️ 4. Escribí tu carta",
      "👑 Consejos",
      "❓ Ayuda",
    ]);
  });
});

describe("App — Ayuda", () => {
  it("el botón Ayuda muestra una explicación de cada sección del menú", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /❓ Ayuda/ }));

    expect(screen.getByText("1. Conocé piezas")).toBeInTheDocument();
    expect(screen.getByText("4. Escribí tu carta")).toBeInTheDocument();
    expect(screen.getByText("Consejos")).toBeInTheDocument();
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

describe("App — tema", () => {
  it("arranca sin data-theme puesto (estándar es el default de @theme, no hace falta el atributo)", () => {
    render(<App />);
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
  });

  it("elegir Oscuro pone data-theme='dark' en <html>, y lo guarda", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Oscuro" }));

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("cartero-ajedrez:tema")).toBe("dark");
  });

  it("volver a Estándar saca el atributo del todo, no lo deja en 'estandar'", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Oscuro" }));
    await user.click(screen.getByRole("button", { name: "Estándar" }));

    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
  });

  it("un tema guardado de una sesión anterior se aplica al arrancar", () => {
    localStorage.setItem("cartero-ajedrez:tema", "dark");
    render(<App />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
