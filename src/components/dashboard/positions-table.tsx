"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Position {
  totalDeposit: number;
  costBasis: number;
  positionSizeSol: number;
  positionSizeUsd: number;
  entryPrice: number;
  pnl: number;
  currentPrice: number;
}

interface PositionsTableProps {
  position: Position | null;
}

export default function PositionsTable({ position }: PositionsTableProps) {
  if (!position || position.positionSizeSol === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perp Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-zinc-500">No active positions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLong = position.positionSizeSol > 0;
  const pnlPercentage = position.costBasis !== 0 
    ? (position.pnl / Math.abs(position.costBasis)) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perp Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Market</th>
                <th className="text-left py-3 px-4">Side</th>
                <th className="text-right py-3 px-4">Size</th>
                <th className="text-right py-3 px-4">Notional</th>
                <th className="text-right py-3 px-4">Entry Price</th>
                <th className="text-right py-3 px-4">Mark Price</th>
                <th className="text-right py-3 px-4">PnL</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-4 px-4">SOL-PERP</td>
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    {isLong ? (
                      <>
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500">Long</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-red-500">Short</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="text-right py-4 px-4">
                  {Math.abs(position.positionSizeSol)} SOL
                </td>
                <td className="text-right py-4 px-4">
                  ${Math.abs(position.positionSizeUsd).toFixed(2)}
                </td>
                <td className="text-right py-4 px-4">
                  ${position.entryPrice.toFixed(2)}
                </td>
                <td className="text-right py-4 px-4">
                  ${position.currentPrice.toFixed(2)}
                </td>
                <td className={`text-right py-4 px-4 ${position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)} 
                  <span className="text-xs ml-1">
                    ({position.pnl >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
