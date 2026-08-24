// Sólo lo usan los tests de componentes (entorno jsdom, ver
// "@vitest-environment jsdom" en esos archivos). Los tests de motor,
// notación, carta y guardado no lo necesitan y no lo cargan.
import "@testing-library/jest-dom/vitest";
