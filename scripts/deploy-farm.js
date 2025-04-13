const hre = require("hardhat");

async function main() {
  const stakeTokenAddress = "0xcd75Ea578348353949f4C59Ed972bA2C635960B1";
  const rewardTokenAddress = "0xd6D641114DBDf5E8b73d36865f0aa285aaEEa952";

  const Farming = await hre.ethers.getContractFactory("Farming");
  const farming = await Farming.deploy(stakeTokenAddress, rewardTokenAddress);

  await farming.waitForDeployment();
  console.log("Farm contract deployed to:", await farming.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
