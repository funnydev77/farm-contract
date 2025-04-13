const hre = require("hardhat");

async function main() {
  // Replace these addresses with your deployed contract addresses
  const ttkAddress = "0xcd75Ea578348353949f4C59Ed972bA2C635960B1";
  const rtkAddress = "0xd6D641114DBDf5E8b73d36865f0aa285aaEEa952";
  const farmAddress = "0x81cbC97d3A2f23099235EbC6cdC613AB6B2f56d3";

  console.log("Starting verification for Farm Contract...");
  try {
    await hre.run("verify:verify", {
      address: farmAddress,
      constructorArguments: [
        ttkAddress,
        rtkAddress
      ],
    });
    console.log("Farm Contract verified successfully");
  } catch (error) {
    console.log("Error verifying Farm:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
