// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemePicker from "./ThemePicker.jsx";

afterEach(() => {
  cleanup();
});

describe("ThemePicker", () => {
  it("muestra un botón por tema, con el activo marcado por aria-current", () => {
    render(<ThemePicker tema="estandar" onCambiarTema={() => {}} />);
    expect(screen.getByRole("button", { name: "Estándar" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Oscuro" })).not.toHaveAttribute("aria-current");
  });

  it("clickear un tema avisa cuál, sin decidir nada por su cuenta", async () => {
    const user = userEvent.setup();
    const onCambiarTema = vi.fn();
    render(<ThemePicker tema="estandar" onCambiarTema={onCambiarTema} />);

    await user.click(screen.getByRole("button", { name: "Oscuro" }));

    expect(onCambiarTema).toHaveBeenCalledWith("dark");
  });

  it("con 'dark' activo, es el botón Oscuro el que queda marcado", () => {
    render(<ThemePicker tema="dark" onCambiarTema={() => {}} />);
    expect(screen.getByRole("button", { name: "Oscuro" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Estándar" })).not.toHaveAttribute("aria-current");
  });
});
