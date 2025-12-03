/**
 * Thin wrapper + React-friendly hook for a Zcash WASM wallet (e.g. zingolib).
 * This lets us keep all shielded transaction logic in the browser, with a clean
 * interface to plug a real wallet implementation into later.
 */

export interface ZcashWasmWallet {
    /**
     * Send funds to a shielded Z-address.
     * @param params.address Recipient Z-address (zs1...)
     * @param params.amount Amount in zatoshis (1 ZEC = 1e8 zats)
     * @param params.memo Optional encrypted memo
     * @returns txId string
     */
    sendToAddress(params: { address: string; amount: number; memo?: string }): Promise<string>;
}

export interface UseZcashWalletResult {
    wallet: ZcashWasmWallet | null;
    loading: boolean;
    error: string | null;
    /**
     * Connect / initialize the wallet from a seed phrase or encrypted blob.
     * For now this is a mock; in production, wire this to zingolib / zcash-client-backend-js.
     */
    connect(seedPhrase: string): Promise<void>;
}

/**
 * Default mock implementation so the UI can work without a real wallet.
 * Replace the internals of connect() and sendToAddress() with real zingolib bindings.
 */
export function useZcashWalletMock(): UseZcashWalletResult {
    // Simple React-less implementation for now – caller can hold this in useState/useEffect.
    let currentWallet: ZcashWasmWallet | null = null;
    let currentError: string | null = null;
    let isLoading = false;

    const connect = async (seedPhrase: string) => {
        isLoading = true;
        currentError = null;
        try {
            // TODO: replace with real WASM init (zingolib / zcash-client-backend-js)
            if (!seedPhrase || seedPhrase.split(' ').length < 12) {
                throw new Error('Invalid seed phrase');
            }
            currentWallet = {
                async sendToAddress({ address, amount, memo }) {
                    console.log('MOCK sendToAddress', { address, amount, memo });
                    // Generate a fake tx id
                    const randomBytes = new Uint8Array(32);
                    crypto.getRandomValues(randomBytes);
                    return Array.from(randomBytes)
                        .map((b) => b.toString(16).padStart(2, '0'))
                        .join('');
                },
            };
        } catch (e) {
            currentError = e instanceof Error ? e.message : 'Failed to initialize wallet';
            throw e;
        } finally {
            isLoading = false;
        }
    };

    return {
        get wallet() {
            return currentWallet;
        },
        get loading() {
            return isLoading;
        },
        get error() {
            return currentError;
        },
        connect,
    };
}


