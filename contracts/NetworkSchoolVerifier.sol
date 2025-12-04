// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/**
 * @title NetworkSchoolVerifier
 * @notice FHE-enabled residency verifier for the Network School cohort.
 *
 * - `isMember` is a public allowlist of residency wallets controlled by Network School.
 * - Builders prove membership by submitting a signature from a residency wallet over:
 *      (contract, chainId, claimant, member, nonce)
 * - On success we store an encrypted boolean `verifiedEnc[claimant]` using FHE,
 *   so only the claimant (and contracts you explicitly allow) can decrypt their
 *   verification status via the CoFHE coprocessor.
 */
contract NetworkSchoolVerifier is Ownable {
    using ECDSA for bytes32;

    string public constant RESIDENCY = "NETWORK_SCHOOL";
    uint256 public immutable deploymentChainId;

    // Public allowlist of residency wallets (managed by Network School)
    mapping(address => bool) public isMember;

    // Encrypted verification flag for each claimant (ebool comes from FHE.sol)
    mapping(address => ebool) private verifiedEnc;

    // Which residency wallet endorsed this claimant
    mapping(address => address) public memberOf;

    // Prevent nonce replay
    mapping(bytes32 => bool) public consumedNonces;

    event MemberAdded(address indexed member);
    event MemberRemoved(address indexed member);
    event ResidencyVerified(
        address indexed claimant,
        address indexed member,
        bytes32 nonce,
        bytes32 proofHash,
        ebool encryptedFlag
    );

    constructor(address[] memory initialMembers) {
        deploymentChainId = block.chainid;
        for (uint256 i = 0; i < initialMembers.length; i++) {
            isMember[initialMembers[i]] = true;
            emit MemberAdded(initialMembers[i]);
        }
    }

    /**
     * @notice Owner can batch add or remove residency wallets.
     */
    function setMembers(address[] calldata members, bool allowed) external onlyOwner {
        for (uint256 i = 0; i < members.length; i++) {
            isMember[members[i]] = allowed;
            if (allowed) {
                emit MemberAdded(members[i]);
            } else {
                emit MemberRemoved(members[i]);
            }
        }
    }

    /**
     * @notice Claim that `msg.sender` is backed by a whitelisted membership wallet.
     * @param member The residency wallet that produced the signature.
     * @param nonce  A unique random nonce (32 bytes) to prevent replay.
     * @param signature ECDSA signature produced by `member`.
     *
     * FHE details:
     *  - We store `verifiedEnc[claimant] = FHE.asEbool(true)`.
     *  - We call `FHE.allowSender(verifiedEnc[claimant])` so the claimant can
     *    unseal their own flag via cofhejs.
     */
    function verifyMembership(
        address member,
        bytes32 nonce,
        bytes calldata signature
    ) external {
        require(isMember[member], "NSVerifier: member not whitelisted");
        require(!consumedNonces[nonce], "NSVerifier: nonce already used");

        bytes32 structHash = keccak256(
            abi.encodePacked(address(this), deploymentChainId, msg.sender, member, nonce)
        );
        bytes32 digest = structHash.toEthSignedMessageHash();

        address recovered = ECDSA.recover(digest, signature);
        require(recovered == member, "NSVerifier: invalid signature");

        consumedNonces[nonce] = true;
        memberOf[msg.sender] = member;

        // Set encrypted verification flag using FHE
        ebool encTrue = FHE.asEbool(true);
        verifiedEnc[msg.sender] = encTrue;

        // Allow the claimant to decrypt their own verification flag via cofhejs
        FHE.allowSender(verifiedEnc[msg.sender]);

        emit ResidencyVerified(msg.sender, member, nonce, keccak256(signature), encTrue);
    }

    /**
     * @notice Returns the encrypted verification flag for a claimant.
     * The caller must use cofhejs / CoFHE coprocessor to unseal this value.
     */
    function getEncryptedVerification(address claimant) external view returns (ebool) {
        return verifiedEnc[claimant];
    }
}



