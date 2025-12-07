// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title MonadSlots
 * @dev Slot machine game with 0.5% house edge
 */
contract MonadSlots is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable 
{
    uint256 public minBet;
    uint256 public maxBet;
    uint256 public houseEdge; // Basis points
    
    // Multipliers for different combinations
    uint256 public jackpotMultiplier; // 3 same symbols
    uint256 public doubleMultiplier; // 2 same symbols
    
    event SpinResult(
        address indexed player,
        uint256 betAmount,
        uint8[3] symbols,
        uint256 payout,
        bool jackpot
    );
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        uint256 _minBet,
        uint256 _maxBet,
        uint256 _houseEdge,
        uint256 _jackpotMultiplier,
        uint256 _doubleMultiplier
    ) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        minBet = _minBet;
        maxBet = _maxBet;
        houseEdge = _houseEdge; // 50 = 0.5%
        jackpotMultiplier = _jackpotMultiplier; // e.g., 100 for 100x
        doubleMultiplier = _doubleMultiplier; // e.g., 2 for 2x
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function spin() external payable nonReentrant {
        require(msg.value >= minBet && msg.value <= maxBet, "Invalid bet amount");

        // Generate 3 random symbols (0-6 = seven different symbols)
        uint8[3] memory symbols;
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            address(this).balance
        )));

        symbols[0] = uint8(uint256(keccak256(abi.encodePacked(randomSeed, uint256(0)))) % 7);
        symbols[1] = uint8(uint256(keccak256(abi.encodePacked(randomSeed, uint256(1)))) % 7);
        symbols[2] = uint8(uint256(keccak256(abi.encodePacked(randomSeed, uint256(2)))) % 7);

        uint256 payout = 0;
        bool jackpot = false;

        // Check for jackpot (all 3 symbols match)
        if (symbols[0] == symbols[1] && symbols[1] == symbols[2]) {
            payout = (msg.value * jackpotMultiplier);
            jackpot = true;
        }
        // Check for double (2 symbols match)
        else if (symbols[0] == symbols[1] || symbols[1] == symbols[2] || symbols[0] == symbols[2]) {
            payout = (msg.value * doubleMultiplier);
        }

        // Apply house edge
        if (payout > 0) {
            uint256 houseFee = (payout * houseEdge) / 10000;
            payout -= houseFee;
            
            require(address(this).balance >= payout, "Insufficient house balance");
            (bool success, ) = msg.sender.call{value: payout}("");
            require(success, "Payout failed");
        }

        emit SpinResult(msg.sender, msg.value, symbols, payout, jackpot);
    }

    function setMultipliers(uint256 _jackpot, uint256 _double) external onlyOwner {
        jackpotMultiplier = _jackpot;
        doubleMultiplier = _double;
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

