"use client";
import { WalletSelectorProvider } from "@near-wallet-selector/react-hook";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import "@near-wallet-selector/modal-ui/styles.css";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletSelectorProvider
      config={{
        network: "testnet",
        createAccessKeyFor: "privora.testnet",
        modules: [setupMeteorWallet()],
      }}
    >
      {children}
    </WalletSelectorProvider>
  );
}
