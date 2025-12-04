import { ethers, providers, Contract, Signer } from "ethers";

export interface IndexedPersona {
  owner: string;
  ipfsHash: string;
  createdAt: bigint;
}

const registryAbi = [
  "function registerMyPersona(string ipfsHash) external returns (uint256)",
  "function getAllPersonas() external view returns (tuple(address owner, string ipfsHash, uint256 createdAt)[])",
];

function getRegistryEnv() {
  const addr = process.env.NEXT_PUBLIC_INDEX_CONTRACT;
  if (!addr) {
    throw new Error("Persona index contract address not configured");
  }
  return addr;
}

export async function registerPersonaOnChain(
  ipfsHash: string,
  signer: Signer
): Promise<void> {
  if (!signer) {
    console.warn("No EVM signer available; skipping on‑chain persona registration");
    return;
  }

  const contractAddress = getRegistryEnv();
  const contract = new Contract(contractAddress, registryAbi, signer);
  const tx = await contract.registerMyPersona(ipfsHash);
  await tx.wait();
}

export async function fetchAllIndexedPersonas(): Promise<IndexedPersona[]> {
  const contractAddress = getRegistryEnv();

  // Always use a read‑only RPC provider for indexing so we never
  // depend on a browser wallet just to read data.
  const rpcUrl =
    process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ??
    "https://eth-sepolia.g.alchemy.com/v2/demo";

  const provider = new providers.JsonRpcProvider(rpcUrl);

  const contract = new Contract(contractAddress, registryAbi, provider);
  const personas = (await contract.getAllPersonas()) as Array<{
    owner: string;
    ipfsHash: string;
    createdAt: bigint;
  }>;

  return personas.map((p) => ({
    owner: p.owner,
    ipfsHash: p.ipfsHash,
    createdAt: p.createdAt,
  }));
}


