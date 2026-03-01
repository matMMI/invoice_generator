"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuoteItem } from "@/lib/api/quotes";

interface QuoteTotalsProps {
  items: QuoteItem[];
  currency: string;
  taxRate: number;
  depositPercentage?: number;
  onTaxRateChange: (rate: number) => void;
  onDepositPercentageChange?: (percentage: number) => void;
  hideTaxRate?: boolean;
}

export function QuoteTotals({
  items,
  currency,
  taxRate,
  depositPercentage,
  onTaxRateChange,
  onDepositPercentageChange,
  hideTaxRate = false,
}: QuoteTotalsProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0),
    0
  );
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;
  const depositAmount = depositPercentage ? (total * depositPercentage) / 100 : 0;

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

        {!hideTaxRate && (
          <>
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
          </>
        )}

        <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
          <span>Total</span>
          <span>{formatMoney(total)}</span>
        </div>
        
        <div className="flex justify-between items-center gap-4 mt-4">
          <Label
            htmlFor="deposit-percentage"
            className="text-sm text-muted-foreground whitespace-nowrap"
          >
            Acompte (%)
          </Label>
          <Input
            id="deposit-percentage"
            type="number"
            min="0"
            max="100"
            step="1"
            className="w-24 text-right h-8"
            value={depositPercentage || ""}
            onChange={(e) => onDepositPercentageChange && onDepositPercentageChange(Number(e.target.value))}
            placeholder="30"
          />
        </div>
        
        {depositPercentage && depositPercentage > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Montant acompte</span>
            <span>{formatMoney(depositAmount)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
