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
  data: { name: string; total: number }[];
}

const chartConfig = {
  total: {
    label: "Chiffre d'affaires",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function Overview({ data }: OverviewProps) {
  return (
    <Card className="w-full overflow-hidden">
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
              fill="var(--color-total)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
