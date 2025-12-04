import { task } from 'hardhat/config'

/**
 * Deploys the FHE-enabled NetworkSchoolVerifier contract to a target network.
 *
 * Usage (from cofhe-hardhat-starter):
 *
 *   npx hardhat arb-sepolia:deploy-network-school --network eth-sepolia
 */
task('arb-sepolia:deploy-network-school', 'Deploy NetworkSchoolVerifier')
  .setAction(async (_args, hre) => {
    const { ethers } = hre

    const [deployer] = await ethers.getSigners()
    console.log('Deployer:', await deployer.getAddress())

    // Hard-coded initial Network School residency wallets for the demo
    const initialMembers: string[] = [
      '0xC6cCe116ecf7dD6e1D8F82Cfc4D9cd1E5487db7e',
      '0x9E4abEF8eC12dBa4038A0c01B22AE0a470DA755F',
    ]

    const Factory = await ethers.getContractFactory('NetworkSchoolVerifier')
    const contract = await Factory.deploy(initialMembers)
    await contract.waitForDeployment()

    const address = await contract.getAddress()
    console.log('NetworkSchoolVerifier deployed to:', address)
  })


