/**
 * IPFS utilities for publishing anonymous personas
 * Uses Pinata or similar IPFS pinning service
 */

export interface IPFSUploadResult {
    ipfsHash: string;
    ipfsUrl: string;
}

/**
 * Upload persona to IPFS.
 *
 * - In production, this calls our Next.js API route, which talks to Pinata using
 *   server-side `PINATA_API_KEY` and `PINATA_SECRET_KEY` (never exposed to the browser).
 * - In development (or if the API fails), we fall back to a localStorage-based mock hash.
 */
export async function uploadToIPFS(data: unknown): Promise<IPFSUploadResult> {
    try {
        // Prefer server-side Pinata upload via API route
        const response = await fetch('/api/ipfs/pin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            return (await response.json()) as IPFSUploadResult;
        }

        console.warn('Pinata API route failed, falling back to public IPFS:', await response.text());
    } catch (error) {
        console.warn('Error calling Pinata API route, falling back to public IPFS:', error);
    }

    // Fallback: Use public IPFS (web3.storage or local mock)
    return uploadToPublicIPFS(data);
}

async function uploadToPublicIPFS(data: unknown): Promise<IPFSUploadResult> {
    // For demo: Use web3.storage or similar public service
    // For now, we'll simulate with a local storage approach
    // In production, use a proper IPFS service

    try {
        const json = JSON.stringify(data);
        
        // Use web3.storage if available, otherwise use a public gateway
        const web3StorageKey = process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY;
        
        if (web3StorageKey) {
            return uploadToWeb3Storage(json, web3StorageKey);
        }

        // Fallback: Store in localStorage and generate a mock hash
        // In production, you'd want a real IPFS node
        const hash = generateMockHash(json);
        const ipfsUrl = `https://ipfs.io/ipfs/${hash}`;
        
        // Store locally for demo purposes
        if (typeof window !== 'undefined') {
            localStorage.setItem(`ipfs_${hash}`, json);
        }

        return { ipfsHash: hash, ipfsUrl };
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw error;
    }
}

async function uploadToWeb3Storage(json: string, apiKey: string): Promise<IPFSUploadResult> {
    const blob = new Blob([json], { type: 'application/json' });
    const file = new File([blob], 'persona.json', { type: 'application/json' });

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://api.web3.storage/upload', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Web3.Storage upload failed: ${response.statusText}`);
    }

    const cid = await response.text();
    const ipfsUrl = `https://${cid}.ipfs.w3s.link/persona.json`;

    return { ipfsHash: cid, ipfsUrl };
}

function generateMockHash(data: string): string {
    // Simple hash function for demo purposes
    // In production, use proper IPFS hashing
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return `Qm${Math.abs(hash).toString(16).padStart(44, '0')}`;
}

/**
 * Retrieve persona from IPFS
 */
export async function retrieveFromIPFS(ipfsHash: string): Promise<unknown> {
    // Try multiple gateways
    const gateways = [
        `https://ipfs.io/ipfs/${ipfsHash}`,
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
    ];

    // Check localStorage first (for demo)
    if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`ipfs_${ipfsHash}`);
        if (cached) {
            return JSON.parse(cached);
        }
    }

    for (const gateway of gateways) {
        try {
            const response = await fetch(gateway);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn(`Failed to fetch from ${gateway}:`, error);
        }
    }

    throw new Error(`Failed to retrieve data from IPFS: ${ipfsHash}`);
}

