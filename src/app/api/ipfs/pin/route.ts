import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const pinataApiKey = process.env.PINATA_API_KEY;
        const pinataSecretKey = process.env.PINATA_SECRET_KEY;

        if (!pinataApiKey || !pinataSecretKey) {
            return NextResponse.json(
                { error: 'Pinata API keys not configured on server' },
                { status: 500 }
            );
        }

        const body = await request.json();

        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretKey,
            },
            body: JSON.stringify({
                pinataOptions: {
                    cidVersion: 1,
                },
                pinataMetadata: {
                    name: 'privora-persona',
                    keyvalues: {
                        type: 'persona',
                    },
                },
                pinataContent: body,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            return NextResponse.json(
                { error: `Pinata upload failed: ${response.status} - ${text}` },
                { status: 500 }
            );
        }

        const result = await response.json();
        const ipfsHash = result.IpfsHash;
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

        return NextResponse.json({ ipfsHash, ipfsUrl });
    } catch (error) {
        console.error('Error in /api/ipfs/pin:', error);
        return NextResponse.json(
            { error: 'Unexpected error while uploading to IPFS' },
            { status: 500 }
        );
    }
}


