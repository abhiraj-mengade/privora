# Privora Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Required: NEAR AI Cloud API Key
# Get your API key from https://cloud.near.ai
NEXT_PUBLIC_NEAR_AI_API_KEY=your_near_ai_api_key_here

# Optional: IPFS Pinning Service (choose one)
# Option 1: Pinata
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key

# Option 2: Web3.Storage
NEXT_PUBLIC_WEB3_STORAGE_KEY=your_web3_storage_key
```

## Getting API Keys

### NEAR AI Cloud API Key (Required)

1. Sign up at [cloud.near.ai](https://cloud.near.ai)
2. Go to the "API Keys" section
3. Generate a new API key
4. Add credits to your account in the "Credits" section
5. Copy the API key to your `.env.local` file

### IPFS Pinning (Optional)

The app will work without IPFS pinning (using local storage for demo), but for production use:

**Pinata:**
1. Sign up at [pinata.cloud](https://pinata.cloud)
2. Create an API key with pinning permissions
3. Add both API key and secret key to `.env.local`

**Web3.Storage:**
1. Sign up at [web3.storage](https://web3.storage)
2. Create an API token
3. Add to `.env.local`

## Running the Application

```bash
# Install dependencies
npm install
# or
bun install

# Run development server
npm run dev
# or
bun dev
```

## How It Works

### Recipient Flow (Data Incinerator)
1. Recipient fills out profile with potentially identifying information
2. Profile is sent to NEAR AI Cloud (TEE) to strip all PII
3. Anonymized persona is published to IPFS
4. IPFS hash is stored locally (in production, this would be on-chain)

### Donor Flow (Agentic Wallet)
1. Donor sets preferences (topics, geography, amount)
2. System loads all available personas from storage/IPFS
3. NEAR AI Cloud matches donor intent with personas
4. Donor selects a match and sends ZEC via shielded transaction
5. Transaction is executed on Zcash network

## Current Limitations

- **Zcash Integration**: Uses NEAR Intents 1Click API. Users need to send ZEC to the provided deposit address manually. For production, integrate with a Zcash wallet to automate the deposit step.
- **1Click API**: The API endpoint and token identifiers may need adjustment based on actual NEAR Intents deployment. Check the [NEAR Intents documentation](https://github.com/nearuaguild/near-intents-1click-example) for the latest API details.
- **IPFS**: Demo mode uses local storage. For production, use a proper IPFS pinning service
- **Storage**: Personas are stored in browser localStorage. In production, use a decentralized database or on-chain storage

