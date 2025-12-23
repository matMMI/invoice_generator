"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileDown,
  Loader2,
  Calendar,
  User,
  Hash,
} from "lucide-react";
import {
  Quote,
  QuoteStatus,
  getQuote,
  updateQuote,
  deleteQuote,
} from "@/lib/api/quotes";
import { getClient, Client } from "@/lib/api/clients";
import { generateQuotePdf } from "@/lib/api/pdf";
import { toast } from "sonner";

export default function QuoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const quoteData = await getQuote(quoteId);
        setQuote(quoteData);
        // Fetch client info
        const clientData = await getClient(quoteData.client_id);
        setClient(clientData);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load quote");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [quoteId]);

  const handleStatusChange = async (newStatus: QuoteStatus) => {
    if (!quote) return;
    setStatusUpdating(true);
    try {
      const updated = await updateQuote(quote.id, { status: newStatus });
      setQuote(updated);
      toast.success(`Statut mis à jour : ${newStatus}`);
    } catch (e) {
      toast.error("Échec de la mise à jour du statut");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!quote) return;
    setGeneratingPdf(true);
    try {
      await generateQuotePdf(quote.id);
      toast.success("PDF téléchargé !");
    } catch (e: any) {
      toast.error(e.message || "Échec de la génération du PDF");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDelete = async () => {
    if (!quote) return;
    setDeleting(true);
    try {
      await deleteQuote(quote.id);
      toast.success("Devis supprimé");
      router.push("/quotes");
    } catch (e) {
      toast.error("Échec de la suppression du devis");
      setDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("fr-FR", {
      style: "currency",
      currency: quote?.currency || "EUR",
    });
  };

  const getStatusVariant = (status: QuoteStatus) => {
    switch (status) {
      case QuoteStatus.DRAFT:
        return "secondary";
      case QuoteStatus.SENT:
        return "default";
      case QuoteStatus.ACCEPTED:
        return "default";
      case QuoteStatus.REJECTED:
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container py-10 text-center">
        <p className="text-muted-foreground">Quote not found</p>
        <Link href="/quotes">
          <Button variant="link">Back to quotes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {quote.quote_number}
            </h1>
            <p className="text-muted-foreground">
              Created {new Date(quote.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/quotes/${quote.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={handleGeneratePdf}
            disabled={generatingPdf}
          >
            {generatingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            {generatingPdf ? "Generating..." : "Generate PDF"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleting}>
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this quote?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  quote {quote.quote_number}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-right p-3 font-medium">Qty</th>
                      <th className="text-right p-3 font-medium">Unit Price</th>
                      <th className="text-right p-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item, index) => (
                      <tr key={item.id || index} className="border-t">
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {formatCurrency(item.total || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {quote.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {quote.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={quote.status}
                onValueChange={(v) => handleStatusChange(v as QuoteStatus)}
                disabled={statusUpdating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuoteStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={QuoteStatus.SENT}>Sent</SelectItem>
                  <SelectItem value={QuoteStatus.ACCEPTED}>Accepted</SelectItem>
                  <SelectItem value={QuoteStatus.REJECTED}>Rejected</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client ? (
                <div className="space-y-1">
                  <p className="font-medium">{client.name}</p>
                  {client.company && (
                    <p className="text-sm text-muted-foreground">
                      {client.company}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {client.email}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Loading...</p>
              )}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Tax ({quote.tax_rate}%)
                </span>
                <span>{formatCurrency(quote.tax_amount)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(quote.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
