"use client";

import * as React from "react";
import { Check, ChevronsUpDown, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDriftSubaccounts } from "@/hooks/useDriftSubaccounts";
import { useDriftSwitchSubaccount } from "@/hooks/useDriftSwitchSubaccount";
import { useConnection } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useDriftSubaccountStore } from "@/stores/useDriftSubaccountStore";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface SubaccountSwitcherProps extends PopoverTriggerProps {}

export default function SubaccountSwitcher({
  className,
}: SubaccountSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { connection } = useConnection();

  // Get the active subaccount index from Zustand store
  const { activeSubaccountIndex } = useDriftSubaccountStore();

  const { subaccounts, isLoading, error, driftClient, refreshSubaccounts } =
    useDriftSubaccounts(connection);

  // Use the switch subaccount hook
  const { switchSubaccount, isSwitching } = useDriftSwitchSubaccount({
    driftClient,
  });

  // Handle switching subaccounts
  const handleSwitchSubaccount = async (index: number) => {
    const success = await switchSubaccount(index);
    if (success) {
      setOpen(false);
    }
  };

  // Get the currently active subaccount
  const activeSubaccount = React.useMemo(() => {
    return (
      subaccounts.find(
        (subaccount) => subaccount.index === activeSubaccountIndex
      ) || null
    );
  }, [subaccounts, activeSubaccountIndex]);

  // Format account balance if available
  const formatBalance = (user: any) => {
    if (!user || !user.getQuoteBalance) return "N/A";
    try {
      const balance = user.getQuoteBalance();
      return `$${balance.toFixed(2)}`;
    } catch (error) {
      return "N/A";
    }
  };

  // Handle refreshing subaccounts with loading state
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSubaccounts();
      toast.success("Subaccounts refreshed");
    } catch (error) {
      toast.error("Failed to refresh subaccounts");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a subaccount"
          className={cn("w-[200px] justify-between", className)}
          onClick={() => setOpen(!open)}
          disabled={isLoading || isSwitching}
        >
          {isLoading ? (
            <Skeleton className="h-5 w-5 rounded-full mr-2" />
          ) : (
            <Avatar className="mr-2 h-5 w-5">
              <AvatarFallback>
                {activeSubaccount ? activeSubaccount.index : 0}
              </AvatarFallback>
            </Avatar>
          )}
          {isLoading || isSwitching ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : activeSubaccount ? (
            `Subaccount ${activeSubaccount.index}`
          ) : (
            "No Subaccount"
          )}
          <ChevronsUpDown className="ml-auto opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search subaccounts..." />
          <CommandList>
            <CommandEmpty>No subaccounts found.</CommandEmpty>
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <CommandItem key={i} disabled>
                    <Skeleton className="h-5 w-5 rounded-full mr-2" />
                    <div className="flex flex-col flex-1">
                      <Skeleton className="h-4 w-[120px] mb-1" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                  </CommandItem>
                ))
            ) : error ? (
              <CommandItem className="text-red-500">
                Error: {error.message}
              </CommandItem>
            ) : subaccounts.length === 0 ? (
              <CommandItem>No subaccounts available</CommandItem>
            ) : (
              <CommandGroup heading="Your Subaccounts">
                {subaccounts.map((subaccount) => (
                  <CommandItem
                    key={subaccount.index}
                    onSelect={() => handleSwitchSubaccount(subaccount.index)}
                    className="text-sm cursor-pointer"
                    disabled={isSwitching}
                  >
                    <Avatar className="mr-2 h-5 w-5">
                      <AvatarFallback>{subaccount.index}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span>Subaccount {subaccount.index}</span>
                      <span className="text-xs text-muted-foreground">
                        Balance: {formatBalance(subaccount.user)}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto",
                        activeSubaccountIndex === subaccount.index
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={handleRefresh}
                className="cursor-pointer"
                disabled={isRefreshing || isLoading || isSwitching}
              >
                <RefreshCw
                  className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
                />
                {isRefreshing ? "Refreshing..." : "Refresh Subaccounts"}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
