"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet, TrendingUp, BarChart2 } from "lucide-react";

interface BalanceCardProps {
  title: string;
  value: number;
  icon: "dollar" | "wallet" | "trending" | "chart";
  showPlusMinus?: boolean;
  valueType?: "usdc" | "perp";
}

export default function BalanceCard({
  title,
  value,
  icon,
  showPlusMinus = false,
  valueType = "usdc",
}: BalanceCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "dollar":
        return <DollarSign className="h-4 w-4 text-zinc-500" />;
      case "wallet":
        return <Wallet className="h-4 w-4 text-zinc-500" />;
      case "trending":
        return <TrendingUp className="h-4 w-4 text-zinc-500" />;
      case "chart":
        return <BarChart2 className="h-4 w-4 text-zinc-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-zinc-500" />;
    }
  };

  const formatValue = () => {
    const prefix = showPlusMinus && value > 0 ? "+" : "";

    if (valueType === "usdc") {
      return `${prefix}$${(Math.abs(value) / 1000000).toFixed(4)}`;
    } else if (valueType === "perp") {
      return `${prefix}$${Math.abs(value).toFixed(2)}`;
    }

    return `${prefix}$${Math.abs(value).toFixed(2)}`;
  };

  const getValueColor = () => {
    if (!showPlusMinus) return "text-zinc-900";
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {getIcon()}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getValueColor()}`}>
          {formatValue()}
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Updated {new Date().toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}
