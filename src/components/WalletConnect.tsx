'use client';

import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import '@near-wallet-selector/modal-ui/styles.css';
import { useState, useEffect } from 'react';
import type { WalletSelector, AccountState } from '@near-wallet-selector/core';

export default function WalletConnect() {
    const [selector, setSelector] = useState<WalletSelector | null>(null);
    const [modal, setModal] = useState<any>(null);
    const [accounts, setAccounts] = useState<AccountState[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initWallet = async () => {
            try {
                const _selector = await setupWalletSelector({
                    network: 'testnet',
                    modules: [
                        setupMyNearWallet(),
                        setupHereWallet(),
                    ],
                });

                const _modal = setupModal(_selector, {
                    contractId: 'privora.testnet', // Replace with your contract
                });

                const state = _selector.store.getState();
                setAccounts(state.accounts);

                setSelector(_selector);
                setModal(_modal);
            } catch (error) {
                console.error('Failed to initialize wallet:', error);
            } finally {
                setLoading(false);
            }
        };

        initWallet();
    }, []);

    const handleConnectWallet = () => {
        modal?.show();
    };

    const handleDisconnect = async () => {
        const wallet = await selector?.wallet();
        await wallet?.signOut();
        setAccounts([]);
    };

    const isConnected = accounts.length > 0;

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
                            {accounts[0].accountId}
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
