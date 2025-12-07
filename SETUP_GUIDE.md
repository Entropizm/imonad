# iMonad Hackathon Setup Guide

Complete setup instructions for the iMonad platform with App Studio and Marketplace features.

## 🎯 Overview

This guide will help you set up:
1. **Guest Mode** - Users can unlock without wallet
2. **App Studio** - AI-powered app creation with Monaco Editor
3. **Marketplace** - Token-based app marketplace with bonding curve economics
4. **Dynamic Apps** - User-created apps loaded from MongoDB

---

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Anthropic API key (for AI code generation)
- MetaMask or Web3 wallet
- Monad Testnet access

---

## 🚀 Step 1: Install Dependencies

All required packages are already installed. If you need to reinstall:

```bash
npm install
```

New packages added:
- `mongoose` - MongoDB ODM
- `@ai-sdk/anthropic` - Anthropic AI SDK
- `ai` - Vercel AI SDK
- `@monaco-editor/react` - Monaco code editor
- `recharts` - Charts for marketplace

---

## 🗄️ Step 2: Setup MongoDB

### Option A: Local MongoDB (Recommended for hackathon)

1. Install MongoDB:
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

2. Verify it's running:
```bash
mongosh
# Should connect to mongodb://localhost:27017
```

### Option B: MongoDB Atlas (Cloud)

1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/imonad`)

---

## 🔑 Step 3: Configure Environment Variables

1. Copy the example env file:
```bash
cp env.example .env
```

2. Fill in the required values in `.env`:

```bash
# WalletConnect (Required for wallet connections)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# MongoDB (Required for App Studio & Marketplace)
MONGODB_URI=mongodb://localhost:27017/imonad
# OR for Atlas: mongodb+srv://user:pass@cluster.mongodb.net/imonad

# Anthropic API (Required for AI code generation)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Monad Testnet (Already configured)
MONAD_TESTNET_RPC=https://monad-testnet.drpc.org
MONAD_TESTNET_CHAIN_ID=10143

# Private Key for Contract Deployment
PRIVATE_KEY=your_private_key_without_0x

# MONAD Token Address (Update after finding testnet token)
MONAD_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
```

### Getting API Keys:

**WalletConnect Project ID:**
1. Go to https://cloud.walletconnect.com
2. Create a project
3. Copy the Project ID

**Anthropic API Key:**
1. Go to https://console.anthropic.com
2. Create account and get API key
3. Add credits (they offer free trial)

---

## 📝 Step 4: Deploy Smart Contracts

### 4.1 Compile Contracts

```bash
npm run compile
```

This compiles:
- `AppToken.sol` - ERC20 with bonding curve
- `AppRegistry.sol` - Registry for user-created apps

### 4.2 Get Testnet Funds

1. Get Monad testnet tokens from faucet
2. Make sure you have enough for gas fees

### 4.3 Deploy Marketplace Contracts

```bash
npm run deploy:marketplace
```

This will:
- Deploy `AppRegistry` contract
- Initialize with MONAD token address
- Save deployment info to `deployments/marketplace.json`

### 4.4 Update Contract Addresses

After deployment, update `lib/contracts.ts` with the new addresses:

```typescript
export const APP_REGISTRY_ADDRESS = "0x..."; // From marketplace.json
```

---

## 🎨 Step 5: Start the Application

```bash
npm run dev
```

The app will be available at http://localhost:3000

---

## 🧪 Step 6: Test the Features

### Test 1: Guest Mode (No Wallet Required)

1. Open http://localhost:3000
2. Wait for boot screen
3. **Slide to unlock** - no wallet connection needed!
4. Browse homescreen
5. Try opening non-blockchain apps (Calculator, Clock, Notes)

✅ **Expected:** Apps open without wallet prompt

### Test 2: Wallet Connection on Blockchain Apps

1. Try opening a blockchain app (Blackjack, Dice, NFT)
2. **Wallet modal should appear**
3. Connect your wallet
4. App should open after connection

✅ **Expected:** Wallet modal appears only for blockchain apps

### Test 3: App Studio (Create Apps)

1. Open **App Studio** (🎨 icon in dock)
2. Choose a template:
   - **Dice Game** - Web3 dice rolling
   - **Token ICO** - Token presale interface
   - **Simple App** - Utility app
3. AI will generate code in chat
4. View code in Monaco Editor
5. Fill in app details:
   - App Name
   - Icon (emoji)
   - Category
6. Click **🚀 Deploy**
7. App saves to MongoDB

✅ **Expected:** App created and appears in Marketplace

### Test 4: Marketplace (Browse & Trade)

1. Open **Marketplace** (🏪 icon in dock)
2. Browse created apps by category
3. Click on an app to see details:
   - Token statistics
   - Price chart
   - Liquidity pool
4. **Add to Homescreen** - earn tokens as reward
5. **Buy Booster** - increase app value
6. **Swap Tokens** - trade app tokens for MONAD

✅ **Expected:** Can browse, download, and trade app tokens

### Test 5: Dynamic App Loading

1. After creating an app in App Studio
2. Go back to homescreen
3. Refresh page
4. **Your created app should appear** on homescreen
5. Click to open it

✅ **Expected:** User-created apps load and run

---

## 🎯 Step 7: Hackathon Demo Flow

Perfect demo sequence:

1. **Start in Guest Mode**
   - "No wallet needed to explore!"
   - Browse existing apps

2. **Create an App**
   - Open App Studio
   - Use AI to generate a simple game
   - Deploy it

3. **Show Marketplace**
   - Browse apps
   - Show token economics
   - Buy booster to increase value
   - Show price chart

4. **Download & Use**
   - Add app to homescreen
   - Earn tokens
   - Open the app from homescreen

5. **Trade Tokens**
   - Swap app tokens back to MONAD
   - Show profit from early adoption

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh

# If not running:
brew services start mongodb-community
```

