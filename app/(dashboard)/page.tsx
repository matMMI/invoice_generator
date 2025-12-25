"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Euro, Wallet } from "lucide-react";
import { FileText, Users, Plus, ArrowRight } from "lucide-react";
import { getDashboardMetrics } from "@/lib/api/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Overview } from "@/components/dashboard/overview";
import { StatusDistribution } from "@/components/dashboard/status-distribution";
import { FiscalStatus } from "@/components/dashboard/fiscal-status";
import { useGlobalActivity } from "@/components/providers/global-activity-provider";
import useSWR from "swr";
import { onSyncMessage } from "@/lib/sync";
import { PaginationControls } from "@/components/ui/pagination-controls";
export default function DashboardPage() {
  const [quotesPage, setQuotesPage] = useState(1);
  const quotesPerPage = 5;

  const {
    data: metrics,
    isLoading: loading,
    mutate,
  } = useSWR(
    ["dashboard-metrics", quotesPage],
    () => getDashboardMetrics(quotesPage, quotesPerPage),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const totalPages = Math.ceil(
    (metrics?.recent_quotes_total || 0) / quotesPerPage
  );

  useEffect(() => {
    const unsubscribe = onSyncMessage((msg) => {
      if (msg.type.startsWith("quote_") || msg.type.startsWith("client_")) {
        mutate();
      }
    });
    return unsubscribe;
  }, [mutate]);

  /*
   * Calculate estimated net (Micro-entrepreneur ~21.2% charges)
   * Using the confirmed 21.2% rate for Service Provisions (BIC)
   */
  const netEstimate = (metrics?.fiscal_revenue.year_to_date || 0) * (1 - 0.212);

  const formatCurrency = (amount: number, currency: string) => {
    return amount.toLocaleString("fr-FR", {
      style: "currency",
      currency: currency,
    });
  };

  return (
    <div className="w-full">
      <div className="border-b border-border">
        <div className="flex items-center justify-between px-6 py-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-muted-foreground">
              Aperçu de vos devis et clients.
            </p>
          </div>
          <Link href="/quotes/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Devis
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-border">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`p-6 border-r border-border ${
                  i === 4 ? "border-r-0" : ""
                } ${i === 2 ? "border-r-0 md:border-r" : ""}`}
              >
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="stats-cell border-r border-border">
              <div className="stats-header">
                <span className="stats-label">Chiffre d&apos;affaires</span>
                <div className="stats-icon bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                  <Euro className="stats-icon-inner" />
                </div>
              </div>
              <div className="stats-value">
                {formatCurrency(
                  metrics?.fiscal_revenue.year_to_date || 0,
                  "EUR"
                )}
              </div>
              <p className="stats-subtitle">
                {metrics?.fiscal_revenue.current_year} (Encaissé)
              </p>
            </div>

            <div className="stats-cell border-r-0 md:border-r border-border">
              <div className="stats-header">
                <span className="stats-label">Devis émis</span>
                <div className="stats-icon bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <FileText className="stats-icon-inner" />
                </div>
              </div>
              <div className="stats-value">{metrics?.total_quotes || 0}</div>
              <p className="stats-subtitle">Total devis créés</p>
            </div>

            <div className="stats-cell border-r border-t md:border-t-0 border-border">
              <div className="stats-header">
                <span className="stats-label">Clients</span>
                <div className="stats-icon bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                  <Users className="stats-icon-inner" />
                </div>
              </div>
              <div className="stats-value">{metrics?.total_clients || 0}</div>
              <p className="stats-subtitle">Clients actifs</p>
            </div>

            <div className="stats-cell border-t md:border-t-0 border-border">
              <div className="stats-header">
                <span className="stats-label">Net estimé</span>
                <div className="stats-icon bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                  <Wallet className="stats-icon-inner" />
                </div>
              </div>
              <div className="stats-value">
                {formatCurrency(netEstimate, "EUR")}
              </div>
              <p className="stats-subtitle">Après cotisations (~21.2%)</p>
            </div>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-b border-border">
        <div className="border-b md:border-b lg:border-b-0 md:border-r border-border">
          <Overview data={metrics?.monthly_revenue} loading={loading} />
        </div>

        <div className="border-b md:border-b lg:border-b-0 lg:border-r border-border">
          <StatusDistribution
            data={metrics?.quotes_by_status}
            loading={loading}
          />
        </div>

        <div className="md:border-r lg:border-r-0 border-border">
          <FiscalStatus data={metrics?.fiscal_revenue} loading={loading} />
        </div>
      </div>
      <div className="border-b border-border">
        {loading ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Devis Récents</h2>
              <Skeleton className="h-9 w-24" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4 px-3 py-2 border-b border-border">
                <Skeleton className="h-4 w-20 col-span-1" />
                <Skeleton className="h-4 w-24 col-span-1" />
                <Skeleton className="h-4 w-20 col-span-1" />
                <Skeleton className="h-4 w-20 col-span-1 justify-self-end text-right" />
                <Skeleton className="h-4 w-16 col-span-1 justify-self-end text-right" />
              </div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="grid grid-cols-5 gap-4 px-3 py-2 items-center"
                >
                  <Skeleton className="h-5 w-24 col-span-1" />
                  <Skeleton className="h-4 w-32 col-span-1" />
                  <Skeleton className="h-4 w-24 col-span-1" />
                  <Skeleton className="h-5 w-20 col-span-1 justify-self-end" />
                  <Skeleton className="h-6 w-20 col-span-1 justify-self-end rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Devis Récents</h2>
              <Link href="/quotes">
                <Button variant="ghost" size="sm">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            {metrics?.recent_quotes.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm mb-4">
                  Aucun devis pour le moment
                </p>
                <Link href="/quotes/create">
                  <Button variant="outline" size="sm">
                    Créer votre premier devis
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-0">
                  <div className="grid grid-cols-5 gap-4 px-3 py-3 text-sm font-medium text-muted-foreground border-b border-border">
                    <div className="col-span-1">N° Devis</div>
                    <div className="col-span-1">Client</div>
                    <div className="col-span-1">Date</div>
                    <div className="col-span-1 text-right">Montant</div>
                    <div className="col-span-1 text-right">Statut</div>
                  </div>
                  {metrics?.recent_quotes.map((quote) => (
                    <Link
                      key={quote.id}
                      href={`/quotes/${quote.id}`}
                      className="grid grid-cols-5 gap-4 items-center px-3 py-3 hover:bg-muted/50 transition-colors text-sm border-b border-border last:border-b-0"
                    >
                      <div className="font-medium truncate col-span-1">
                        {quote.quote_number}
                      </div>
                      <div className="font-medium text-foreground/80 truncate col-span-1">
                        {quote.client_name || "Client Inconnu"}
                      </div>
                      <div className="text-muted-foreground truncate col-span-1">
                        {new Date(quote.created_at).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="font-bold text-right truncate col-span-1">
                        {formatCurrency(quote.total, quote.currency)}
                      </div>
                      <div className="flex justify-end col-span-1">
                        <StatusBadge status={quote.status} />
                      </div>
                    </Link>
                  ))}
                </div>
                <PaginationControls
                  currentPage={quotesPage}
                  totalPages={totalPages}
                  onPageChange={setQuotesPage}
                  className="mt-4"
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
