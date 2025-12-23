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
      <div className="container py-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
    <div className="container py-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your quotes and clients.
          </p>
        </div>
        <Link href="/quotes/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.total_quotes || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.total_clients || 0}
            </div>
          </CardContent>
        </Card>

        {metrics?.totals_by_currency.map((ct) => (
          <Card key={ct.currency}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Accepted ({ct.currency})
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(ct.total, ct.currency)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-8">
        <div className="col-span-4">
          <Overview data={metrics?.monthly_revenue || []} />
        </div>
        <div className="col-span-3">
          <StatusDistribution data={metrics?.quotes_by_status || []} />
        </div>
      </div>

      {/* Recent Quotes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Quotes</CardTitle>
          <Link href="/quotes">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {metrics?.recent_quotes.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm mb-4">
                No quotes yet
              </p>
              <Link href="/quotes/create">
                <Button variant="outline" size="sm">
                  Create your first quote
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
