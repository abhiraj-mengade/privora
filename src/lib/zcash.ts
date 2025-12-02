/**
 * Zcash shielded transaction utilities using NEAR Intents 1Click API
 * Handles ZEC transfers through shielded addresses via NEAR Intents
 * Reference: https://github.com/nearuaguild/near-intents-1click-example
 */

const ONECLICK_API_URL = 'https://api.1click.fi/v1/quote';

export interface ZcashTransaction {
    toAddress: string; // Z-address (shielded) - recipient
    amount: number; // Amount in ZEC
    memo?: string; // Optional encrypted memo
    refundTo?: string; // Refund address if transaction fails
}

export interface OneClickQuote {
    quoteId: string;
    depositAddress: string; // Address to send ZEC to
    inputAmount: string;
    outputAmount: string;
    depositType: 'ORIGIN_CHAIN' | 'INTENTS';
    recipientType: 'ORIGIN_CHAIN' | 'INTENTS';
    inputToken: string;
    outputToken: string;
    estimatedTime?: number;
    expiry?: number;
}

export interface ZcashTransactionResult {
    quoteId: string;
    depositAddress: string;
    status: 'quote_received' | 'pending' | 'fulfilled' | 'failed';
    txId?: string; // Zcash transaction ID (once fulfilled)
    confirmationCount?: number;
}

/**
 * Generate a new shielded Z-address
 * In production, this would use a Zcash wallet library or be provided by the user
 */
export async function generateShieldedAddress(): Promise<string> {
    // For demo: Generate a mock Z-address
    // In production, this would come from user's Zcash wallet
    const randomBytes = new Uint8Array(11);
    crypto.getRandomValues(randomBytes);
    const hex = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    return `zs1${hex.substring(0, 75)}`; // Z-address format
}

/**
 * Get a quote from NEAR Intents 1Click API for sending ZEC
 * This returns a deposit address where the donor should send their ZEC
 */
export async function getZcashQuote(
    transaction: ZcashTransaction
): Promise<OneClickQuote> {
    // ZEC token identifier on Zcash network
    // This may need to be adjusted based on actual token identifiers used by 1Click API
    const zecTokenId = 'zec'; // Native ZEC on Zcash

    const quoteRequest = {
        depositType: 'ORIGIN_CHAIN' as const, // Sending from native Zcash
        recipientType: 'ORIGIN_CHAIN' as const, // Recipient on native Zcash
        inputToken: zecTokenId,
        outputToken: zecTokenId, // Same token, just transferring
        inputAmount: transaction.amount.toString(),
        recipientAddress: transaction.toAddress, // Recipient's Z-address
        refundTo: transaction.refundTo || transaction.toAddress, // Refund address
        memo: transaction.memo,
    };

    try {
        const response = await fetch(ONECLICK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(quoteRequest),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`1Click API error: ${response.status} - ${error}`);
        }

        const quote = await response.json();
        return quote as OneClickQuote;
    } catch (error) {
        console.error('Error getting Zcash quote:', error);
        throw error;
    }
}

/**
 * Create and send a shielded Zcash transaction via NEAR Intents 1Click API
 * Returns a quote with deposit address - user must send ZEC to that address
 */
export async function sendShieldedTransaction(
    transaction: ZcashTransaction
): Promise<ZcashTransactionResult> {
    try {
        // Step 1: Get quote from 1Click API
        const quote = await getZcashQuote(transaction);

        // Step 2: Return quote information
        // The user needs to send their ZEC to quote.depositAddress
        // The solver will pick it up and complete the transaction to transaction.toAddress

        return {
            quoteId: quote.quoteId,
            depositAddress: quote.depositAddress,
            status: 'quote_received',
            confirmationCount: 0,
        };
    } catch (error) {
        console.error('Error sending shielded transaction:', error);
        
        // Fallback for demo/development
        if (process.env.NODE_ENV === 'development') {
            console.warn('Using mock quote in development mode');
            return {
                quoteId: generateMockQuoteId(),
                depositAddress: generateShieldedAddressSync(), // Mock deposit address
                status: 'quote_received',
                confirmationCount: 0,
            };
        }
        
        throw error;
    }
}

/**
 * Check the status of a quote/transaction
 */
export async function checkQuoteStatus(quoteId: string): Promise<ZcashTransactionResult> {
    try {
        const response = await fetch(`${ONECLICK_API_URL}/${quoteId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch quote status: ${response.statusText}`);
        }

        const status = await response.json();

        return {
            quoteId,
            depositAddress: status.depositAddress || '',
            status: status.status || 'pending',
            txId: status.txId,
            confirmationCount: status.confirmationCount || 0,
        };
    } catch (error) {
        console.error('Error checking quote status:', error);
        // Return pending status on error
        return {
            quoteId,
            depositAddress: '',
            status: 'pending',
            confirmationCount: 0,
        };
    }
}

/**
 * Get recipient's shielded address from their persona
 * In production, this would be stored in the persona metadata
 */
export async function getRecipientShieldedAddress(ipfsHash: string): Promise<string> {
    // In production, retrieve persona from IPFS and extract Z-address
    // For now, generate a deterministic address from hash
    const hash = ipfsHash.replace('Qm', '');
    const address = `zs1${hash.substring(0, 75)}`;
    return address;
}

function generateMockQuoteId(): string {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    return `quote_${Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')}`;
}

function generateShieldedAddressSync(): string {
    const randomBytes = new Uint8Array(11);
    crypto.getRandomValues(randomBytes);
    const hex = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    return `zs1${hex.substring(0, 75)}`;
}

/**
 * Format ZEC amount for display
 */
export function formatZEC(amount: number): string {
    return `${amount.toFixed(4)} ZEC`;
}

