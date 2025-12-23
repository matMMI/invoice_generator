"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuoteItem } from "@/lib/api/quotes";
import { Card, CardContent } from "@/components/ui/card";

interface QuoteTotalsProps {
  items: QuoteItem[];
  currency: string;
  taxRate: number;
  onTaxRateChange: (rate: number) => void;
}

export function QuoteTotals({
  items,
  currency,
  taxRate,
  onTaxRateChange,
}: QuoteTotalsProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0),
    0
  );
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const formatMoney = (amount: number) => {
    return amount.toLocaleString("fr-FR", {
      style: "currency",
      currency: currency,
    });
  };

  return (
    <Card className="w-full md:w-1/3 ml-auto">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Sous-total</span>
          <span className="font-medium">{formatMoney(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center gap-4">
          <Label
            htmlFor="tax-rate"
            className="text-sm text-muted-foreground whitespace-nowrap"
          >
            Taux TVA (%)
          </Label>
          <Input
            id="tax-rate"
            type="number"
            min="0"
            max="100"
            step="0.1"
            className="w-24 text-right h-8"
            value={taxRate}
            onChange={(e) => onTaxRateChange(Number(e.target.value))}
          />
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Montant TVA</span>
          <span>{formatMoney(taxAmount)}</span>
        </div>

        <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
          <span>Total</span>
          <span>{formatMoney(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
