"use client";

import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

export default function WalletConnect() {
  const { signedAccountId, signIn, signOut } = useWalletSelector();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleConnect = async () => {
    signIn();
  };

  const handleDisconnect = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Failed to sign out", err);
    }
  };

  if (!isMounted) {
    return (
      <button className="btn-outline opacity-50 cursor-not-allowed" disabled>
        Loading...
      </button>
    );
  }

  return (
    <>
      {!signedAccountId ? (
        <button
          onClick={handleConnect}
          className="glass-card px-4 py-2 flex items-center gap-3 hover:bg-matrix-green-primary/10 transition-colors group text-matrix-green-primary"
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            Connect NEAR Wallet
          </span>
        </button>
      ) : (
        <button
          onClick={handleDisconnect}
          className="glass-card px-4 py-2 flex items-center gap-3 hover:bg-matrix-green-primary/10 transition-colors group"
        >
          <span className="font-mono text-sm text-matrix-green-primary">
            {signedAccountId}
          </span>
          <LogOut className="w-4 h-4 text-matrix-green-primary/70 group-hover:text-matrix-green-primary transition-colors" />
        </button>
      )}
    </>
  );
}
