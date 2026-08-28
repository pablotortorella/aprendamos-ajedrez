// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TIPS } from "../content/tips.js";
import LevelTip from "./LevelTip.jsx";

afterEach(() => {
  cleanup();
});

describe("LevelTip — carrusel de consejos", () => {
  it("arranca en el primer consejo, con su punto marcado como actual", () => {
    render(<LevelTip />);
    expect(screen.getByText(TIPS[0].titulo)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Consejo 1 de 6" })).toHaveAttribute("aria-current", "true");
  });

  it("clickear un punto muestra ese consejo y mueve el aria-current", async () => {
    const user = userEvent.setup();
    render(<LevelTip />);

    await user.click(screen.getByRole("button", { name: "Consejo 3 de 6" }));

    expect(screen.getByText(TIPS[2].titulo)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Consejo 3 de 6" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Consejo 1 de 6" })).not.toHaveAttribute("aria-current");
  });

  it("los puntos son <button> tabulables, y Enter los activa igual que un clic", async () => {
    const user = userEvent.setup();
    render(<LevelTip />);

    const punto2 = screen.getByRole("button", { name: "Consejo 2 de 6" });
    expect(punto2.tagName).toBe("BUTTON");
    punto2.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByText(TIPS[1].titulo)).toBeInTheDocument();
  });

  it("las flechas anterior/siguiente también cambian el consejo", async () => {
    const user = userEvent.setup();
    render(<LevelTip />);

    await user.click(screen.getByRole("button", { name: "Siguiente consejo" }));
    expect(screen.getByText(TIPS[1].titulo)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Consejo anterior" }));
    expect(screen.getByText(TIPS[0].titulo)).toBeInTheDocument();
  });
});
