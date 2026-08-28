// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary.jsx";

function ComponenteQueRompe() {
  throw new Error("boom");
}

afterEach(() => {
  cleanup();
});

describe("ErrorBoundary", () => {
  it("deja pasar los children cuando no hay ningún error", () => {
    render(
      <ErrorBoundary>
        <p>todo bien</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("todo bien")).toBeInTheDocument();
  });

  it("muestra un mensaje en vez de una pantalla en blanco cuando un hijo tira una excepción", () => {
    // React loguea el error a console.error igual que en un navegador real;
    // silenciarlo acá evita ruido en la salida del test sin ocultar el bug real
    // (si getByText de abajo no lo encuentra, el test falla igual).
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ComponenteQueRompe />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/algo se rompió/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recargar" })).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
