"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SignatureCanvas } from "@/components/signature-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CheckCircle, FileText, AlertCircle, Loader2 } from "lucide-react";

interface QuoteItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
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
  notes: string | null;
  payment_terms: string | null;
  items: QuoteItem[];
  status: string;
  is_signed: boolean;
  signed_at: string | null;
  signer_name: string | null;
  created_at: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SignQuotePage() {
  const params = useParams();
  const token = params.token as string;

  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    async function fetchQuote() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/quotes/${token}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Erreur lors du chargement du devis");
        }
        const data = await res.json();
        setQuote(data);
        if (data.is_signed) {
          setSigned(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchQuote();
    }
  }, [token]);

  const handleSign = async () => {
    if (!signerName.trim()) {
      toast.error("Veuillez entrer votre nom");
      return;
    }
    if (!signatureData) {
      toast.error("Veuillez signer dans le cadre");
      return;
    }

    setSigning(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/public/quotes/${token}/sign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            signer_name: signerName,
            signature_data: signatureData,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Erreur lors de la signature");
      }

      setSigned(true);
      toast.success("Devis signé avec succès !");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur de signature");
    } finally {
      setSigning(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement du devis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Erreur</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">Devis Signé</CardTitle>
            <CardDescription>
              {quote.signer_name
                ? `Signé par ${quote.signer_name}`
                : "Ce devis a été signé électroniquement"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Devis n°{quote.quote_number} •{" "}
              {formatCurrency(quote.total, quote.currency)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Vous pouvez fermer cette page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <FileText className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold">Signature de Devis</h1>
          <p className="text-muted-foreground">
            Veuillez vérifier les détails et signer ci-dessous
          </p>
        </div>

        <div className="space-y-8">
          {/* Quote Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Devis n°{quote.quote_number}</CardTitle>
                  <CardDescription>
                    Pour : {quote.client_name}
                    {quote.client_company && ` (${quote.client_company})`}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(quote.total, quote.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">TTC</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items Table */}
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-right p-3 font-medium">Qté</th>
                      <th className="text-right p-3 font-medium">Prix unit.</th>
                      <th className="text-right p-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">
                          {formatCurrency(item.unit_price, quote.currency)}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {formatCurrency(item.total, quote.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
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
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total TTC</span>
                    <span className="text-primary">
                      {formatCurrency(quote.total, quote.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {quote.notes && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{quote.notes}</p>
                </div>
              )}

              {/* Payment Terms */}
              {quote.payment_terms && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">
                    Conditions de paiement
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {quote.payment_terms}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signature Section */}
          <Card>
            <CardHeader>
              <CardTitle>Signature électronique</CardTitle>
              <CardDescription>
                En signant, vous acceptez les termes de ce devis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signer-name">Votre nom complet</Label>
                <Input
                  id="signer-name"
                  placeholder="Jean Dupont"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Votre signature</Label>
                <div className="h-[250px] w-full">
                  <SignatureCanvas
                    onSignatureChange={setSignatureData}
                    width={undefined} // Responsive
                    height={250}
                  />
                </div>
              </div>

              <Button
                onClick={handleSign}
                disabled={signing || !signerName || !signatureData}
                className="w-full"
                size="lg"
              >
                {signing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signature en cours...
                  </>
                ) : (
                  "Signer et accepter ce devis"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Votre signature sera horodatée et votre adresse IP enregistrée
                pour valeur probante.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
