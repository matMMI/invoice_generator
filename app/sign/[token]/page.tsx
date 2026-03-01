"use client";
import { SignatureCanvas } from "@/components/signature-canvas";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SignQuotePage() {
  const params = useParams();
  const token = params.token as string;

  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signerFunction, setSignerFunction] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [selectedItem, setSelectedItem] = useState<QuoteItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuoteDetailModalOpen, setIsQuoteDetailModalOpen] = useState(false);
  const [expandedItems, setExpandedItems] = React.useState<
    Record<number, boolean>
  >({});

  const toggleDescription = (index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
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
        } else {
          if (data.client_name) setSignerName(data.client_name);
          if (data.client_email) setSignerEmail(data.client_email);
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
    if (
      !signerEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signerEmail)
    ) {
      toast.error("Veuillez entrer une adresse email valide");
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
            signer_email: signerEmail,
            signer_function: signerFunction || null,
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
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Une copie de ce document est conservée.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a
                href={`${API_BASE_URL}/api/public/quotes/${token}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger le devis signé
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-4 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto space-y-4 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-4 space-y-3">
          <FileText className="h-12 w-12 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Signature de Devis</h1>
            <p className="text-muted-foreground">
              Veuillez vérifier les détails et signer ci-dessous
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a
              href={`${API_BASE_URL}/api/public/quotes/${token}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger le PDF
            </a>
          </Button>
        </div>

        <div className="space-y-4">
          <Dialog
            open={isQuoteDetailModalOpen}
            onOpenChange={setIsQuoteDetailModalOpen}
          >
            <DialogTrigger asChild>
              <Button variant="blue" className="w-full">
                Voir les détails du devis
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-none w-screen h-screen p-0 m-0 fixed top-0 left-0 translate-x-0 translate-y-0 sm:max-w-none rounded-none [&>button]:hidden">
              <DialogHeader className="sr-only">
                <DialogTitle>Détails du devis</DialogTitle>
                <DialogDescription>
                  Affichage des détails complets du devis
                </DialogDescription>
              </DialogHeader>
              <div className="w-full h-full overflow-y-auto">
                <Card className="border-none shadow-none rounded-none">
                  <CardHeader className="px-3 sm:px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate">
                          Devis n°{quote.quote_number}
                        </CardTitle>
                        <CardDescription className="break-words">
                          Pour : {quote.client_name}
                          {quote.client_company && ` (${quote.client_company})`}
                        </CardDescription>
                      </div>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 px-3 w-fit shrink-0"
                        >
                          Fermer
                        </Button>
                      </DialogTrigger>
                    </div>
                  </CardHeader>

                  <div className="px-3 sm:px-6 pb-4 pt-0 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Sous-total HT
                      </span>
                      <span>
                        {formatCurrency(quote.subtotal, quote.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
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

                    {quote.deposit_percentage && (
                      <div className="rounded-md bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 px-4 py-3 space-y-2">
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          Après signature, vous vous engagez à régler dès que
                          possible un acompte de{" "}
                          <span className="underline font-bold">
                            {formatCurrency(
                              quote.deposit_amount || 0,
                              quote.currency
                            )}
                          </span>{" "}
                          afin de confirmer votre engagement et de garantir le
                          bon déroulement de la mission.
                        </p>
                        <div className="flex justify-between items-center text-orange-700 dark:text-orange-400 font-semibold text-sm">
                          <span>
                            Acompte à régler ({quote.deposit_percentage}%)
                          </span>
                          <span>
                            {formatCurrency(
                              quote.deposit_amount || 0,
                              quote.currency
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-orange-800 dark:text-orange-300 font-bold text-sm border-t border-orange-200 dark:border-orange-700 pt-2">
                          <span>
                            Reste à régler à la livraison (
                            {100 - Number(quote.deposit_percentage)}%)
                          </span>
                          <span>
                            {formatCurrency(
                              quote.total - (quote.deposit_amount || 0),
                              quote.currency
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <CardContent className="px-3 sm:px-6 pb-4 pt-0 space-y-4">
                    <div className="rounded-lg border overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2 sm:p-3 font-medium">
                              Description
                            </th>
                            <th className="text-right p-2 sm:p-3 font-medium">
                              Qté
                            </th>
                            <th className="text-right p-2 sm:p-3 font-medium">
                              Prix unit.
                            </th>
                            <th className="text-right p-2 sm:p-3 font-medium">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {quote.items.map((item, index) => {
                            const isExpanded = !!expandedItems[index];
                            return (
                              <React.Fragment key={index}>
                                <tr className="hover:cursor-pointer border-t group hover:bg-muted/10 transition-colors">
                                  <td
                                    onClick={() => toggleDescription(index)}
                                    className="p-2 sm:p-3 break-words max-w-xs sm:max-w-none"
                                  >
                                    <div className="flex items-center gap-2">
                                      {item.detailed_description && (
                                        <span
                                          className="mt-0.5 p-1 hover:bg-muted rounded-md transition-all flex-shrink-0"
                                          aria-expanded={isExpanded}
                                        >
                                          <ChevronRight
                                            size={16}
                                            className={`text-muted-foreground transition-transform duration-200 ${
                                              isExpanded ? "rotate-90" : ""
                                            }`}
                                          />
                                        </span>
                                      )}
                                      <span className="leading-tight">
                                        {item.description}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-2 sm:p-3 text-right whitespace-nowrap ">
                                    {item.quantity}
                                  </td>
                                  <td className="p-2 sm:p-3 text-right whitespace-nowrap">
                                    {formatCurrency(
                                      item.unit_price,
                                      quote.currency
                                    )}
                                  </td>
                                  <td className="p-2 sm:p-3 text-right font-medium whitespace-nowrap">
                                    {formatCurrency(item.total, quote.currency)}
                                  </td>
                                </tr>
                                {item.detailed_description && isExpanded && (
                                  <tr className="border-t bg-muted/20">
                                    <td
                                      colSpan={4}
                                      className="p-2 sm:px-10 pb-4 border-b w-0"
                                    >
                                      <div className="overflow-x-auto max-w-full">
                                        <div className="text-sm text-muted-foreground whitespace-pre-wrap min-w-max leading-relaxed">
                                          {item.detailed_description}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {(quote.notes || quote.payment_terms) && (
                      <div className="space-y-2 text-sm">
                        {quote.notes && (
                          <div className="bg-muted/50 rounded-md px-3 py-2">
                            <span className="font-medium">Notes :</span>{" "}
                            <span className="text-muted-foreground break-words whitespace-pre-line">
                              {quote.notes}
                            </span>
                          </div>
                        )}
                        {quote.payment_terms && (
                          <div className="bg-muted/50 rounded-md px-3 py-2">
                            <span className="font-medium">
                              Conditions de paiement :
                            </span>{" "}
                            <span className="text-muted-foreground break-words whitespace-pre-line">
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

          <Card>
            <CardHeader className="px-3 sm:px-6 py-4">
              <CardTitle>Signature électronique</CardTitle>
              <CardDescription>
                En signant, vous acceptez les termes de ce devis
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4 pt-0 space-y-4">
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
                <Label htmlFor="signer-email">Votre adresse email</Label>
                <Input
                  id="signer-email"
                  type="email"
                  placeholder="jean.dupont@exemple.fr"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signer-function">Fonction (optionnel)</Label>
                <Input
                  id="signer-function"
                  placeholder="Directeur technique, Gérant..."
                  value={signerFunction}
                  onChange={(e) => setSignerFunction(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Votre signature</Label>
                <div className="w-full">
                  <SignatureCanvas
                    onSignatureChange={setSignatureData}
                    width={undefined}
                    height={250}
                  />
                </div>
              </div>

              <Button
                onClick={handleSign}
                disabled={
                  signing || !signerName || !signerEmail || !signatureData
                }
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
                Votre signature sera horodatée pour valeur probante.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
