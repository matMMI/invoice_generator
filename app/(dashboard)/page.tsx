"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import {
  FileText,
  Users,
  Plus,
  ArrowRight,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { DashboardMetrics, getDashboardMetrics } from "@/lib/api/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

import { Overview } from "@/components/dashboard/overview";
import { StatusDistribution } from "@/components/dashboard/status-distribution";
import { FiscalStatus } from "@/components/dashboard/fiscal-status";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardMetrics();
        setMetrics(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return amount.toLocaleString("fr-FR", {
      style: "currency",
      currency: currency,
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-8">
          <Skeleton className="col-span-4 h-[300px]" />
          <Skeleton className="col-span-3 h-[300px]" />
        </div>
        <Skeleton className="h-[200px]" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
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

      {/* Metrics Cards */}
      <div
        className="grid gap-4 mb-8"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        <Card className="overflow-hidden border-l-4 border-l-blue-500 dark:border-l-blue-400 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Devis
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {metrics?.total_quotes || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tous statuts confondus
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-purple-500 dark:border-l-purple-400 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clients
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {metrics?.total_clients || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dans votre base
            </p>
          </CardContent>
        </Card>

        {metrics?.totals_by_currency.map((ct) => (
          <Card
            key={ct.currency}
            className="overflow-hidden border-l-4 border-l-green-500 dark:border-l-green-400 hover:shadow-lg transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Accepté ({ct.currency})
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(ct.total, ct.currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Chiffre d'affaires
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Fiscal Status */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Overview data={metrics?.monthly_revenue || []} />
        <StatusDistribution data={metrics?.quotes_by_status || []} />
        {metrics?.fiscal_revenue && (
          <FiscalStatus data={metrics.fiscal_revenue} />
        )}
      </div>

      {/* Recent Quotes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Devis Récents</CardTitle>
          <Link href="/quotes">
            <Button variant="ghost" size="sm">
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
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
            <div className="space-y-4">
              {metrics?.recent_quotes.map((quote) => (
                <Link
                  key={quote.id}
                  href={`/quotes/${quote.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{quote.quote_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(quote.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(quote.total, quote.currency)}
                    </p>
                    <div className="mt-1 flex justify-end">
                      <StatusBadge status={quote.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
