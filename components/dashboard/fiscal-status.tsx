"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiscalRevenue } from "@/lib/api/dashboard";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingUp } from "lucide-react";

interface FiscalStatusProps {
  data: FiscalRevenue;
}

export function FiscalStatus({ data }: FiscalStatusProps) {
  const MICRO_CEILING = 77700;
  const VAT_THRESHOLD = 36800; // Base threshold, simplify for now
  const URSSAF_RATE = 0.211; // ~21.1% for services

  const progress = (data.year_to_date / MICRO_CEILING) * 100;
  const urssafEstimate = data.quarter_to_date * URSSAF_RATE;

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    });

  return (
    <Card className="h-full">
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
                Plafond CA (Services)
              </span>
              <span className="font-bold">
                {formatCurrency(data.year_to_date)} /{" "}
                {formatCurrency(MICRO_CEILING)}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {progress.toFixed(1)}% du plafond
            </p>
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
              Estimation sur le CA encaissé du trimestre (~21.2%)
            </p>
          </div>

          {data.year_to_date > VAT_THRESHOLD && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md text-xs">
              <AlertCircle className="h-4 w-4" />
              <span>Attention : Seuil de franchise TVA dépassé (36 800€)</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
