const hre = require("hardhat");

async function main() {
  // Replace these addresses with your deployed contract addresses
  const ttkAddress = "0xcd75Ea578348353949f4C59Ed972bA2C635960B1";
  const rtkAddress = "0xd6D641114DBDf5E8b73d36865f0aa285aaEEa952";

  console.log("Starting verification for TTK token...");
  try {
    await hre.run("verify:verify", {
      address: ttkAddress,
      constructorArguments: [
        "TestToken",
        "TTK"
      ],
    });
    console.log("TTK Token verified successfully");
  } catch (error) {
    console.log("Error verifying TTK:", error);
  }

  console.log("Starting verification for RTK token...");
  try {
    await hre.run("verify:verify", {
      address: rtkAddress,
      constructorArguments: [
        "RewardToken",
        "RTK"
      ],
    });
    console.log("RTK Token verified successfully");
  } catch (error) {
    console.log("Error verifying RTK:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
