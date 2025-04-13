const hre = require("hardhat");

async function main() {
  const TTK = await hre.ethers.getContractFactory("ERC20Mock");
  const ttk = await TTK.deploy("TestToken", "TTK");
  // Wait for the contract to be mined
  await ttk.waitForDeployment();
  console.log("ttk contract deployed to:", await ttk.getAddress());

  const RTK = await hre.ethers.getContractFactory("ERC20Mock");
  const rtk = await RTK.deploy("RewardToken", "RTK");
  // Wait for the contract to be mined
  await rtk.waitForDeployment();
  console.log("rtk contract deployed to:", await rtk.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
