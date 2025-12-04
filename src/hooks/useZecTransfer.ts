/**
 * useZecTransfer Hook
 *
 * React Hook for managing ZEC transfer operations
 *
 * Usage:
 * const { transfer, loading, error, result } = useZecTransfer();
 */

"use client";

import { useState } from "react";
import {
  transferZEC,
  type TransferParams,
  type TransferResult,
} from "@/scripts/zecTransfer";

export function useZecTransfer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransferResult | null>(null);

  const transfer = async (params: TransferParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await transferZEC(params);
      setResult(result);
      if (!result.success) {
        setError(result.error || "Transfer failed");
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { transfer, loading, error, result };
}
