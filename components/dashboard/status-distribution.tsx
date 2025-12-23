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
  data: { status: string; count: number }[];
}

const chartConfig = {
  count: {
    label: "Quotes",
  },
  [QuoteStatus.ACCEPTED]: {
    label: "Accepted",
    color: "hsl(var(--chart-2))", // Greenish usually
  },
  [QuoteStatus.SENT]: {
    label: "Sent",
    color: "hsl(var(--chart-1))", // Blueish
  },
  [QuoteStatus.DRAFT]: {
    label: "Draft",
    color: "hsl(var(--muted-foreground))", // Gray
  },
  [QuoteStatus.REJECTED]: {
    label: "Rejected",
    color: "hsl(var(--destructive))", // Red
  },
} satisfies ChartConfig;

export function StatusDistribution({ data }: StatusDistributionProps) {
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      fill: `var(--color-${item.status})`,
    }));
  }, [data]);

  const totalQuotes = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, [data]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Quote Status</CardTitle>
        <CardDescription>Distribution of quotes by status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
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
                          Quotes
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
