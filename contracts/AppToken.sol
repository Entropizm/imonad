// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract AppToken is Initializable, ERC20Upgradeable, OwnableUpgradeable {
    address public creator;
    address public monadToken; // MONAD token address for liquidity
    uint256 public totalBoosters;
    uint256 public liquidityPool; // MONAD tokens in pool
    uint256 public constant CREATOR_FEE = 10; // 10% fee
    uint256 public downloads;
    
    event BoosterPurchased(address indexed buyer, uint256 monadAmount, uint256 tokensReceived);
    event TokensSwapped(address indexed user, uint256 appTokens, uint256 monadReceived);
    event AppDownloaded(address indexed user, uint256 rewardAmount);
    
    function initialize(
        string memory name,
        string memory symbol,
        address _creator,
        address _monadToken
    ) public initializer {
        __ERC20_init(name, symbol);
        __Ownable_init(_creator);
        creator = _creator;
        monadToken = _monadToken;
        totalBoosters = 1; // Start with 1 to avoid division by zero
        downloads = 0;
        
        // Mint initial supply to creator (10% of 1M tokens)
        _mint(creator, 100000 * 10**18);
    }
    
    // Bonding curve: price = liquidityPool / (totalSupply + 1)
    function getTokenPrice() public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0 || liquidityPool == 0) return 1e15; // Base price: 0.001 MONAD
        return (liquidityPool * 1e18) / supply;
    }
    
    // Calculate app value: (totalSupply * boosters) / 1e18
    function getAppValue() public view returns (uint256) {
        return (totalSupply() * totalBoosters) / 1e18;
    }
    
    // Buy booster with MONAD tokens
    function buyBooster(uint256 monadAmount) external {
        require(monadAmount > 0, "Amount must be > 0");
        
        // Transfer MONAD from buyer
        IERC20(monadToken).transferFrom(msg.sender, address(this), monadAmount);
        
        // Add to liquidity pool
        liquidityPool += monadAmount;
        
        // Increase boosters
        totalBoosters += 1;
        
        // Calculate tokens to mint based on bonding curve
        uint256 tokensToMint = (monadAmount * 1e18) / getTokenPrice();
        
        // Calculate creator fee (10%)
        uint256 creatorTokens = (tokensToMint * CREATOR_FEE) / 100;
        uint256 buyerTokens = tokensToMint - creatorTokens;
        
        // Mint tokens
        _mint(creator, creatorTokens);
        _mint(msg.sender, buyerTokens);
        
        emit BoosterPurchased(msg.sender, monadAmount, buyerTokens);
    }
    
    // Swap app tokens for MONAD
    function swapForMonad(uint256 appTokenAmount) external {
        require(appTokenAmount > 0, "Amount must be > 0");
        require(balanceOf(msg.sender) >= appTokenAmount, "Insufficient balance");
        
        // Calculate MONAD to receive
        uint256 monadToReceive = (appTokenAmount * getTokenPrice()) / 1e18;
        require(monadToReceive <= liquidityPool, "Insufficient liquidity");
        
        // Burn app tokens
        _burn(msg.sender, appTokenAmount);
        
        // Reduce liquidity pool
        liquidityPool -= monadToReceive;
        
        // Transfer MONAD to user
        IERC20(monadToken).transfer(msg.sender, monadToReceive);
        
        emit TokensSwapped(msg.sender, appTokenAmount, monadToReceive);
    }
    
    // Reward user for downloading app (called by registry)
    function rewardDownload(address user) external onlyOwner {
        downloads += 1;
        
        // Mint reward tokens (0.1% of total supply or 100 tokens minimum)
        uint256 rewardAmount = totalSupply() / 1000;
        if (rewardAmount < 100 * 1e18) {
            rewardAmount = 100 * 1e18;
        }
        
        _mint(user, rewardAmount);
        
        emit AppDownloaded(user, rewardAmount);
    }
    
    // Get statistics
    function getStats() external view returns (
        uint256 price,
        uint256 supply,
        uint256 boosters,
        uint256 liquidity,
        uint256 appValue,
        uint256 downloadCount
    ) {
        return (
            getTokenPrice(),
            totalSupply(),
            totalBoosters,
            liquidityPool,
            getAppValue(),
            downloads
        );
    }
}

