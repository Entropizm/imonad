import { ethers, upgrades } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting deployment to Monad Testnet...\n");

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
    console.log("Found", Object.keys(deployedContracts).length, "existing contracts");
    console.log("Will skip already-deployed contracts\n");
  }

  // 1. Deploy Faucet
  if (!deployedContracts.faucet) {
    console.log("📦 Deploying MonadFaucet...");
    const Faucet = await ethers.getContractFactory("MonadFaucet");
    const faucet = await upgrades.deployProxy(
      Faucet,
      [
        ethers.parseEther("0.1"), // 0.1 MON per drip
        3600, // 1 hour cooldown
      ],
      { initializer: "initialize" }
    );
    await faucet.waitForDeployment();
    deployedContracts.faucet = await faucet.getAddress();
    console.log("✅ MonadFaucet deployed to:", deployedContracts.faucet, "\n");
  } else {
    console.log("⏭️  MonadFaucet already deployed at:", deployedContracts.faucet, "\n");
  }

  // 2. Deploy Token Disperser
  if (!deployedContracts.disperser) {
    console.log("📦 Deploying TokenDisperser...");
    const Disperser = await ethers.getContractFactory("TokenDisperser");
    const disperser = await upgrades.deployProxy(
      Disperser,
      [
        50, // 0.5% fee
        deployer.address, // fee collector
      ],
      { initializer: "initialize" }
    );
    await disperser.waitForDeployment();
    deployedContracts.disperser = await disperser.getAddress();
    console.log("✅ TokenDisperser deployed to:", deployedContracts.disperser, "\n");
  } else {
    console.log("⏭️  TokenDisperser already deployed at:", deployedContracts.disperser, "\n");
  }

  // 3. Deploy Blackjack
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
  console.log("✅ MonadBlackjack deployed to:", deployedContracts.blackjack);
  
  // Fund blackjack house
  const fundTx = await blackjack.fundHouse({ value: ethers.parseEther("10") });
  await fundTx.wait();
  console.log("💰 Funded house with 10 MON\n");

  // 4. Deploy Slots
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
  console.log("✅ MonadSlots deployed to:", deployedContracts.slots);
  
  // Fund slots house
  const fundSlotsTx = await slots.fundHouse({ value: ethers.parseEther("10") });
  await fundSlotsTx.wait();
  console.log("💰 Funded house with 10 MON\n");

  // 5. Deploy Dice
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
  console.log("✅ MonadDice deployed to:", deployedContracts.dice);
  
  // Fund dice house
  const fundDiceTx = await dice.fundHouse({ value: ethers.parseEther("10") });
  await fundDiceTx.wait();
  console.log("💰 Funded house with 10 MON\n");

  // 6. Deploy NFT
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
  } else {
    console.log("⏭️  MonadNFT already deployed at:", deployedContracts.nft, "\n");
  }

  // 7. Deploy Leaderboard
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
  } else {
    console.log("⏭️  MonadLeaderboard already deployed at:", deployedContracts.leaderboard, "\n");
  }

  // 8. Deploy Guestbook
  if (!deployedContracts.guestbook) {
    console.log("📦 Deploying MonadGuestbook...");
    const Guestbook = await ethers.getContractFactory("MonadGuestbook");
    const guestbook = await upgrades.deployProxy(Guestbook, [], { initializer: "initialize" });
    await guestbook.waitForDeployment();
    deployedContracts.guestbook = await guestbook.getAddress();
    console.log("✅ MonadGuestbook deployed to:", deployedContracts.guestbook, "\n");
  } else {
    console.log("⏭️  MonadGuestbook already deployed at:", deployedContracts.guestbook, "\n");
  }

  // 9. Deploy Escrow
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
  } else {
    console.log("⏭️  MonadEscrow already deployed at:", deployedContracts.escrow, "\n");
  }

  // 10. Deploy Prediction Market
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
  } else {
    console.log("⏭️  MonadPrediction already deployed at:", deployedContracts.prediction, "\n");
  }

  // 11. Deploy Savings
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
  console.log("✅ MonadSavings deployed to:", deployedContracts.savings);
  
  // Fund savings contract
  const fundSavingsTx = await savings.fundContract({ value: ethers.parseEther("10") });
  await fundSavingsTx.wait();
  console.log("💰 Funded savings with 10 MON\n");

  // Fund faucet
  console.log("💧 Funding faucet...");
  const fundFaucetTx = await deployer.sendTransaction({
    to: deployedContracts.faucet,
    value: ethers.parseEther("100"),
  });
  await fundFaucetTx.wait();
  console.log("✅ Funded faucet with 100 MON\n");

  // Save deployed addresses
  const deploymentInfo = {
    network: "monadTestnet",
    chainId: 10143,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: deployedContracts,
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "monadTestnet.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("✅ Deployment complete!");
  console.log("📄 Deployment info saved to deployments/monadTestnet.json\n");
  console.log("📋 Summary:");
  console.log(JSON.stringify(deployedContracts, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

