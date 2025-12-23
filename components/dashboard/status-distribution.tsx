"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuoteStatus } from "@/lib/api/quotes";

interface StatusDistributionProps {
  data?: { status: string; count: number }[];
  loading?: boolean;
}

const chartConfig = {
  count: {
    label: "Devis",
  },
  [QuoteStatus.ACCEPTED]: {
    label: "Accepté",
    color: "hsl(142 76% 36%)",
  },
  [QuoteStatus.SENT]: {
    label: "Envoyé",
    color: "hsl(221 83% 53%)",
  },
  [QuoteStatus.DRAFT]: {
    label: "Brouillon",
    color: "hsl(38 92% 50%)",
  },
  [QuoteStatus.REJECTED]: {
    label: "Refusé",
    color: "hsl(0 84% 60%)",
  },
} satisfies ChartConfig;

import { Skeleton } from "@/components/ui/skeleton";

export function StatusDistribution({ data, loading }: StatusDistributionProps) {
  const safeData = data || [];

  const chartData = React.useMemo(() => {
    return safeData.map((item) => ({
      ...item,
      fill: `var(--color-${item.status})`,
    }));
  }, [safeData]);

  const totalQuotes = React.useMemo(() => {
    return safeData.reduce((acc, curr) => acc + curr.count, 0);
  }, [safeData]);

  if (loading || !data) {
    return (
      <Card className="flex flex-col w-full h-full overflow-hidden">
        <CardHeader className="items-center pb-0">
          <CardTitle>Statut des Devis</CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-32" />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 overflow-hidden flex items-center justify-center">
          <Skeleton className="h-[200px] w-[200px] rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col w-full h-full overflow-hidden">
      <CardHeader className="items-center pb-0">
        <CardTitle>Statut des Devis</CardTitle>
        <CardDescription>Répartition par statut</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 overflow-hidden">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto mx-auto h-[250px] w-full"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="count" hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalQuotes.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-xs"
                        >
                          Devis
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
