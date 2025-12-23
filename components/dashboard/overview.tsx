"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface OverviewProps {
  data?: { name: string; total: number }[];
  loading?: boolean;
}

const chartConfig = {
  total: {
    label: "Chiffre d'affaires",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

import { Skeleton } from "@/components/ui/skeleton";

export function Overview({ data, loading }: OverviewProps) {
  if (loading || !data) {
    return (
      <Card className="w-full h-full overflow-hidden">
        <CardHeader>
          <CardTitle>Aperçu</CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-[250px] w-full gap-2 px-2">
            {[45, 75, 35, 60, 85, 50].map((height, i) => (
              <Skeleton
                key={i}
                className="w-full rounded-t-lg bg-muted/20"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Aperçu</CardTitle>
        <CardDescription>
          Chiffre d'affaires des 6 derniers mois
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="total"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
