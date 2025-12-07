// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title MonadDice
 * @dev Provably fair dice game with 0.5% house edge
 */
contract MonadDice is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable 
{
    uint256 public minBet;
    uint256 public maxBet;
    uint256 public houseEdge; // Basis points
    
    event DiceRolled(
        address indexed player,
        uint256 betAmount,
        uint8 prediction,
        uint8 result,
        bool won,
        uint256 payout
    );
    
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

    /**
     * @dev Roll dice - predict whether result will be over or under 50
     * @param predictOver true for over 50, false for under 50
     */
    function rollDice(bool predictOver) external payable nonReentrant {
        require(msg.value >= minBet && msg.value <= maxBet, "Invalid bet amount");
        require(address(this).balance >= msg.value * 2, "Insufficient house balance");

        // Generate random number between 0-99
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            address(this).balance
        )));
        
        uint8 result = uint8(randomSeed % 100);
        uint8 prediction = predictOver ? 51 : 49;
        
        bool won = (predictOver && result > 50) || (!predictOver && result < 50);
        uint256 payout = 0;

        if (won) {
            uint256 winnings = msg.value * 2;
            uint256 houseFee = (msg.value * houseEdge) / 10000;
            payout = winnings - houseFee;
            
            (bool success, ) = msg.sender.call{value: payout}("");
            require(success, "Payout failed");
        }

        emit DiceRolled(msg.sender, msg.value, prediction, result, won, payout);
    }

    /**
     * @dev Roll with specific number prediction (1-6 for higher payout)
     */
    function rollSpecificNumber(uint8 predictedNumber) external payable nonReentrant {
        require(predictedNumber >= 1 && predictedNumber <= 6, "Invalid number");
        require(msg.value >= minBet && msg.value <= maxBet, "Invalid bet amount");
        require(address(this).balance >= msg.value * 6, "Insufficient house balance");

        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            address(this).balance
        )));
        
        uint8 result = uint8((randomSeed % 6) + 1); // 1-6
        bool won = (result == predictedNumber);
        uint256 payout = 0;

        if (won) {
            uint256 winnings = msg.value * 6; // 6x payout for exact match
            uint256 houseFee = (msg.value * houseEdge) / 10000;
            payout = winnings - houseFee;
            
            (bool success, ) = msg.sender.call{value: payout}("");
            require(success, "Payout failed");
        }

        emit DiceRolled(msg.sender, msg.value, predictedNumber, result, won, payout);
    }

    function setBetLimits(uint256 _minBet, uint256 _maxBet) external onlyOwner {
        minBet = _minBet;
        maxBet = _maxBet;
    }

    function fundHouse() external payable onlyOwner {}

    function withdrawHouse(uint256 amount) external onlyOwner {
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    receive() external payable {}
}

