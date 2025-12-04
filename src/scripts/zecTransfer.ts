/**
 * ZEC Transfer TypeScript Wrapper
 *
 * This module provides a TypeScript wrapper around the Python zec_transfer script
 * allowing direct function calls from React components and event handlers.
 */

import { spawn } from "child_process";
import path from "path";

export interface TransferParams {
  recipientAddress: string;
  amount: number;
  memo?: string;
  useShielded?: boolean;
}

export interface TransferResult {
  success: boolean;
  txid?: string;
  amount?: number;
  recipient?: string;
  status?: string;
  error?: string;
}

export interface BalanceResult {
  transparent: number;
  shielded: number;
  total: number;
}

export interface AddressResult {
  address: string;
  type: "shielded" | "transparent";
}

export interface Transaction {
  txid: string;
  amount: number;
  timestamp: number;
  status: string;
}

/**
 * Execute a Python script and return the result
 */
function executePythonScript(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "zec_transfer.py");
    const pythonProcess = spawn("python3", [scriptPath, ...args]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `Process exited with code ${code}`));
      }
    });

    pythonProcess.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Parse JSON output from Python script
 */
function parseJsonOutput(output: string): any {
  const lines = output.split("\n");
  let jsonStart = -1;

  // Find the start of JSON output
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("{") || lines[i].startsWith("[")) {
      jsonStart = i;
      break;
    }
  }

  if (jsonStart === -1) {
    throw new Error("No JSON output found from Python script");
  }

  const jsonString = lines.slice(jsonStart).join("\n");
  return JSON.parse(jsonString);
}

/**
 * Transfer ZEC to a recipient address
 */
export async function transferZEC(
  params: TransferParams
): Promise<TransferResult> {
  try {
    const args = [
      "transfer",
      "--recipient",
      params.recipientAddress,
      "--amount",
      params.amount.toString(),
    ];

    if (params.memo) {
      args.push("--memo", params.memo);
    }

    if (params.useShielded === false) {
      args.push("--transparent");
    }

    const output = await executePythonScript(args);
    const result = parseJsonOutput(output);

    return result as TransferResult;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(): Promise<BalanceResult | null> {
  try {
    const output = await executePythonScript(["balance"]);
    const result = parseJsonOutput(output);
    return result as BalanceResult;
  } catch (error) {
    console.error("Failed to get wallet balance:", error);
    return null;
  }
}

/**
 * Get wallet address
 */
export async function getWalletAddress(
  type: "shielded" | "transparent" = "shielded"
): Promise<AddressResult | null> {
  try {
    const output = await executePythonScript([
      "address",
      "--address-type",
      type,
    ]);

    // Extract address from output (it's printed on a line by itself)
    const lines = output.split("\n");
    const addressLine = lines.find(
      (line) => line.startsWith("z") || line.startsWith("t")
    );

    if (!addressLine) {
      throw new Error("No address found in output");
    }

    return {
      address: addressLine.trim(),
      type,
    } as AddressResult;
  } catch (error) {
    console.error("Failed to get wallet address:", error);
    return null;
  }
}

/**
 * Get recent transactions
 */
export async function getRecentTransactions(
  limit: number = 10
): Promise<Transaction[] | null> {
  try {
    const output = await executePythonScript(["transactions"]);
    const result = parseJsonOutput(output);
    return Array.isArray(result) ? (result as Transaction[]) : null;
  } catch (error) {
    console.error("Failed to get transactions:", error);
    return null;
  }
}

/**
 * Direct handler for button click
 *
 * Usage in JSX:
 * <button onClick={() => handleTransferClick({ recipientAddress: "...", amount: 1.5 })}>
 *   Send ZEC
 * </button>
 */
export async function handleTransferClick(
  params: TransferParams
): Promise<TransferResult> {
  try {
    const result = await transferZEC(params);
    if (result.success) {
      console.log(`✓ Transaction sent! TXID: ${result.txid}`);
    } else {
      console.error(`✗ Transfer failed: ${result.error}`);
    }
    return result;
  } catch (error) {
    console.error("Transfer error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

const zecTransferModule = {
  transferZEC,
  getWalletBalance,
  getWalletAddress,
  getRecentTransactions,
  handleTransferClick,
};

export default zecTransferModule;
