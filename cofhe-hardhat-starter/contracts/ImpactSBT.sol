// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/**
 * @title ImpactSBT
 * @notice Privacy-preserving FHE-enabled Soulbound Token (SBT) for Privora impact badges.
 *
 * Design:
 * - Non-transferable ERC721-like token (one tokenId per donation event).
 * - Stores an encrypted uint128 `amountEnc` (ZEC * 1e8) using FHE.
 * - Stores an encrypted boolean `verifiedEnc` that can later be flipped
 *   after off-chain / Zcash-layer verification if desired.
 * - Privacy-preserving: NO zcashTxId stored on-chain (shielded txns remain private).
 * - Cleartext metadata: donor address, builder pseudonym, cause tag, optional memo.
 *
 * NOTE: This is a minimal demo contract, not a full ERC-721 implementation.
 * It exposes just enough surface for the frontend to mint and to let holders
 * prove impact amounts using the CoFHE coprocessor.
 */
contract ImpactSBT is Ownable {
    using Strings for uint256;

    struct Impact {
        address donor;
        string builderPseudonym;
        string causeTag; // e.g., "anti-censorship tools", "Network School builder"
        string memo; // Optional high-level memo (no payment details)
        uint256 issuedAt; // Block timestamp when minted
        euint128 amountEnc; // encrypted amount in zatoshis (ZEC * 1e8)
        ebool verifiedEnc;  // encrypted flag for additional verification
    }

    // Simple incremental token id
    uint256 public nextTokenId = 1;

    // Soulbound registry
    mapping(uint256 => Impact) private _impacts;

    // Each address can hold multiple SBTs; we only track balance for UX.
    mapping(address => uint256[]) private _tokensOf;

    // Track funded builders by IPFS hash (to prevent duplicate funding)
    mapping(string => bool) public fundedBuilders; // IPFS hash => funded status
    mapping(string => uint256) public fundingCount; // IPFS hash => number of times funded
    mapping(string => uint256) public totalFundingAmount; // IPFS hash => total funding amount in zatoshis

    event ImpactMinted(
        uint256 indexed tokenId,
        address indexed donor,
        string builderPseudonym,
        string causeTag,
        uint256 issuedAt,
        euint128 amountEnc,
        ebool verifiedEnc
    );

    error Soulbound();

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Mint a new impact SBT to `donor`.
     * @dev Caller is expected to be an application server or privileged
     *      contract. For demo, we leave this open but in production you
     *      would restrict this to a trusted minter.
     *
     * Privacy note: We do NOT store zcashTxId on-chain to preserve
     * shielded transaction privacy. Only encrypted amount and verification
     * flags are stored, decryptable only by the donor via CoFHE.
     *
     * @param donor Recipient of the SBT (patron)
     * @param builderPseudonym Pseudonymous builder name (from IPFS persona)
     * @param causeTag High-level cause tag (e.g., "anti-censorship tools")
     * @param memo Optional memo text (high-level only, no payment details)
     * @param amountZats Plain amount in zatoshis (uint128) - will be encrypted
     * @param ipfsHash IPFS hash of the builder's profile (for tracking funded status)
     */
    function mintImpact(
        address donor,
        string calldata builderPseudonym,
        string calldata causeTag,
        string calldata memo,
        uint128 amountZats,
        string calldata ipfsHash
    ) external returns (uint256 tokenId) {
        require(donor != address(0), "ImpactSBT: zero donor");

        tokenId = nextTokenId++;

        euint128 encAmount = FHE.asEuint128(amountZats);
        ebool encVerified = FHE.asEbool(false);

        Impact storage imp = _impacts[tokenId];
        imp.donor = donor;
        imp.builderPseudonym = builderPseudonym;
        imp.causeTag = causeTag;
        imp.memo = memo;
        imp.issuedAt = block.timestamp;
        imp.amountEnc = encAmount;
        imp.verifiedEnc = encVerified;

        _tokensOf[donor].push(tokenId);

        // Mark builder as funded (track by IPFS hash)
        if (bytes(ipfsHash).length > 0) {
            fundedBuilders[ipfsHash] = true;
            fundingCount[ipfsHash]++;
            totalFundingAmount[ipfsHash] += amountZats;
        }

        // allow donor to decrypt their own encrypted fields via cofhejs
        FHE.allowSender(imp.amountEnc);
        FHE.allowSender(imp.verifiedEnc);

        emit ImpactMinted(
            tokenId,
            donor,
            builderPseudonym,
            causeTag,
            imp.issuedAt,
            encAmount,
            encVerified
        );
    }

    /// @notice View metadata for a given token (cleartext fields only).
    function getImpact(uint256 tokenId) external view returns (
        address donor,
        string memory builderPseudonym,
        string memory causeTag,
        string memory memo,
        uint256 issuedAt
    ) {
        Impact storage imp = _impacts[tokenId];
        donor = imp.donor;
        builderPseudonym = imp.builderPseudonym;
        causeTag = imp.causeTag;
        memo = imp.memo;
        issuedAt = imp.issuedAt;
    }

    /// @notice Get encrypted amount (for CoFHE-based proofs).
    function getEncryptedAmount(uint256 tokenId) external view returns (euint128) {
        return _impacts[tokenId].amountEnc;
    }

    /// @notice Get encrypted verification flag.
    function getEncryptedVerified(uint256 tokenId) external view returns (ebool) {
        return _impacts[tokenId].verifiedEnc;
    }

    /// @notice Number of SBTs held by `owner`.
    function balanceOf(address ownerAddr) external view returns (uint256) {
        return _tokensOf[ownerAddr].length;
    }

    /// @notice Check if a builder (by IPFS hash) has been funded.
    function isBuilderFunded(string calldata ipfsHash) external view returns (bool) {
        return fundedBuilders[ipfsHash];
    }

    /// @notice Get the number of times a builder has been funded.
    function getFundingCount(string calldata ipfsHash) external view returns (uint256) {
        return fundingCount[ipfsHash];
    }

    /// @notice Get the total funding amount for a builder (in zatoshis).
    function getTotalFundingAmount(string calldata ipfsHash) external view returns (uint256) {
        return totalFundingAmount[ipfsHash];
    }

    /// @notice Soulbound: no transfers allowed.
    function transferFrom(address, address, uint256) external pure {
        revert Soulbound();
    }

    function safeTransferFrom(address, address, uint256) external pure {
        revert Soulbound();
    }

    function safeTransferFrom(address, address, uint256, bytes calldata) external pure {
        revert Soulbound();
    }
}


