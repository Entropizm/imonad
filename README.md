# iOS 4 - Monad Edition 🔷

A nostalgic recreation of iOS 4 with full Web3 integration on Monad Testnet. Experience the classic iPhone interface while interacting with real blockchain smart contracts!

## 🌟 Features

### 📱 Authentic iOS 4 Experience
- Boot animation with Apple logo
- Lock screen with wallet connection integration
- Responsive iPhone frame (desktop) / fullscreen (mobile)
- Smooth app transitions and animations

### ⛓️ Web3 Integration
- **RainbowKit** wallet connection
- **Monad Testnet** support (Chain ID: 10143)
- Real-time blockchain interactions
- iOS-style transaction feedback

### 🎮 DApp Features
- **Faucet** 💧: Request testnet MON tokens
- **Token Disperser** 💸: Batch send to multiple addresses
- **Blackjack** 🃏: On-chain casino game with house edge
- **Slot Machine** 🎰: Provably fair slots
- **Dice Game** 🎲: Roll and win
- **NFT Minter** 💎: Mint collectibles
- **Leaderboard** 🏆: On-chain high scores
- **Guestbook** 📝: Permanent messages
- **Escrow** 🤝: Secure transactions
- **Prediction Market** 🎯: Bet on outcomes
- **Savings** 🏦: Earn interest

### 🎨 Classic iOS Apps
- Calculator, Notes, Clock, Messages, Photos, Safari, Settings

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MetaMask or compatible Web3 wallet
- Monad Testnet MON tokens (use the faucet!)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp env.example .env.local

# Edit .env.local with your values:
# - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (get from walletconnect.com)
# - PRIVATE_KEY (for contract deployment)
```

### Development

```bash
# Start Next.js dev server
npm run dev

# Open http://localhost:3000
```

### Compile Smart Contracts

```bash
# Compile all contracts
npm run compile

# This generates ABIs in artifacts/
```

## 📦 Smart Contract Deployment

### Setup

1. Get Monad Testnet MON from the faucet (once app is running)
2. Add your private key to `.env.local`
3. Fund your deployment wallet with MON

### Deploy to Monad Testnet

```bash
npm run deploy
```

This will:
- Deploy all 11 upgradeable contracts
- Fund gaming contracts with initial bank
- Save deployment info to `deployments/monadTestnet.json`

### Deployed Contracts

After deployment, contract addresses are saved to:
```
deployments/monadTestnet.json
```

The frontend will automatically load these addresses.

### Contract Details

| Contract | Description | Features |
|----------|-------------|----------|
| **MonadFaucet** | Testnet token faucet | Drip amount, cooldown period |
| **TokenDisperser** | Batch token sender | Native & ERC20 support, 0.5% fee |
| **MonadBlackjack** | Blackjack game | Hit/stand, blockhash randomness, house edge |
| **MonadSlots** | Slot machine | 3-reel slots, jackpot multiplier |
| **MonadDice** | Dice game | Over/under, specific number bets |
| **MonadNFT** | NFT minter | ERC721, batch minting |
| **MonadLeaderboard** | Score tracking | Top 100, usernames |
| **MonadGuestbook** | On-chain messages | Like system, 280 char limit |
| **MonadEscrow** | Secure trades | Buyer/seller protection, disputes |
| **MonadPrediction** | Prediction market | Binary outcomes, proportional payouts |
| **MonadSavings** | Interest account | 5% APY, compound interest |

## 🏗️ Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with Web3 providers
│   ├── page.tsx            # Main app entry
│   ├── providers.tsx       # RainbowKit + Wagmi setup
│   └── globals.css         # Global styles
├── components/
│   ├── BootScreen.tsx      # Apple logo animation
│   ├── LockScreen.tsx      # Wallet connection + unlock
│   ├── HomeScreen.tsx      # App grid
│   ├── IPhoneFrame.tsx     # Responsive phone frame
│   ├── StatusBar.tsx       # Top status bar
│   ├── TransactionModal.tsx # iOS-style tx feedback
│   └── apps/
│       ├── FaucetApp.tsx   # Faucet DApp
│       ├── Calculator.tsx  # Classic calculator
│       ├── Notes.tsx       # Note taking
│       └── [other apps]
├── contracts/
│   ├── MonadFaucet.sol     # All smart contracts
│   ├── TokenDisperser.sol
│   ├── MonadBlackjack.sol
│   └── [10 more contracts]
├── scripts/
│   └── deploy.ts           # Deployment script
├── lib/
│   ├── wagmi.ts            # Monad testnet config
│   ├── contracts.ts        # Contract addresses
│   └── abis/               # Contract ABIs
├── hardhat.config.ts       # Hardhat configuration
└── package.json
```

