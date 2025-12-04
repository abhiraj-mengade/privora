import { ethers } from "ethers";

export interface NetworkSchoolProof {
  contractAddress: string;
  memberAddress: string;
  claimant: string;
  nonce: string;
  signature: string;
  txHash: string;
}

const networkSchoolAbi = [
  "function verifyMembership(address member, bytes32 nonce, bytes signature) external",
];

const getEnv = () => {
  const contract = process.env.NEXT_PUBLIC_NETWORK_SCHOOL_CONTRACT;
  const chainId = process.env.NEXT_PUBLIC_NETWORK_SCHOOL_CHAIN_ID;
  if (!contract || !chainId) {
    throw new Error("Network School contract env vars not configured");
  }
  return { contract, chainId: BigInt(chainId) };
};

export async function verifyNetworkSchoolProof(): Promise<NetworkSchoolProof> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error(
      "Ethereum wallet not found. Please install an EVM wallet like MetaMask, Rabby, or Talisman."
    );
  }

  const { contract, chainId } = getEnv();
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();

  let network = await provider.getNetwork();
  if (network.chainId !== chainId) {
    const targetChainHex = ethers.toBeHex(chainId);
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainHex }],
      });
    } catch (err) {
      throw new Error(
        `Please switch your wallet to chain ${chainId.toString()} and try again`
      );
    }
    network = await provider.getNetwork();
    if (network.chainId !== chainId) {
      throw new Error(
        `Wallet not connected to required chain ${chainId.toString()}`
      );
    }
  }

  const memberAddress = await signer.getAddress();
  const claimant = memberAddress; // For now claimant == member
  const nonceBytes = ethers.randomBytes(32);
  const nonce = ethers.hexlify(nonceBytes);

  const messageHash = ethers.solidityPackedKeccak256(
    ["address", "uint256", "address", "address", "bytes32"],
    [contract, chainId, claimant, memberAddress, nonce]
  );

  const signature = await signer.signMessage(ethers.getBytes(messageHash));
  const contractInstance = new ethers.Contract(contract, networkSchoolAbi, signer);
  const tx = await contractInstance.verifyMembership(memberAddress, nonce, signature);
  const receipt = await tx.wait();

  return {
    contractAddress: contract,
    memberAddress,
    claimant,
    nonce,
    signature,
    txHash: receipt.hash,
  };
}


