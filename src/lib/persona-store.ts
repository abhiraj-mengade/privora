/**
 * Local storage for personas (IPFS hashes)
 * In production, this would be on-chain or in a decentralized database
 */

const PERSONAS_STORAGE_KEY = 'privora_personas';

export interface StoredPersona {
    ipfsHash: string;
    ipfsUrl: string;
    createdAt: number;
}

/**
 * Store persona IPFS hash locally
 */
export function storePersona(ipfsHash: string, ipfsUrl: string): void {
    if (typeof window === 'undefined') return;

    const personas = getStoredPersonas();
    personas.push({
        ipfsHash,
        ipfsUrl,
        createdAt: Date.now(),
    });

    localStorage.setItem(PERSONAS_STORAGE_KEY, JSON.stringify(personas));
}

/**
 * Get all stored persona hashes
 */
export function getStoredPersonas(): StoredPersona[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(PERSONAS_STORAGE_KEY);
    if (!stored) return [];

    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

/**
 * Clear all stored personas
 */
export function clearStoredPersonas(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PERSONAS_STORAGE_KEY);
}

