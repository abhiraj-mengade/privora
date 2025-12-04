<div align="center">

# PRIVØRA

  <img src="public/banner.png" alt="Privora Banner" width="100%" />

**Private capital for public impact.**

A privacy-preserving philanthropy platform that enables anonymous donors to fund verified-but-pseudonymous builders through shielded Zcash transactions, coordinated on NEAR, with zero-knowledge proofs ensuring credibility without identity leakage.

[![Demo](https://img.shields.io/badge/🚀_Live_Demo-privora--mu.vercel.app-00ff41?style=for-the-badge)](https://privora-mu.vercel.app/)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org/)
[![Zcash](https://img.shields.io/badge/Privacy-Zcash-F3B724)](https://z.cash/)
[![NEAR](https://img.shields.io/badge/Coordination-NEAR-00C1DE)](https://near.org/)

</div>

---

## The Problem: Why Privacy Matters in Philanthropy

In an era where financial surveillance is ubiquitous and political repression targets dissidents through their funding sources, traditional philanthropy platforms create a dangerous paper trail. When an activist building anti-censorship tools receives funding, that transaction—visible on public blockchains or traditional payment rails—becomes a liability. Authoritarian regimes can trace funding networks, identify supporters, and target both donors and recipients.

**Privora solves this by architecting a three-layer privacy stack:**

1. **Payment Layer (Zcash)**: Shielded transactions where amounts, senders, and recipients are encrypted using zk-SNARKs
2. **Coordination Layer (NEAR)**: Smart contracts that orchestrate matching and impact tracking without storing sensitive data
3. **Identity Layer (Zero-Knowledge Proofs)**: Credibility verification without identity revelation—prove you're human, prove you're a Network School member, prove your location—without revealing _which_ human, _which_ cohort, or _where_ exactly

This isn't just privacy theater. It's a cryptographic guarantee that enables high-risk philanthropy to exist in hostile environments.

---

## Architecture: Separation of Concerns for Maximum Privacy

Privora follows a **layered architecture** where each component handles exactly one concern, allowing us to reason about privacy guarantees without hand-waving.

<div align="center">
 <img width="8168" height="4302" alt="image" src="https://github.com/user-attachments/assets/fa65a1cc-78bb-4cd4-ad7b-5e67a68a07ac" />
  <p><em>Complete workflow showing the privacy-preserving donation flow from intent to impact</em></p>
</div>

### Layer 1: Zcash Payment Layer

All donations flow through **Zcash shielded addresses (Z-addresses)**. The Zcash protocol uses zk-SNARKs to encrypt transaction amounts, sender addresses, and recipient addresses on-chain. Only the parties involved can decrypt their own transactions; to external observers, the blockchain shows only encrypted blobs.

**Technical Implementation:**

- Integration with NEAR Intents 1Click API for ZEC transfers
- Shielded address generation for both donors and recipients
- Transaction quotes and status polling for asynchronous settlement
- No on-chain storage of Zcash transaction IDs (preserves privacy)

### Layer 2: NEAR Coordination Layer

NEAR smart contracts handle:

- **Donor intent matching**: Encrypted preference signals matched against pseudonymous profiles
- **IPFS persona indexing**: On-chain registry of IPFS CIDs (content-addressed profiles)
- **Impact SBT minting**: FHE-enabled Soulbound Tokens that prove impact without revealing amounts

**Key Contracts:**

- `PersonaRegistry.sol`: Minimal on-chain index of IPFS personas (Sepolia)
- `ImpactSBT.sol`: FHE-enabled SBT contract tracking funded builders and amounts (Sepolia)
- `NetworkSchoolVerifier.sol`: FHE-based residency verification (Fhenix/CoFHE)

**Privacy Guarantee**: Only hashes, boolean flags, and encrypted fields are stored on-chain. No PII, no payment amounts (in cleartext), no transaction links.

### Layer 3: Zero-Knowledge Identity Layer

Builders prove credibility through multiple ZK proof systems:

- **Reclaim Protocol**: ZK proofs for GitHub contributions, Leetcode activity, Scholar profiles, and location verification
- **Network School Verification**: FHE-based proof of Network School residency without revealing cohort
- **Future**: Semaphore-style proofs for other startup societies (YC, Antler, The Residency)

**NEAR AI Integration**: PII stripping and persona matching using NEAR AI Cloud, with prompts designed to remove identifying information while preserving semantic meaning for matching.

---

## Technical Stack

### Frontend

- **Framework**: Next.js 14.2.4 (App Router)
- **React**: 18.2.0
- **Styling**: Tailwind CSS with custom matrix theme
- **Animations**: Framer Motion
- **Wallet Integration**:
  - Thirdweb SDK (`@thirdweb-dev/react`) for EVM wallet connection (MetaMask, Rabby, Talisman, etc.)
  - Ethers.js v5.8.0 for contract interactions
- **State Management**: React Query (TanStack Query v4)
- **ZK Proofs**: Reclaim Protocol JS SDK

### Smart Contracts

- **Language**: Solidity ^0.8.25
- **Networks**:
  - Ethereum Sepolia (persona registry, impact SBTs)
  - Fhenix (FHE-enabled Network School verification)
- **Libraries**:
  - OpenZeppelin Contracts (Ownable, ECDSA)
  - Fhenix CoFHE Contracts (FHE encryption)
- **Development**: Hardhat with CoFHE plugin

### Infrastructure

- **IPFS**: Profile storage (Pinata/Web3.Storage compatible)
- **NEAR AI**: PII stripping and persona matching via API proxy
- **Zcash**: QR payment through Zashi wallet

---

## Smart Contract Details

### PersonaRegistry (Sepolia)

Minimal on-chain index storing only IPFS CIDs. No PII, no profiles, just content-addressed references.

```solidity
struct Persona {
    address owner;
    string ipfsHash;  // IPFS CID
    uint256 createdAt;
}
```

**Functions:**

- `registerMyPersona(string ipfsHash)`: Register your persona's IPFS hash
- `getAllPersonas()`: Enumerate all registered personas
- `getPersonasByOwner(address)`: Query personas by owner address

### ImpactSBT (Sepolia)

FHE-enabled Soulbound Token tracking funding without revealing amounts publicly.

```solidity
struct Impact {
    address donor;
    string builderPseudonym;
    string causeTag;
    string memo;
    uint256 issuedAt;
    euint128 amountEnc;      // FHE-encrypted amount in zatoshis
    ebool verifiedEnc;       // FHE-encrypted verification flag
}
```

**Privacy Features:**

- Amounts encrypted using FHE (decryptable only by donor via CoFHE)
- No Zcash transaction IDs stored (shielded txns remain private)
- Public mappings track funded status: `fundedBuilders[ipfsHash]`, `totalFundingAmount[ipfsHash]`

**Functions:**

- `mintImpact(...)`: Mint SBT with encrypted amount
- `isBuilderFunded(string ipfsHash)`: Check if builder has been funded
- `getTotalFundingAmount(string ipfsHash)`: Get total funding (in zatoshis)

### NetworkSchoolVerifier (Fhenix)

FHE-based verification proving Network School residency without revealing cohort.

**Verification Flow:**

1. Builder signs message: `keccak256(contract, chainId, claimant, member, nonce)`
2. Contract verifies signature from allowlisted member address
3. Stores encrypted verification flag: `verifiedEnc[claimant] = FHE.asEbool(true)`
4. Only claimant can decrypt via CoFHE coprocessor

---

## Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- An EVM wallet (MetaMask, Rabby, Talisman, etc.) with Sepolia ETH
- Zcash wallet (for receiving donations, optional for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/privora.git
cd privora

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

```bash
# NEAR AI (for PII stripping and matching)
NEXT_PUBLIC_NEAR=your_near_ai_api_key

# Reclaim Protocol (for ZK proofs)
NEXT_PUBLIC_RECLAIM_APP_ID=your_app_id
NEXT_PUBLIC_RECLAIM_APP_SECRET=your_app_secret

# Smart Contracts (Sepolia)
NEXT_PUBLIC_INDEX_CONTRACT=0x...  # PersonaRegistry address
NEXT_PUBLIC_IMPACT_SBT_CONTRACT=0x...  # ImpactSBT address
NEXT_PUBLIC_NETWORK_SCHOOL_VERIFIER=0x...  # NetworkSchoolVerifier address
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key

# Thirdweb
NEXT_PUBLIC_TEMPLATE_CLIENT_ID=your_thirdweb_client_id
```

### Development

```bash
# Start development server
npm run dev
# or
bun dev

# Open http://localhost:3000
```

### Deploying Contracts

```bash
cd cofhe-hardhat-starter

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat deploy-impact-sbt --network sepolia
npx hardhat deploy-network-school --network sepolia

# Update .env with deployed addresses
```

---

## Usage

### For Builders (Recipients)

1. **Create Profile**: Navigate to `/recipient` and fill out pseudonymous profile

   - Choose a pseudonym (no real names)
   - Select category and skills
   - Write bio (will be PII-stripped by NEAR AI)
   - Add funding need description

2. **Attach ZK Proofs**: Verify credibility without revealing identity

   - GitHub contributions (via Reclaim)
   - Leetcode activity (via Reclaim)
   - Scholar profile (via Reclaim)
   - Location verification (via Reclaim)
   - Network School residency (via FHE contract)

3. **Add Payment Address**: Provide Zcash shielded address (zs1...)

4. **Publish**: Profile is uploaded to IPFS and indexed on-chain

### For Patrons (Donors)

1. **Set Intent**: Navigate to `/donor` and specify preferences

   - Topics of interest
   - Geographic focus
   - Funding amount
   - Free-form intent text (optional)

2. **Find Matches**: AI matches your intent against available builders

   - NEAR AI analyzes profiles and returns ranked matches
   - View match scores, reasons, and verification badges

3. **Fund Directly**: Browse all builders or fund matched recipients
   - Scan QR code with Zcash wallet
   - Send shielded transaction
   - Mint Impact SBT (proves your donation without revealing amount)

---

## Privacy Guarantees

### What's Private

- **Payment amounts**: Encrypted in Zcash shielded transactions
- **Donor identity**: No on-chain link between EVM address and Zcash address
- **Recipient identity**: Pseudonyms only, no real names or locations
- **Transaction graph**: No public ledger showing who funded whom

### What's Public

- **IPFS profile hashes**: Content-addressed references (profiles themselves are encrypted)
- **Verification flags**: Boolean indicators (e.g., "has GitHub proof") without revealing details
- **Funding status**: Whether a builder has been funded (not amounts or donors)
- **Impact SBT metadata**: Donor address, builder pseudonym, cause tag (amounts encrypted)

### Threat Model

Privora is designed for scenarios where:

- Donors need to remain anonymous (political repression, surveillance states)
- Recipients need pseudonymity (activists, dissidents, high-risk builders)
- Funding amounts should be private (prevent targeting based on wealth)

**Not designed for:**

- Regulatory compliance (no KYC/AML)
- Tax reporting (amounts are private)
- Public accountability (by design, transactions are private)

---

## Contributing

Privora is built for high-risk philanthropy. Contributions should maintain the privacy-first architecture.

### Areas for Contribution

- **Additional ZK proof systems**: Integrate Semaphore, Sismo, or other proof protocols
- **More startup societies**: Add verification for YC, Antler, The Residency
- **UI/UX improvements**: Better empty states, loading skeletons, mobile optimization
- **Documentation**: Technical deep-dives, threat model analysis, deployment guides

### Development Guidelines

- **Privacy by default**: Never add features that leak identity or amounts
- **Minimal on-chain data**: Store only what's necessary for coordination
- **Cryptographic guarantees**: Prefer ZK proofs over trusted intermediaries
- **Separation of concerns**: Keep payment, coordination, and identity layers separate

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Acknowledgments

Built with:

- [Zcash](https://z.cash/) for shielded transactions
- [NEAR Protocol](https://near.org/) for coordination layer
- [Fhenix CoFHE](https://fhenix.io/) for FHE-enabled contracts
- [Reclaim Protocol](https://reclaimprotocol.org/) for ZK proofs
- [NEAR AI](https://near.ai/) for PII stripping and matching

---

**Privacy is not a feature—it's a requirement for high-risk philanthropy.**
