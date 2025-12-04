"use client";
import { WalletSelectorProvider } from "@near-wallet-selector/react-hook";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import "@near-wallet-selector/modal-ui/styles.css";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create a single React Query client instance for the whole app
  const [queryClient] = useState(() => new QueryClient());

  const clientId =
    process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ||
    "910b8eeb02974e796e21bfff7c2d8461";

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider clientId={clientId} activeChain="sepolia">
    <WalletSelectorProvider
      config={{
        network: "testnet",
        createAccessKeyFor: "privora.testnet",
        modules: [setupMeteorWallet()],
      }}
    >
      {children}
    </WalletSelectorProvider>
      </ThirdwebProvider>
    </QueryClientProvider>
  );
}
