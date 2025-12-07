import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying Marketplace Contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy AppRegistry
  console.log("📝 Deploying AppRegistry...");
  const AppRegistry = await ethers.getContractFactory("AppRegistry");
  
  // Use MONAD token address (you'll need to replace this with actual MONAD token on testnet)
  // For now, we'll use a placeholder - user needs to update this
  const MONAD_TOKEN_ADDRESS = process.env.MONAD_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
  
  const appRegistry = await AppRegistry.deploy();
  await appRegistry.waitForDeployment();
  const appRegistryAddress = await appRegistry.getAddress();
  
  console.log("✅ AppRegistry deployed to:", appRegistryAddress);

  // Initialize AppRegistry
  console.log("\n🔧 Initializing AppRegistry...");
  const initTx = await appRegistry.initialize(MONAD_TOKEN_ADDRESS);
  await initTx.wait();
  console.log("✅ AppRegistry initialized");

  // Save deployment info
  const deploymentInfo = {
    AppRegistry: appRegistryAddress,
    monadToken: MONAD_TOKEN_ADDRESS,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filePath = path.join(deploymentsDir, "marketplace.json");
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📄 Deployment info saved to:", filePath);
  console.log("\n✅ All contracts deployed successfully!");
  console.log("\n⚠️  IMPORTANT: Update MONAD_TOKEN_ADDRESS in .env with the actual MONAD token address");
  console.log("⚠️  Then update lib/contracts.ts with the deployed addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

