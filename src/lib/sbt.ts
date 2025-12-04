/**
 * Client-side helpers for minting FHE-enabled Impact SBTs on Sepolia.
 * Uses ethers.js to interact with the ImpactSBT contract deployed via CoFHE.
 */

import { ethers, providers, Contract, Signer } from "ethers";

export interface ImpactSBTPayload {
  donorAddress: string; // EVM address (from Thirdweb wallet)
  recipientPseudonym: string; // Builder's pseudonym from IPFS persona
  causeTag: string; // High-level cause (e.g., "anti-censorship tools")
  amountZec: number; // Amount in ZEC (will be converted to zatoshis)
  memo?: string; // Optional high-level memo (no payment details)
  ipfsHash: string; // IPFS hash of the builder's profile (for tracking funded status)
}

export interface ImpactSBT {
  tokenId: string;
  metadata: {
    donorAddress: string;
    recipientPseudonym: string;
    causeTag: string;
    amountZec: number;
    memo?: string;
    chain: string;
    issuedAt: number;
  };
}

const impactSbtAbi = [
  "function mintImpact(address donor, string calldata builderPseudonym, string calldata causeTag, string calldata memo, uint128 amountZats, string calldata ipfsHash) external returns (uint256)",
  "function getImpact(uint256 tokenId) external view returns (address donor, string memory builderPseudonym, string memory causeTag, string memory memo, uint256 issuedAt)",
  "function balanceOf(address ownerAddr) external view returns (uint256)",
  "function isBuilderFunded(string calldata ipfsHash) external view returns (bool)",
  "function getFundingCount(string calldata ipfsHash) external view returns (uint256)",
  "function getTotalFundingAmount(string calldata ipfsHash) external view returns (uint256)",
];

function getImpactSbtEnv() {
  const contract = process.env.NEXT_PUBLIC_IMPACT_SBT_CONTRACT;
  if (!contract) {
    throw new Error("ImpactSBT contract address not configured. Set NEXT_PUBLIC_IMPACT_SBT_CONTRACT");
  }
  return contract;
}

/**
 * Mint an Impact SBT on Sepolia using the FHE-enabled contract.
 * Privacy-preserving: no zcashTxId stored on-chain.
 */
export async function issueImpactSBT(
  payload: ImpactSBTPayload,
  signer: Signer
): Promise<ImpactSBT> {
  if (!signer) {
    throw new Error("EVM signer not available. Please connect your wallet.");
  }

  const contractAddress = getImpactSbtEnv();
  const contract = new Contract(contractAddress, impactSbtAbi, signer);

  // Convert ZEC to zatoshis (1 ZEC = 1e8 zatoshis)
  const amountZats = ethers.BigNumber.from(Math.floor(payload.amountZec * 1e8));
  if (amountZats.gt(ethers.BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"))) {
    throw new Error("Amount too large for uint128");
  }
  const amountZatsUint128 = amountZats.toBigInt();

  // Call mintImpact
  const tx = await contract.mintImpact(
    payload.donorAddress,
    payload.recipientPseudonym,
    payload.causeTag,
    payload.memo || "",
    amountZatsUint128,
    payload.ipfsHash
  );
  const receipt = await tx.wait();

  // Extract tokenId from event logs
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed && parsed.name === "ImpactMinted";
    } catch {
      return false;
    }
  });

  let tokenId: string;
  if (event) {
    const parsed = contract.interface.parseLog(event);
    tokenId = parsed.args.tokenId.toString();
  } else {
    // Fallback: use transaction hash as tokenId reference
    tokenId = receipt.transactionHash;
  }

  return {
    tokenId,
    metadata: {
      donorAddress: payload.donorAddress,
      recipientPseudonym: payload.recipientPseudonym,
      causeTag: payload.causeTag,
      amountZec: payload.amountZec,
      memo: payload.memo,
      chain: "sepolia",
      issuedAt: Date.now(),
    },
  };
}

/**
 * Check if a builder (by IPFS hash) has been funded on-chain.
 */
export async function checkBuilderFundedStatus(
  ipfsHash: string,
  provider?: providers.Provider
): Promise<{ funded: boolean; count: number; totalAmountZats: number }> {
  const contractAddress = getImpactSbtEnv();
  
  // Use provided provider or create a read-only provider
  const rpcProvider = provider || new providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo"
  );
  
  const contract = new Contract(contractAddress, impactSbtAbi, rpcProvider);
  
  try {
    const [funded, count, totalAmount] = await Promise.all([
      contract.isBuilderFunded(ipfsHash),
      contract.getFundingCount(ipfsHash),
      contract.getTotalFundingAmount(ipfsHash),
    ]);
    
    return {
      funded: funded as boolean,
      count: count.toNumber(),
      totalAmountZats: totalAmount.toNumber(),
    };
  } catch (error) {
    console.error("Error checking builder funded status:", error);
    // Return false on error (assume not funded if we can't check)
    return { funded: false, count: 0, totalAmountZats: 0 };
  }
}


