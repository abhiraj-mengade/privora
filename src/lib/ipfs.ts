/**
 * IPFS utilities for publishing anonymous personas
 * Uses Pinata or similar IPFS pinning service
 */

export interface IPFSUploadResult {
    ipfsHash: string;
    ipfsUrl: string;
}

/**
 * Upload persona to IPFS
 * For now, we'll use a simple approach with Pinata or public IPFS gateway
 */
export async function uploadToIPFS(data: unknown): Promise<IPFSUploadResult> {
    // Option 1: Use Pinata (requires API key)
    const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const pinataSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

    if (pinataApiKey && pinataSecretKey) {
        return uploadToPinata(data, pinataApiKey, pinataSecretKey);
    }

    // Option 2: Use public IPFS gateway (web3.storage or similar)
    // For demo purposes, we'll use a simple approach
    return uploadToPublicIPFS(data);
}

async function uploadToPinata(
    data: unknown,
    apiKey: string,
    secretKey: string
): Promise<IPFSUploadResult> {
    try {
        // Convert data to JSON blob
        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: 'application/json' });
        const formData = new FormData();
        formData.append('file', blob, 'persona.json');

        const metadata = JSON.stringify({
            name: 'privora-persona',
            keyvalues: {
                type: 'persona',
                timestamp: Date.now().toString(),
            },
        });
        formData.append('pinataMetadata', metadata);

        const options = JSON.stringify({
            cidVersion: 0,
        });
        formData.append('pinataOptions', options);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                pinata_api_key: apiKey,
                pinata_secret_api_key: secretKey,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Pinata upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        const ipfsHash = result.IpfsHash;
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

        return { ipfsHash, ipfsUrl };
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
        throw error;
    }
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