### AI Generation Not Working

- Check `ANTHROPIC_API_KEY` in `.env`
- Verify API key has credits
- Check browser console for errors

### Dynamic Apps Not Loading

- Check MongoDB connection
- Verify apps exist: `mongosh` → `use imonad` → `db.apps.find()`
- Check browser console for errors

### Contract Deployment Fails

- Check you have testnet funds
- Verify `PRIVATE_KEY` in `.env`
- Check `MONAD_TESTNET_RPC` is accessible

### Wallet Modal Not Appearing

- Check `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env`
- Try different browser
- Clear browser cache

---

## 📁 Project Structure

```
ios4-monad/
├── app/
│   ├── api/
│   │   ├── apps/              # App CRUD endpoints
│   │   └── ai/generate/       # AI code generation
│   └── page.tsx               # Main app entry
├── components/
│   ├── apps/
│   │   ├── SuperApp.tsx       # App Studio
│   │   └── MarketplaceApp.tsx # Marketplace
│   ├── HomeScreen.tsx         # Dynamic app loading
│   ├── LockScreen.tsx         # Guest mode
│   └── WalletConnectModal.tsx # Wallet prompt
├── contracts/
│   ├── AppToken.sol           # ERC20 with bonding curve
│   └── AppRegistry.sol        # App registry
├── lib/
│   ├── mongodb.ts             # DB connection
│   └── models/App.ts          # App schema
└── scripts/
    └── deploy-marketplace.ts  # Deployment script
```

---

## 🎨 Key Features Implemented

### 1. Guest Mode ✅
- Unlock without wallet
- Browse apps freely
- Wallet prompt only for blockchain actions

### 2. App Studio ✅
- AI-powered code generation (Anthropic Claude)
- Monaco Editor for code editing
- Template system (Dice, Token ICO, Simple)
- Chat interface for iterations
- One-click deployment

### 3. Marketplace ✅
- Browse apps by category
- Token statistics display
- Price charts (Recharts)
- Bonding curve economics
- Buy boosters to increase value
- Swap tokens for MONAD

### 4. Tokenomics ✅
- Each app has its own ERC20 token
- Bonding curve: price = liquidity / supply
- App value = supply × boosters
- 10% creator fee on purchases
- Download rewards for users

### 5. Dynamic Apps ✅
- User-created apps stored in MongoDB
- Loaded dynamically on homescreen
- Sandboxed execution
- Access to wagmi hooks

---

## 🚀 Next Steps (Optional Enhancements)

If you have extra time:

1. **IPFS Storage** - Store app code on IPFS instead of MongoDB
2. **App Categories** - Add folder system for organization
3. **Social Features** - Comments, ratings, favorites
4. **Advanced Charts** - Historical price data tracking
5. **App Templates** - More pre-built templates
6. **Testing** - Add unit tests for contracts
7. **Mobile Responsive** - Better mobile experience

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check terminal for server errors
3. Verify all environment variables are set
4. Check MongoDB is running
5. Ensure contracts are deployed

---

## 🎉 You're Ready!

Your iMonad platform is now fully operational with:
- ✅ Guest mode
- ✅ AI-powered app creation
- ✅ Token marketplace
- ✅ Dynamic app loading
- ✅ Bonding curve economics

**Good luck with your hackathon! 🚀**

