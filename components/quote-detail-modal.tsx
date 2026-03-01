"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FileText, Info } from "lucide-react";
import React from "react";

interface QuoteItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  detailed_description?: string;
}

interface PublicQuote {
  quote_number: string;
  client_name: string;
  client_email: string;
  client_company: string | null;
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  deposit_percentage?: number;
  deposit_amount?: number;
  notes: string | null;
  payment_terms: string | null;
  items: QuoteItem[];
  status: string;
  is_signed: boolean;
  signed_at: string | null;
  signer_name: string | null;
  created_at: string;
}

interface QuoteDetailModalProps {
  quote: PublicQuote;
  formatCurrency: (amount: number, currency: string) => string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuoteDetailModal({
  quote,
  formatCurrency,
  isOpen,
  onOpenChange,
}: QuoteDetailModalProps) {
  const [selectedItem, setSelectedItem] = React.useState<QuoteItem | null>(
    null
  );
  const [isItemModalOpen, setIsItemModalOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95%] max-h-[90vh] overflow-y-auto sm:max-w-none sm:w-full sm:h-full sm:max-h-none sm:rounded-none sm:border-none">
        <DialogHeader className="sm:hidden">
          <DialogTitle>Détails du devis</DialogTitle>
          <DialogDescription>
            Veuillez vérifier les détails et signer ci-dessous
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="px-3 sm:px-6 py-4">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <CardTitle className="truncate">
                    Devis n°{quote.quote_number}
                  </CardTitle>
                  <CardDescription className="wrap-break-word">
                    Pour : {quote.client_name}
                    {quote.client_company && ` (${quote.client_company})`}
                  </CardDescription>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(quote.total, quote.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">TTC</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4 pt-0 space-y-4">
              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2 sm:p-3 font-medium">
                        Description
                      </th>
                      <th className="text-right p-2 sm:p-3 font-medium">Qté</th>
                      <th className="text-right p-2 sm:p-3 font-medium">
                        Prix unit.
                      </th>
                      <th className="text-right p-2 sm:p-3 font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2 sm:p-3 wrap-break-word max-w-50 sm:max-w-none">
                          <div className="flex items-center gap-2">
                            {item.description}
                            {item.detailed_description && (
                              <Dialog
                                open={
                                  isItemModalOpen &&
                                  selectedItem?.description === item.description
                                }
                                onOpenChange={(open) => {
                                  setIsItemModalOpen(open);
                                  if (!open) setSelectedItem(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 ml-1"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setIsItemModalOpen(true);
                                    }}
                                  >
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl w-[95%] max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <FileText className="h-5 w-5" />
                                      {item.description}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm">
                                      {item.detailed_description}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </td>
                        <td className="p-2 sm:p-3 text-right whitespace-nowrap">
                          {item.quantity}
                        </td>
                        <td className="p-2 sm:p-3 text-right whitespace-nowrap">
                          {formatCurrency(item.unit_price, quote.currency)}
                        </td>
                        <td className="p-2 sm:p-3 text-right font-medium whitespace-nowrap">
                          {formatCurrency(item.total, quote.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total HT</span>
                    <span>
                      {formatCurrency(quote.subtotal, quote.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      TVA ({quote.tax_rate}%)
                    </span>
                    <span>
                      {formatCurrency(quote.tax_amount, quote.currency)}
                    </span>
                  </div>
                  {quote.deposit_percentage && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Acompte ({quote.deposit_percentage}%)
                      </span>
                      <span>
                        {formatCurrency(
                          quote.deposit_amount || 0,
                          quote.currency
                        )}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total TTC</span>
                    <span className="text-primary">
                      {formatCurrency(quote.total, quote.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {(quote.notes || quote.payment_terms) && (
                <div className="space-y-2 text-sm">
                  {quote.notes && (
                    <div className="bg-muted/50 rounded-md px-3 py-2">
                      <span className="font-medium">Notes :</span>{" "}
                      <span className="text-muted-foreground wrap-break-word whitespace-pre-line">
                        {quote.notes}
                      </span>
                    </div>
                  )}
                  {quote.payment_terms && (
                    <div className="bg-muted/50 rounded-md px-3 py-2">
                      <span className="font-medium">
                        Conditions de paiement :
                      </span>{" "}
                      <span className="text-muted-foreground wrap-break-word whitespace-pre-line">
                        {quote.payment_terms}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
