// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PersonaRegistry
 * @notice Minimal on‑chain index of IPFS personas for Privora.
 *
 * - Stores IPFS CIDs for pseudonymous recipient profiles.
 * - Anyone can register their own persona.
 * - The owner can add bootstrap personas for demos/migrations.
 *
 * This does NOT store any PII – only public IPFS hashes.
 */
contract PersonaRegistry is Ownable {
    struct Persona {
        address owner;
        string ipfsHash;
        uint256 createdAt;
    }

    // Flat list of all personas (for easy indexing / enumeration)
    Persona[] private personas;

    // Indexes of personas owned by a given address
    mapping(address => uint256[]) private ownerToPersonaIds;

    event PersonaRegistered(
        uint256 indexed id,
        address indexed owner,
        string ipfsHash
    );

    constructor(address initialOwner) Ownable(initialOwner) {
        // Optional: bootstrap a known demo persona at deployment time.
        // The deployer can pass address(0) if they don't want this.
        //
        // For your current demo, you can:
        //  - set `initialOwner` to your wallet
        //  - and call `ownerBootstrapPersona(...)` after deployment
    }

    /**
     * @notice Register a persona linked to the caller.
     * @param ipfsHash The IPFS CID (e.g., "bafkrei...")
     */
    function registerMyPersona(string calldata ipfsHash) external returns (uint256) {
        require(bytes(ipfsHash).length > 0, "Registry: empty hash");

        uint256 id = personas.length;
        personas.push(Persona({
            owner: msg.sender,
            ipfsHash: ipfsHash,
            createdAt: block.timestamp
        }));

        ownerToPersonaIds[msg.sender].push(id);

        emit PersonaRegistered(id, msg.sender, ipfsHash);
        return id;
    }

    /**
     * @notice Owner‑only helper to add an arbitrary persona (e.g., for demos/migrations).
     * @dev You can use this to insert
     *      "bafkreigphnp2awfithdsr3kalqihgmt3twm45ntvxxtjyeus2iq6dmjy5m"
     *      after deploying the contract.
     */
    function ownerBootstrapPersona(address personaOwner, string calldata ipfsHash)
        external
        onlyOwner
        returns (uint256)
    {
        require(bytes(ipfsHash).length > 0, "Registry: empty hash");

        uint256 id = personas.length;
        personas.push(Persona({
            owner: personaOwner,
            ipfsHash: ipfsHash,
            createdAt: block.timestamp
        }));

        if (personaOwner != address(0)) {
            ownerToPersonaIds[personaOwner].push(id);
        }

        emit PersonaRegistered(id, personaOwner, ipfsHash);
        return id;
    }

    /**
     * @notice Get total number of indexed personas.
     */
    function totalPersonas() external view returns (uint256) {
        return personas.length;
    }

    /**
     * @notice Get a persona by its global ID.
     */
    function getPersona(uint256 id) external view returns (Persona memory) {
        require(id < personas.length, "Registry: bad id");
        return personas[id];
    }

    /**
     * @notice Get all persona IDs associated with an address.
     */
    function getPersonasOf(address ownerAddr) external view returns (uint256[] memory) {
        return ownerToPersonaIds[ownerAddr];
    }

    /**
     * @notice Return all personas.
     * @dev For large sets this is expensive; fine for a demo / small registry.
     */
    function getAllPersonas() external view returns (Persona[] memory) {
        return personas;
    }
}


