import { task } from "hardhat/config";

task("deploy-impact-sbt", "Deploy the FHE-enabled ImpactSBT contract").setAction(
  async (_args, hre) => {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying ImpactSBT with account:", await deployer.getAddress());

    const factory = await hre.ethers.getContractFactory("ImpactSBT");
    const contract = await factory.deploy(await deployer.getAddress());

    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("ImpactSBT deployed to:", address);
  }
);


