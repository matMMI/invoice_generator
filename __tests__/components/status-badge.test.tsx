import React from "react";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/status-badge";
import "@testing-library/jest-dom";

describe("StatusBadge", () => {
  it("renders the correct label for 'Draft' status", () => {
    render(<StatusBadge status="Draft" />);
    expect(screen.getByText("Brouillon")).toBeInTheDocument();
  });

  it("renders the correct label for 'Signed' status", () => {
    render(<StatusBadge status="Signed" />);
    expect(screen.getByText("Signé")).toBeInTheDocument();
  });

  it("is case insensitive", () => {
    render(<StatusBadge status="signed" />);
    expect(screen.getByText("Signé")).toBeInTheDocument();
  });

  // Note: Testing classes (colors) is tricky because they are passed to shadcn Badge
  // We assume shadcn Badge works, but we can check if it passed the variant prop logic?
  // Easier to check class names if we know what secondary/info variant maps to.
  // Or just trusting the mapping logic in component which converts status -> variant.

  it("applies additional className", () => {
    render(<StatusBadge status="Draft" className="test-class" />);
    const badge = screen.getByText("Brouillon");
    expect(badge).toHaveClass("test-class");
  });
});
