import { ethers, upgrades } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// This script deploys only the remaining contracts (Blackjack, Slots, Dice, NFT, etc.)
// It loads existing deployments and skips already-deployed contracts

async function main() {
  console.log("🚀 Deploying remaining contracts to Monad Testnet...\n");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MON\n");

  // Load existing deployments
  const deploymentPath = path.join(__dirname, "../deployments/monadTestnet.json");
  let deployedContracts: any = {};
  
  if (fs.existsSync(deploymentPath)) {
    console.log("📋 Loading existing deployments...");
    const existing = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
    deployedContracts = existing.contracts || {};
    console.log("Found", Object.keys(deployedContracts).length, "existing contracts\n");
  }

  // 3. Deploy Blackjack (if not deployed)
  if (!deployedContracts.blackjack) {
    console.log("📦 Deploying MonadBlackjack...");
    const Blackjack = await ethers.getContractFactory("MonadBlackjack");
    const blackjack = await upgrades.deployProxy(
      Blackjack,
      [
        ethers.parseEther("0.001"), // min bet
        ethers.parseEther("1"), // max bet
        50, // 0.5% house edge
      ],
      { initializer: "initialize" }
    );
    await blackjack.waitForDeployment();
    deployedContracts.blackjack = await blackjack.getAddress();
    console.log("✅ MonadBlackjack deployed to:", deployedContracts.blackjack, "\n");
    
    // Save after each deployment
    saveDeployment(deployer.address, deployedContracts);
  } else {
    console.log("⏭️  MonadBlackjack already deployed\n");
  }

  // 4. Deploy Slots (if not deployed)
  if (!deployedContracts.slots) {
    console.log("📦 Deploying MonadSlots...");
    const Slots = await ethers.getContractFactory("MonadSlots");
    const slots = await upgrades.deployProxy(
      Slots,
      [
        ethers.parseEther("0.001"), // min bet
        ethers.parseEther("1"), // max bet
        50, // 0.5% house edge
        100, // 100x jackpot
        2, // 2x double
      ],
      { initializer: "initialize" }
    );
    await slots.waitForDeployment();
    deployedContracts.slots = await slots.getAddress();
    console.log("✅ MonadSlots deployed to:", deployedContracts.slots, "\n");
    
    saveDeployment(deployer.address, deployedContracts);
  } else {
    console.log("⏭️  MonadSlots already deployed\n");
  }

  // 5. Deploy Dice (if not deployed)
  if (!deployedContracts.dice) {
    console.log("📦 Deploying MonadDice...");
    const Dice = await ethers.getContractFactory("MonadDice");
    const dice = await upgrades.deployProxy(
      Dice,
      [
        ethers.parseEther("0.001"), // min bet
        ethers.parseEther("1"), // max bet
        50, // 0.5% house edge
      ],
      { initializer: "initialize" }
    );
    await dice.waitForDeployment();
    deployedContracts.dice = await dice.getAddress();
    console.log("✅ MonadDice deployed to:", deployedContracts.dice, "\n");
    
    saveDeployment(deployer.address, deployedContracts);
  } else {
    console.log("⏭️  MonadDice already deployed\n");
  }

  // 6. Deploy NFT (if not deployed)
  if (!deployedContracts.nft) {
    console.log("📦 Deploying MonadNFT...");
    const NFT = await ethers.getContractFactory("MonadNFT");
    const nft = await upgrades.deployProxy(
      NFT,
      [
        "Monad Testnet NFT",
        "MNFT",
        ethers.parseEther("0.01"), // 0.01 MON mint price
        "ipfs://QmExample/", // base URI
      ],
      { initializer: "initialize" }
    );
    await nft.waitForDeployment();
    deployedContracts.nft = await nft.getAddress();
    console.log("✅ MonadNFT deployed to:", deployedContracts.nft, "\n");
    
    saveDeployment(deployer.address, deployedContracts);
  } else {
    console.log("⏭️  MonadNFT already deployed\n");
  }

  // 7. Deploy Leaderboard (if not deployed)
  if (!deployedContracts.leaderboard) {
    console.log("📦 Deploying MonadLeaderboard...");
    const Leaderboard = await ethers.getContractFactory("MonadLeaderboard");
    const leaderboard = await upgrades.deployProxy(
      Leaderboard,
      [100], // max 100 entries
      { initializer: "initialize" }
    );
    await leaderboard.waitForDeployment();
    deployedContracts.leaderboard = await leaderboard.getAddress();
    console.log("✅ MonadLeaderboard deployed to:", deployedContracts.leaderboard, "\n");
    
    saveDeployment(deployer.address, deployedContracts);
  } else {
    console.log("⏭️  MonadLeaderboard already deployed\n");
  }

  // 8. Deploy Guestbook (if not deployed)
  if (!deployedContracts.guestbook) {
    console.log("📦 Deploying MonadGuestbook...");
    const Guestbook = await ethers.getContractFactory("MonadGuestbook");
    const guestbook = await upgrades.deployProxy(Guestbook, [], { initializer: "initialize" });
    await guestbook.waitForDeployment();
    deployedContracts.guestbook = await guestbook.getAddress();
    console.log("✅ MonadGuestbook deployed to:", deployedContracts.guestbook, "\n");
    
    saveDeployment(deployer.address, deployedContracts);
  } else {
    console.log("⏭️  MonadGuestbook already deployed\n");
  }

  // 9. Deploy Escrow (if not deployed)
  if (!deployedContracts.escrow) {
    console.log("📦 Deploying MonadEscrow...");
    const Escrow = await ethers.getContractFactory("MonadEscrow");
    const escrow = await upgrades.deployProxy(
      Escrow,
      [50], // 0.5% service fee
      { initializer: "initialize" }
    );
    await escrow.waitForDeployment();
    deployedContracts.escrow = await escrow.getAddress();
    console.log("✅ MonadEscrow deployed to:", deployedContracts.escrow, "\n");
    
    saveDeployment(deployer.address, deployedContracts);
  } else {
    console.log("⏭️  MonadEscrow already deployed\n");
  }

  // 10. Deploy Prediction (if not deployed)
  if (!deployedContracts.prediction) {
    console.log("📦 Deploying MonadPrediction...");
    const Prediction = await ethers.getContractFactory("MonadPrediction");
    const prediction = await upgrades.deployProxy(
      Prediction,
      [50], // 0.5% platform fee
      { initializer: "initialize" }
    );
    await prediction.waitForDeployment();
    deployedContracts.prediction = await prediction.getAddress();
    console.log("✅ MonadPrediction deployed to:", deployedContracts.prediction, "\n");
    
    saveDeployment(deployer.address, deployedContracts);
  } else {
    console.log("⏭️  MonadPrediction already deployed\n");
  }

  // 11. Deploy Savings (if not deployed)
  if (!deployedContracts.savings) {
    console.log("📦 Deploying MonadSavings...");
    const Savings = await ethers.getContractFactory("MonadSavings");
    const savings = await upgrades.deployProxy(
      Savings,
      [
        500, // 5% annual interest
        ethers.parseEther("0.01"), // min deposit
        0, // no lock period for testnet
      ],
      { initializer: "initialize" }
    );
    await savings.waitForDeployment();
    deployedContracts.savings = await savings.getAddress();
    console.log("✅ MonadSavings deployed to:", deployedContracts.savings, "\n");
    
    saveDeployment(deployer.address, deployedContracts);
  } else {
    console.log("⏭️  MonadSavings already deployed\n");
  }

  console.log("✅ Deployment complete!");
  console.log("📄 Deployment info saved to deployments/monadTestnet.json\n");
  console.log("📋 All deployed contracts:");
  console.log(JSON.stringify(deployedContracts, null, 2));
}

function saveDeployment(deployerAddress: string, contracts: any) {
  const deploymentInfo = {
    network: "monadTestnet",
    chainId: 10143,
    deployer: deployerAddress,
    timestamp: new Date().toISOString(),
    contracts: contracts,
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "monadTestnet.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

