import { task } from "hardhat/config";

task("deploy-impact-sbt", "Deploy the FHE-enabled ImpactSBT contract").setAction(
  async (_args, hre) => {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying ImpactSBT with account:", deployer.address);

    const factory = await hre.ethers.getContractFactory("ImpactSBT");
    const contract = await factory.deploy(deployer.address);

    await contract.deployed();

    console.log("ImpactSBT deployed to:", contract.address);
  }
);


