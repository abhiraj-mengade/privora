/**
 * useWalletBalance Hook
 *
 * React Hook for managing wallet balance operations
 *
 * Usage:
 * const { balance, loading, error, fetchBalance } = useWalletBalance();
 */

"use client";

import { useState } from "react";
import { getWalletBalance, type BalanceResult } from "@/scripts/zecTransfer";

export function useWalletBalance() {
  const [balance, setBalance] = useState<BalanceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getWalletBalance();
      setBalance(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  };

  return { balance, loading, error, fetchBalance };
}
