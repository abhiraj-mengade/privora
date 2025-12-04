// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/**
 * @title ImpactSBT
 * @notice Minimal FHE-enabled Soulbound Token (SBT) for Privora impact badges.
 *
 * Design:
 * - Non-transferable ERC721-like token (one tokenId per donation event).
 * - Stores an encrypted uint128 `amountEnc` (ZEC * 1e8) using FHE.
 * - Stores an encrypted boolean `verifiedEnc` that can later be flipped
 *   after off-chain / Zcash-layer verification if desired.
 * - Metadata (pseudonym, memo, tx hash) is stored in cleartext for the demo.
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
        string zcashTxId;
        string memo;
        euint128 amountEnc; // encrypted amount in zatoshis (ZEC * 1e8)
        ebool verifiedEnc;  // encrypted flag for additional verification
    }

    // Simple incremental token id
    uint256 public nextTokenId = 1;

    // Soulbound registry
    mapping(uint256 => Impact) private _impacts;

    // Each address can hold multiple SBTs; we only track balance for UX.
    mapping(address => uint256[]) private _tokensOf;

    event ImpactMinted(
        uint256 indexed tokenId,
        address indexed donor,
        string builderPseudonym,
        string zcashTxId,
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
     * @param donor Recipient of the SBT (patron)
     * @param builderPseudonym Pseudonymous builder name
     * @param zcashTxId Shielded Zcash transaction identifier (opaque string)
     * @param memo Optional memo text
     * @param amountZats Plain amount in zatoshis (uint128)
     */
    function mintImpact(
        address donor,
        string calldata builderPseudonym,
        string calldata zcashTxId,
        string calldata memo,
        uint128 amountZats
    ) external returns (uint256 tokenId) {
        require(donor != address(0), "ImpactSBT: zero donor");

        tokenId = nextTokenId++;

        euint128 encAmount = FHE.asEuint128(amountZats);
        ebool encVerified = FHE.asEbool(false);

        Impact storage imp = _impacts[tokenId];
        imp.donor = donor;
        imp.builderPseudonym = builderPseudonym;
        imp.zcashTxId = zcashTxId;
        imp.memo = memo;
        imp.amountEnc = encAmount;
        imp.verifiedEnc = encVerified;

        _tokensOf[donor].push(tokenId);

        // allow donor to decrypt their own encrypted fields via cofhejs
        FHE.allowSender(imp.amountEnc);
        FHE.allowSender(imp.verifiedEnc);

        emit ImpactMinted(
            tokenId,
            donor,
            builderPseudonym,
            zcashTxId,
            encAmount,
            encVerified
        );
    }

    /// @notice View metadata for a given token (cleartext fields only).
    function getImpact(uint256 tokenId) external view returns (
        address donor,
        string memory builderPseudonym,
        string memory zcashTxId,
        string memory memo
    ) {
        Impact storage imp = _impacts[tokenId];
        donor = imp.donor;
        builderPseudonym = imp.builderPseudonym;
        zcashTxId = imp.zcashTxId;
        memo = imp.memo;
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


