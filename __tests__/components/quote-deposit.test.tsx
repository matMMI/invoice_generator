import { render, screen, fireEvent } from "@testing-library/react";
import { QuoteTotals } from "@/components/quotes/quote-totals";
import { QuoteItem } from "@/lib/api/quotes";

describe("QuoteTotals with deposit", () => {
  const mockItems: QuoteItem[] = [
    { description: "Service", quantity: 1, unit_price: 100, total: 100, order: 0 },
  ];

  it("should display deposit field and calculate deposit amount", () => {
    const onTaxRateChange = jest.fn();
    const onDepositPercentageChange = jest.fn();

    render(
      <QuoteTotals
        items={mockItems}
        currency="EUR"
        taxRate={20}
        depositPercentage={30}
        onTaxRateChange={onTaxRateChange}
        onDepositPercentageChange={onDepositPercentageChange}
      />
    );

    // Should display deposit input
    const depositInput = screen.getByLabelText("Acompte (%)");
    expect(depositInput).toBeInTheDocument();
    expect(depositInput).toHaveValue(30);

    // Should display deposit amount (120 * 30% = 36)
    expect(screen.getByText("36,00 €")).toBeInTheDocument();
    expect(screen.getByText("Montant acompte")).toBeInTheDocument();
  });

  it("should call onDepositPercentageChange when deposit input changes", () => {
    const onTaxRateChange = jest.fn();
    const onDepositPercentageChange = jest.fn();

    render(
      <QuoteTotals
        items={mockItems}
        currency="EUR"
        taxRate={20}
        depositPercentage={25}
        onTaxRateChange={onTaxRateChange}
        onDepositPercentageChange={onDepositPercentageChange}
      />
    );

    const depositInput = screen.getByLabelText("Acompte (%)");
    fireEvent.change(depositInput, { target: { value: "50" } });

    expect(onDepositPercentageChange).toHaveBeenCalledWith(50);
  });

  it("should not display deposit amount when deposit percentage is not set", () => {
    const onTaxRateChange = jest.fn();
    const onDepositPercentageChange = jest.fn();

    render(
      <QuoteTotals
        items={mockItems}
        currency="EUR"
        taxRate={20}
        onTaxRateChange={onTaxRateChange}
        onDepositPercentageChange={onDepositPercentageChange}
      />
    );

    // Should display deposit input but no amount
    const depositInput = screen.getByLabelText("Acompte (%)");
    expect(depositInput).toBeInTheDocument();
    expect(depositInput).toHaveValue(null);
    expect(screen.queryByText("Montant acompte")).not.toBeInTheDocument();
  });
});