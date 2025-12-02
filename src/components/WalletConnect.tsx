'use client';

import { WalletSelector, WalletSelectorUI } from '@hot-labs/near-connect';
import { useState, useEffect, useRef } from 'react';

export default function WalletConnect() {
    const [accountId, setAccountId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const selectorRef = useRef<WalletSelector | null>(null);
    const uiRef = useRef<WalletSelectorUI | null>(null);

    useEffect(() => {
        let isMounted = true;

        const initSelector = async () => {
            try {
                // Initialize the connector (following tutorial pattern)
                const selector = new WalletSelector({
                    network: 'testnet',
                    features: {
                        signMessage: true,
                        signTransaction: true,
                        signInWithoutAddKey: true,
                        signAndSendTransaction: true,
                        signAndSendTransactions: true,
                    },
                });

                // Wait for manifest to load
                await selector.whenManifestLoaded;

                if (!isMounted) return;

                selectorRef.current = selector;

                // Initialize UI
                const ui = new WalletSelectorUI(selector);
                uiRef.current = ui;

                // Subscribe to sign-in event (following tutorial pattern)
                selector.on('wallet:signIn', async ({ wallet, accounts, success }) => {
                    if (success && wallet && isMounted) {
                        try {
                            const address = await wallet.getAddress();
                            console.log(`User signed in: ${address}`);
                            setAccountId(address);
                        } catch (error) {
                            console.error('Failed to get address:', error);
                        }
                    }
                });

                // Subscribe to sign-out event (following tutorial pattern)
                selector.on('wallet:signOut', () => {
                    console.log('User signed out');
                    if (isMounted) {
                        setAccountId(null);
                    }
                });

                // Check if already connected
                try {
                    const connected = await selector.getConnectedWallet();
                    if (connected && connected.accounts.length > 0) {
                        const wallet = await selector.wallet();
                        if (wallet) {
                            const address = await wallet.getAddress();
                            if (isMounted) {
                                setAccountId(address);
                            }
                        }
                    }
                } catch (error) {
                    // Not connected, that's fine
                }

                if (isMounted) {
                    setLoading(false);
                }

                // Cleanup
                return () => {
                    isMounted = false;
                    selector.off('wallet:signIn');
                    selector.off('wallet:signOut');
                };
            } catch (error) {
                console.error('Failed to initialize wallet selector:', error);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initSelector();

        return () => {
            isMounted = false;
        };
    }, []);

    // Connect function to open modal (following tutorial pattern)
    const handleConnectWallet = async () => {
        try {
            const selector = selectorRef.current;
            const ui = uiRef.current;

            if (!selector || !ui) {
                console.error('Wallet selector not initialized');
                return;
            }

            // Ensure manifest is loaded
            await selector.whenManifestLoaded;

            // Open the wallet selector UI
            ui.open();
        } catch (error) {
            console.error('Failed to show wallet selector:', error);
        }
    };

    // Disconnect function (following tutorial pattern)
    const handleDisconnect = async () => {
        try {
            const selector = selectorRef.current;
            if (selector) {
                await selector.disconnect();
                setAccountId(null);
            }
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        }
    };

    const isConnected = !!accountId;

    if (loading) {
        return (
            <button className="btn-outline opacity-50 cursor-not-allowed" disabled>
                Loading...
            </button>
        );
    }

    return (
        <>
            {!isConnected ? (
                <button onClick={handleConnectWallet} className="btn-primary">
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
                <div className="flex items-center gap-4">
                    <div className="glass-card px-4 py-2">
                        <span className="font-mono text-sm text-matrix-green-primary">
                            {accountId}
                        </span>
                    </div>
                    <button onClick={handleDisconnect} className="btn-outline">
                        Disconnect
                    </button>
                </div>
            )}
        </>
    );
}
