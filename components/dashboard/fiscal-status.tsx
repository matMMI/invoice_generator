"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiscalRevenue } from "@/lib/api/dashboard";
import { AlertCircle, TrendingUp } from "lucide-react";

interface FiscalStatusProps {
  data?: FiscalRevenue;
  loading?: boolean;
}

import { Skeleton } from "@/components/ui/skeleton";
import { MICRO_CEILING, URSSAF_RATE, VAT_THRESHOLD } from "@/lib/fiscal";
import { formatCurrency } from "@/lib/formatters";

export function FiscalStatus({ data, loading }: FiscalStatusProps) {
  if (loading || !data) {
    return (
      <Card className="h-full border-0 shadow-none bg-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <Skeleton className="h-4 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-2 w-full mt-2" />
              <Skeleton className="h-3 w-20 ml-auto mt-1" />
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-3 w-64 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = Math.min((data.year_to_date / MICRO_CEILING) * 100, 100);
  const vatMarkerPos = (VAT_THRESHOLD / MICRO_CEILING) * 100;
  const urssafEstimate = data.quarter_to_date * URSSAF_RATE;
  const pastVat = data.year_to_date > VAT_THRESHOLD;
  const pastMicro = data.year_to_date > MICRO_CEILING;

  return (
    <Card className="h-full border-0 shadow-none bg-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Suivi Micro-Entreprise ({data.current_year})</span>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                CA annuel (Services)
              </span>
              <span className="font-bold">
                {formatCurrency(data.year_to_date)}
              </span>
            </div>

            {/* Progress bar with TVA threshold marker */}
            <div className="relative">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    pastMicro
                      ? "bg-red-500"
                      : pastVat
                      ? "bg-yellow-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {/* TVA threshold marker */}
              <div
                className="absolute top-0 h-2 w-0.5 bg-yellow-600 dark:bg-yellow-400"
                style={{ left: `${vatMarkerPos}%` }}
                title={`Seuil TVA : ${formatCurrency(VAT_THRESHOLD)}`}
              />
            </div>

            {/* Legend */}
            <div className="flex justify-between items-center mt-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-600 dark:bg-yellow-400" />
                  TVA {formatCurrency(VAT_THRESHOLD)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                  Plafond {formatCurrency(MICRO_CEILING)}
                </span>
              </div>
              <span>{progress.toFixed(1)}%</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">
                Charges URSSAF (Trim {data.current_quarter})
              </span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency(urssafEstimate)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Estimation sur le CA encaissé du trimestre (~25,6% BNC 2026)
            </p>
          </div>

          {pastVat && !pastMicro && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Seuil de franchise TVA dépassé ({formatCurrency(VAT_THRESHOLD)})
                — tu dois facturer la TVA
              </span>
            </div>
          )}

          {pastMicro && (
            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Plafond micro-entreprise dépassé (
                {formatCurrency(MICRO_CEILING)}) — changement de régime
                obligatoire
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
