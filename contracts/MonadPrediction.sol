// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title MonadPrediction
 * @dev Simple prediction market for betting on outcomes
 */
contract MonadPrediction is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable 
{
    enum MarketState { Open, Closed, Resolved }
    
    struct Market {
        string question;
        MarketState state;
        uint256 totalYes;
        uint256 totalNo;
        bool outcome; // true = yes, false = no
        uint256 deadline;
        uint256 createdAt;
    }
    
    struct Bet {
        uint256 amount;
        bool prediction;
        bool claimed;
    }
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Bet)) public bets;
    uint256 public marketCounter;
    uint256 public platformFee; // Basis points
    
    event MarketCreated(uint256 indexed marketId, string question, uint256 deadline);
    event BetPlaced(uint256 indexed marketId, address indexed bettor, uint256 amount, bool prediction);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed winner, uint256 amount);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 _platformFee) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        platformFee = _platformFee; // 50 = 0.5%
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function createMarket(string calldata question, uint256 durationInDays) external onlyOwner returns (uint256) {
        require(bytes(question).length > 0, "Empty question");
        require(durationInDays > 0 && durationInDays <= 365, "Invalid duration");
        
        uint256 marketId = marketCounter++;
        uint256 deadline = block.timestamp + (durationInDays * 1 days);
        
        markets[marketId] = Market({
            question: question,
            state: MarketState.Open,
            totalYes: 0,
            totalNo: 0,
            outcome: false,
            deadline: deadline,
            createdAt: block.timestamp
        });
        
        emit MarketCreated(marketId, question, deadline);
        return marketId;
    }

    function placeBet(uint256 marketId, bool prediction) external payable nonReentrant {
        Market storage market = markets[marketId];
        require(market.state == MarketState.Open, "Market not open");
        require(block.timestamp < market.deadline, "Market expired");
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(bets[marketId][msg.sender].amount == 0, "Already bet on this market");
        
        bets[marketId][msg.sender] = Bet({
            amount: msg.value,
            prediction: prediction,
            claimed: false
        });
        
        if (prediction) {
            market.totalYes += msg.value;
        } else {
            market.totalNo += msg.value;
        }
        
        emit BetPlaced(marketId, msg.sender, msg.value, prediction);
    }

    function resolveMarket(uint256 marketId, bool outcome) external onlyOwner {
        Market storage market = markets[marketId];
        require(market.state == MarketState.Open, "Market already resolved");
        require(block.timestamp >= market.deadline, "Market not yet expired");
        
        market.state = MarketState.Resolved;
        market.outcome = outcome;
        
        emit MarketResolved(marketId, outcome);
    }

    function claimWinnings(uint256 marketId) external nonReentrant {
        Market storage market = markets[marketId];
        require(market.state == MarketState.Resolved, "Market not resolved");
        
        Bet storage bet = bets[marketId][msg.sender];
        require(bet.amount > 0, "No bet placed");
        require(!bet.claimed, "Already claimed");
        require(bet.prediction == market.outcome, "Bet lost");
        
        bet.claimed = true;
        
        uint256 totalPool = market.totalYes + market.totalNo;
        uint256 winningPool = market.outcome ? market.totalYes : market.totalNo;
        
        // Calculate winnings proportional to bet size
        uint256 winnings = (bet.amount * totalPool) / winningPool;
        uint256 fee = (winnings * platformFee) / 10000;
        uint256 payout = winnings - fee;
        
        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Payout failed");
        
        if (fee > 0) {
            (bool feeSuccess, ) = owner().call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        emit WinningsClaimed(marketId, msg.sender, payout);
    }

    function getMarketOdds(uint256 marketId) external view returns (uint256 yesOdds, uint256 noOdds) {
        Market storage market = markets[marketId];
        uint256 total = market.totalYes + market.totalNo;
        
        if (total == 0) {
            return (5000, 5000); // 50/50
        }
        
        yesOdds = (market.totalYes * 10000) / total;
        noOdds = (market.totalNo * 10000) / total;
    }

    function setPlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 1000, "Fee too high");
        platformFee = _platformFee;
    }
}

