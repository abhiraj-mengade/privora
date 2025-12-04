/**
 * Local funding stats per recipient persona (keyed by IPFS hash).
 * This is a demo-only, client-side accumulator so donors can see how much
 * ZEC they have routed to each profile via this UI.
 */

export type FundingSource = 'ai' | 'direct';

export interface FundingTx {
  txId: string;
  amountZec: number;
  source: FundingSource;
  timestamp: number;
}

export interface FundingRecord {
  totalZec: number;
  txs: FundingTx[];
}

const STORAGE_KEY = 'privora_funding_stats';

export type FundingMap = Record<string, FundingRecord>;

export function loadFundingStats(): FundingMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as FundingMap;
  } catch {
    return {};
  }
}

export function saveFundingStats(map: FundingMap) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function recordFunding(
  ipfsHash: string,
  amountZec: number,
  txId: string,
  source: FundingSource
): FundingMap {
  const current = loadFundingStats();
  const existing = current[ipfsHash] || { totalZec: 0, txs: [] };
  const tx: FundingTx = {
    txId,
    amountZec,
    source,
    timestamp: Date.now(),
  };
  const updated: FundingRecord = {
    totalZec: existing.totalZec + amountZec,
    txs: [...existing.txs, tx],
  };
  const next: FundingMap = { ...current, [ipfsHash]: updated };
  saveFundingStats(next);
  return next;
}


