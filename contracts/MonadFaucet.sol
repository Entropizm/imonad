// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MonadFaucet
 * @dev Testnet faucet for MON tokens and ERC20 tokens
 */
contract MonadFaucet is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable 
{
    uint256 public dripAmount;
    uint256 public cooldownTime;
    mapping(address => uint256) public lastDripTime;
    
    event Drip(address indexed recipient, uint256 amount);
    event TokenDrip(address indexed token, address indexed recipient, uint256 amount);
    event DripAmountUpdated(uint256 newAmount);
    event CooldownUpdated(uint256 newCooldown);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 _dripAmount, uint256 _cooldownTime) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        dripAmount = _dripAmount;
        cooldownTime = _cooldownTime;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function requestDrip() external nonReentrant {
        require(
            block.timestamp >= lastDripTime[msg.sender] + cooldownTime,
            "Cooldown period not elapsed"
        );
        require(address(this).balance >= dripAmount, "Faucet empty");

        lastDripTime[msg.sender] = block.timestamp;
        
        (bool success, ) = msg.sender.call{value: dripAmount}("");
        require(success, "Transfer failed");
        
        emit Drip(msg.sender, dripAmount);
    }

    function requestTokenDrip(address tokenAddress, uint256 amount) external nonReentrant {
        require(
            block.timestamp >= lastDripTime[msg.sender] + cooldownTime,
            "Cooldown period not elapsed"
        );

        IERC20 token = IERC20(tokenAddress);
        require(token.balanceOf(address(this)) >= amount, "Insufficient token balance");

        lastDripTime[msg.sender] = block.timestamp;
        require(token.transfer(msg.sender, amount), "Token transfer failed");
        
        emit TokenDrip(tokenAddress, msg.sender, amount);
    }

    function setDripAmount(uint256 _dripAmount) external onlyOwner {
        dripAmount = _dripAmount;
        emit DripAmountUpdated(_dripAmount);
    }

    function setCooldownTime(uint256 _cooldownTime) external onlyOwner {
        cooldownTime = _cooldownTime;
        emit CooldownUpdated(_cooldownTime);
    }

    function withdraw(uint256 amount) external onlyOwner {
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    function withdrawToken(address tokenAddress, uint256 amount) external onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        require(token.transfer(owner(), amount), "Token withdrawal failed");
    }

    receive() external payable {}
}