## 🔧 Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **RainbowKit** - Wallet connection
- **Wagmi** - Ethereum interactions
- **Viem** - Ethereum utilities

### Blockchain
- **Hardhat** - Smart contract development
- **OpenZeppelin** - Upgradeable contracts
- **Solidity 0.8.20** - Contract language
- **Monad Testnet** - Deployment network

## 🌐 Monad Testnet Details

- **Chain ID**: 10143
- **RPC URL**: wss://monad-testnet.drpc.org
- **Explorer**: https://monad-testnet.socialscan.io/
- **Native Token**: MON
- **Faucet**: Built into the app! 💧

## 📱 Usage Guide

### 1. Boot & Connect
1. Watch the boot animation
2. On lock screen, click "Connect Wallet"
3. Select your wallet and approve
4. Slide to unlock

### 2. Get Testnet Tokens
1. Open **Faucet** app (💧 in dock)
2. Click "Request Tokens"
3. Receive 0.1 MON (1 hour cooldown)

### 3. Use DApps
- **DApp icons** have purple gradient
- All transactions show iOS-style modals
- Check transaction on block explorer

### 4. Play Games
1. Open Blackjack/Slots/Dice
2. Place bet (minimum 0.001 MON)
3. Play and win! 🎰

### 5. Create Content
- **Guestbook**: Leave permanent messages
- **NFT Minter**: Create collectibles
- **Leaderboard**: Submit high scores

## 🔐 Security Notes

- ⚠️ **Testnet Only**: These contracts are for testing
- 🔑 Never share your private keys
- 💰 Testnet tokens have no real value
- 🧪 Contracts use blockhash randomness (not production-grade)

## 🎮 Contract Interaction Examples

### Request Faucet Tokens
```typescript
// Frontend automatically handles this
await writeContract({
  address: faucetAddress,
  abi: FaucetABI,
  functionName: 'requestDrip',
});
```

### Play Blackjack
```typescript
// Start game with 0.01 MON bet
const gameId = await writeContract({
  address: blackjackAddress,
  abi: BlackjackABI,
  functionName: 'startGame',
  value: parseEther('0.01'),
});

// Hit
await writeContract({
  functionName: 'hit',
  args: [gameId],
});

// Stand
await writeContract({
  functionName: 'stand',
  args: [gameId],
});
```

## 🛠️ Development

### Run Tests
```bash
npm run test
```

### Compile Contracts
```bash
npm run compile
```

### Deploy Locally
```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy contracts
npm run deploy:local
```

### Upgrade Contracts
```bash
# Contracts are upgradeable using UUPS pattern
# Update contract code, then:
npx hardhat run scripts/upgrade.ts --network monadTestnet
```

## 🐛 Troubleshooting

### Wallet Won't Connect
- Ensure MetaMask is installed
- Add Monad Testnet to MetaMask:
  - Network Name: Monad Testnet
  - RPC URL: wss://monad-testnet.drpc.org
  - Chain ID: 10143
  - Currency: MON

### Transaction Fails
- Check you have enough MON for gas
- Use the faucet to get more tokens
- Check cooldown periods on faucet

### iPhone Frame Not Scaling
- Try different screen sizes
- Mobile automatically removes frame
- Desktop shows scaled frame

## 🤝 Contributing

This is a hackathon/demo project showing Web3 integration with retro UI. Feel free to:
- Add more DApps
- Improve game mechanics
- Add more iOS 4 features
- Enhance animations

## 📄 License

MIT License - feel free to use and modify!

## 🔗 Links

- **Monad Testnet Explorer**: https://monad-testnet.socialscan.io/
- **RainbowKit Docs**: https://rainbowkit.com
- **Wagmi Docs**: https://wagmi.sh
- **Hardhat Docs**: https://hardhat.org

## 🎉 Credits

Built with ❤️ for the Monad community. Combining nostalgia with cutting-edge blockchain technology!

---

**Made by Ocean** | Monad Testnet 2025

