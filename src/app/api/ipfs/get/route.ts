import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ipfsHash = searchParams.get('hash');

    if (!ipfsHash) {
      return NextResponse.json(
        { error: 'IPFS hash is required' },
        { status: 400 }
      );
    }

    // Try multiple gateways, prioritizing Pinata
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      `https://${ipfsHash}.ipfs.w3s.link`,
      `https://ipfs.io/ipfs/${ipfsHash}`,
      `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
      `https://dweb.link/ipfs/${ipfsHash}`,
    ];

    // Use Pinata API key for authenticated gateway requests
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretKey = process.env.PINATA_SECRET_KEY;
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    // If we have Pinata keys, use them for authenticated requests
    if (pinataApiKey && pinataSecretKey) {
      headers['pinata_api_key'] = pinataApiKey;
      headers['pinata_secret_api_key'] = pinataSecretKey;
    }

    for (const gateway of gateways) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(gateway, {
          signal: controller.signal,
          headers,
          // Add cache control to help with reliability
          cache: 'no-store',
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        }
      } catch (error) {
        // Continue to next gateway
        continue;
      }
    }

    return NextResponse.json(
      { error: `Failed to retrieve data from IPFS: ${ipfsHash}` },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error in /api/ipfs/get:', error);
    return NextResponse.json(
      { error: 'Unexpected error while retrieving from IPFS' },
      { status: 500 }
    );
  }
}

