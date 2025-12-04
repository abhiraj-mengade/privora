// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/**
 * @title NetworkSchoolVerifier
 * @notice FHE-enabled residency verifier for the Network School cohort.
 *
 * - `isMember` is a public allowlist of Network School wallets.
 * - Builders prove membership by submitting a signature from a residency wallet over:
 *      (contract, chainId, claimant, member, nonce)
 * - On success we store an encrypted boolean `verifiedEnc[claimant]` using FHE,
 *   so only the claimant (and contracts you explicitly allow) can decrypt their
 *   verification status via the CoFHE coprocessor.
 */
contract NetworkSchoolVerifier is Ownable {
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

    constructor(address[] memory initialMembers) Ownable(msg.sender) {
        deploymentChainId = block.chainid;
        for (uint256 i = 0; i < initialMembers.length; i++) {
            isMember[initialMembers[i]] = true;
            emit MemberAdded(initialMembers[i]);
        }
    }

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

    function verifyMembership(
        address member,
        bytes32 nonce,
        bytes calldata signature
    ) external {
        require(isMember[member], "NSVerifier: member not whitelisted");
        require(!consumedNonces[nonce], "NSVerifier: nonce used");

        bytes32 structHash = keccak256(
            abi.encodePacked(address(this), deploymentChainId, msg.sender, member, nonce)
        );
        // Manually build the Ethereum signed message hash since OZ v5 moved helpers
        bytes32 digest = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", structHash)
        );
        address recovered = ECDSA.recover(digest, signature);
        require(recovered == member, "NSVerifier: bad sig");

        consumedNonces[nonce] = true;

        // set encrypted verification flag using FHE
        ebool encTrue = FHE.asEbool(true);
        verifiedEnc[msg.sender] = encTrue;
        memberOf[msg.sender] = member;

        // allow the claimant to decrypt their own verification flag via cofhejs
        FHE.allowSender(verifiedEnc[msg.sender]);

        emit ResidencyVerified(msg.sender, member, nonce, keccak256(signature), encTrue);
    }

    function getEncryptedVerification(address claimant) external view returns (ebool) {
        return verifiedEnc[claimant];
    }
}


