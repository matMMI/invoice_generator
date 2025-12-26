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
import useSWR from "swr";
import { onSyncMessage } from "@/lib/sync";
import { RecentQuotes } from "@/components/dashboard/recent-quotes";
export default function DashboardPage() {
  const {
    data: metrics,
    isLoading: loading,
    mutate,
  } = useSWR(["dashboard-metrics"], () => getDashboardMetrics(), {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  useEffect(() => {
    const unsubscribe = onSyncMessage((msg) => {
      if (msg.type.startsWith("quote_") || msg.type.startsWith("client_")) {
        mutate();
      }
    });
    return unsubscribe;
  }, [mutate]);
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
        <div className="stats-cell border-r border-border">
          <div className="stats-header">
            <span className="stats-label">Chiffre d&apos;affaires</span>
            <div className="stats-icon bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
              <Euro className="stats-icon-inner" />
            </div>
          </div>
          {loading ? (
            <div className="mt-2">
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          ) : (
            <>
              <div className="stats-value">
                {formatCurrency(
                  metrics?.fiscal_revenue.year_to_date || 0,
                  "EUR"
                )}
              </div>
              <p className="stats-subtitle">
                {metrics?.fiscal_revenue.current_year} (Encaissé)
              </p>
            </>
          )}
        </div>
        <div className="stats-cell border-r-0 md:border-r border-border">
          <div className="stats-header">
            <span className="stats-label">Devis émis</span>
            <div className="stats-icon bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <FileText className="stats-icon-inner" />
            </div>
          </div>
          {loading ? (
            <div className="mt-2">
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          ) : (
            <>
              <div className="stats-value">{metrics?.total_quotes || 0}</div>
              <p className="stats-subtitle">Total devis créés</p>
            </>
          )}
        </div>
        <div className="stats-cell border-r border-t md:border-t-0 border-border">
          <div className="stats-header">
            <span className="stats-label">Clients</span>
            <div className="stats-icon bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
              <Users className="stats-icon-inner" />
            </div>
          </div>
          {loading ? (
            <div className="mt-2">
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          ) : (
            <>
              <div className="stats-value">{metrics?.total_clients || 0}</div>
              <p className="stats-subtitle">Clients actifs</p>
            </>
          )}
        </div>
        <div className="stats-cell border-t md:border-t-0 border-border">
          <div className="stats-header">
            <span className="stats-label">Net estimé</span>
            <div className="stats-icon bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
              <Wallet className="stats-icon-inner" />
            </div>
          </div>
          {loading ? (
            <div className="mt-2">
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          ) : (
            <>
              <div className="stats-value">
                {formatCurrency(netEstimate, "EUR")}
              </div>
              <p className="stats-subtitle">Après cotisations (~21.2%)</p>
            </>
          )}
        </div>
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
        <RecentQuotes />
      </div>
    </div>
  );
}
