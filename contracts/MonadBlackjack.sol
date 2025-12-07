// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title MonadBlackjack
 * @dev On-chain Blackjack game with 0.5% house edge
 */
contract MonadBlackjack is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable 
{
    uint256 public minBet;
    uint256 public maxBet;
    uint256 public houseEdge; // Basis points (0.5% = 50)
    
    struct Game {
        address player;
        uint256 betAmount;
        uint8[] playerCards;
        uint8[] dealerCards;
        bool isActive;
        bool playerStand;
        uint256 randomSeed;
    }
    
    mapping(uint256 => Game) public games;
    uint256 public gameCounter;
    
    event GameStarted(uint256 indexed gameId, address indexed player, uint256 betAmount);
    event CardDealt(uint256 indexed gameId, address indexed recipient, uint8 card, bool isDealer);
    event GameEnded(uint256 indexed gameId, address indexed player, bool playerWon, uint256 payout);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 _minBet, uint256 _maxBet, uint256 _houseEdge) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        minBet = _minBet;
        maxBet = _maxBet;
        houseEdge = _houseEdge; // 50 = 0.5%
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function startGame() external payable nonReentrant returns (uint256) {
        require(msg.value >= minBet && msg.value <= maxBet, "Invalid bet amount");
        require(address(this).balance >= msg.value * 2, "Insufficient house balance");

        uint256 gameId = gameCounter++;
        Game storage game = games[gameId];
        
        game.player = msg.sender;
        game.betAmount = msg.value;
        game.isActive = true;
        game.randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            gameId
        )));

        // Deal initial cards
        game.playerCards.push(_drawCard(game.randomSeed, 0));
        game.dealerCards.push(_drawCard(game.randomSeed, 1));
        game.playerCards.push(_drawCard(game.randomSeed, 2));
        game.dealerCards.push(_drawCard(game.randomSeed, 3));

        emit GameStarted(gameId, msg.sender, msg.value);
        emit CardDealt(gameId, msg.sender, game.playerCards[0], false);
        emit CardDealt(gameId, msg.sender, game.playerCards[1], false);
        emit CardDealt(gameId, address(this), game.dealerCards[0], true);

        return gameId;
    }

    function hit(uint256 gameId) external nonReentrant {
        Game storage game = games[gameId];
        require(game.isActive, "Game not active");
        require(game.player == msg.sender, "Not your game");
        require(!game.playerStand, "Already standing");

        uint8 newCard = _drawCard(game.randomSeed, game.playerCards.length + game.dealerCards.length);
        game.playerCards.push(newCard);
        
        emit CardDealt(gameId, msg.sender, newCard, false);

        uint256 playerScore = _calculateScore(game.playerCards);
        if (playerScore > 21) {
            _endGame(gameId, false);
        }
    }

    function stand(uint256 gameId) external nonReentrant {
        Game storage game = games[gameId];
        require(game.isActive, "Game not active");
        require(game.player == msg.sender, "Not your game");
        require(!game.playerStand, "Already standing");

        game.playerStand = true;

        // Dealer draws until 17 or more
        while (_calculateScore(game.dealerCards) < 17) {
            uint8 newCard = _drawCard(game.randomSeed, game.playerCards.length + game.dealerCards.length);
            game.dealerCards.push(newCard);
            emit CardDealt(gameId, address(this), newCard, true);
        }

        uint256 playerScore = _calculateScore(game.playerCards);
        uint256 dealerScore = _calculateScore(game.dealerCards);

        bool playerWon = (dealerScore > 21) || (playerScore <= 21 && playerScore > dealerScore);
        _endGame(gameId, playerWon);
    }

    function _endGame(uint256 gameId, bool playerWon) internal {
        Game storage game = games[gameId];
        game.isActive = false;

        uint256 payout = 0;
        if (playerWon) {
            uint256 winnings = game.betAmount * 2;
            uint256 houseFee = (game.betAmount * houseEdge) / 10000;
            payout = winnings - houseFee;
            
            (bool success, ) = game.player.call{value: payout}("");
            require(success, "Payout failed");
        }

        emit GameEnded(gameId, game.player, playerWon, payout);
    }

    function _drawCard(uint256 seed, uint256 index) internal pure returns (uint8) {
        uint256 random = uint256(keccak256(abi.encodePacked(seed, index)));
        return uint8((random % 13) + 1); // 1-13 (Ace to King)
    }

    function _calculateScore(uint8[] memory cards) internal pure returns (uint256) {
        uint256 score = 0;
        uint256 aces = 0;

        for (uint256 i = 0; i < cards.length; i++) {
            uint8 card = cards[i];
            if (card == 1) {
                aces++;
                score += 11;
            } else if (card > 10) {
                score += 10;
            } else {
                score += card;
            }
        }

        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }

        return score;
    }

    function getGame(uint256 gameId) external view returns (
        address player,
        uint256 betAmount,
        uint8[] memory playerCards,
        uint8[] memory dealerCards,
        bool isActive,
        uint256 playerScore,
        uint256 dealerScore
    ) {
        Game storage game = games[gameId];
        return (
            game.player,
            game.betAmount,
            game.playerCards,
            game.dealerCards,
            game.isActive,
            _calculateScore(game.playerCards),
            _calculateScore(game.dealerCards)
        );
    }

    function fundHouse() external payable onlyOwner {}

    function withdrawHouse(uint256 amount) external onlyOwner {
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    receive() external payable {}
}

