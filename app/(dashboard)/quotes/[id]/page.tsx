"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileDown,
  Loader2,
  Calendar,
  User,
  Hash,
  Share2,
  Copy,
  Check,
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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const quoteData = await getQuote(quoteId);
        setQuote(quoteData);
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

  // Polling: Automatically check status every 5s if quote is SENT
  useEffect(() => {
    if (!quote || quote.status !== QuoteStatus.SENT) return;

    const interval = setInterval(async () => {
      try {
        // Manually fetch to force cache busting since getQuote helper was reverted
        const session = await authClient.getSession();
        const token = session.data?.session.token;
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/api/quotes/${quoteId}?_t=${Date.now()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );
        if (!res.ok) return;
        const updatedQuote: Quote = await res.json();

        // If status changed to SIGNED or ACCEPTED, update UI
        if (
          updatedQuote.status === QuoteStatus.SIGNED ||
          updatedQuote.status === QuoteStatus.ACCEPTED
        ) {
          setQuote(updatedQuote);
          toast.success("Le devis a été signé par le client !", {
            duration: 5000,
            icon: <Check className="h-5 w-5 text-green-500" />,
          });
        }
      } catch (error) {
        // Silent error
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [quote, quoteId]);

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

  const handleShare = async () => {
    if (!quote) return;
    setSharing(true);
    setSharing(true);
    try {
      const session = await authClient.getSession();
      const token = session.data?.session.token;
      const res = await fetch(`${API_BASE_URL}/api/quotes/${quote.id}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Échec de la génération du lien");
      }
      const data = await res.json();
      const fullUrl = `${window.location.origin}${data.share_url}`;
      setShareUrl(fullUrl);
      setShareDialogOpen(true);
    } catch (e: any) {
      toast.error(e.message || "Échec du partage");
    } finally {
      setSharing(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien");
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
        return "warning";
      case QuoteStatus.SIGNED:
        return "info";
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
        <p className="text-muted-foreground">Devis introuvable</p>
        <Link href="/quotes">
          <Button variant="link">Retour aux devis</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
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
              Créé le {new Date(quote.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/quotes/${quote.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
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
            {generatingPdf ? "Génération..." : "Télécharger PDF"}
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
                <AlertDialogTitle>Supprimer ce devis ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Cela supprimera définitivement
                  le devis {quote.quote_number}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-right p-3 font-medium">Qté</th>
                      <th className="text-right p-3 font-medium">Prix Unit.</th>
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
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statut</CardTitle>
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
                  <SelectItem value={QuoteStatus.DRAFT}>Brouillon</SelectItem>
                  <SelectItem value={QuoteStatus.SENT}>Envoyé</SelectItem>
                  <SelectItem value={QuoteStatus.SIGNED}>Signé</SelectItem>
                  <SelectItem value={QuoteStatus.ACCEPTED}>Accepté</SelectItem>
                  <SelectItem value={QuoteStatus.REJECTED}>Refusé</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={handleShare}
                  disabled={sharing || quote.status === QuoteStatus.SIGNED}
                  className="w-full"
                >
                  {sharing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Share2 className="mr-2 h-4 w-4" />
                  )}
                  {sharing ? "Génération..." : "Faire signer le devis"}
                </Button>
              </div>
            </CardContent>
          </Card>
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
                  <p className="font-bold text-lg text-primary">
                    {client.name}
                  </p>
                  {client.company && (
                    <p className="text-sm font-medium text-foreground">
                      {client.company}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {client.email}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Chargement...</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatCurrency(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  TVA ({quote.tax_rate}%)
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
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager ce devis pour signature</DialogTitle>
            <DialogDescription>
              Envoyez ce lien à votre client pour qu&apos;il puisse consulter et
              signer électroniquement ce devis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input value={shareUrl || ""} readOnly className="flex-1" />
              <Button onClick={handleCopyUrl} variant="outline" size="icon">
                {copied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Ce lien expire dans 30 jours. Le statut du devis passera à
              &quot;Envoyé&quot;.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
