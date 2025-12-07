// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TokenDisperser
 * @dev Send tokens to multiple addresses in one transaction
 */
contract TokenDisperser is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable 
{
    uint256 public feePercentage; // Basis points (0.5% = 50)
    address public feeCollector;
    
    event NativeDispersed(address indexed sender, uint256 totalAmount, uint256 recipientCount);
    event TokenDispersed(address indexed token, address indexed sender, uint256 totalAmount, uint256 recipientCount);
    event FeeCollected(address indexed collector, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 _feePercentage, address _feeCollector) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        feePercentage = _feePercentage; // 50 = 0.5%
        feeCollector = _feeCollector;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function disperseNative(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external payable nonReentrant {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length > 0, "Empty recipients");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        uint256 fee = (totalAmount * feePercentage) / 10000;
        require(msg.value >= totalAmount + fee, "Insufficient funds");

        // Collect fee
        if (fee > 0) {
            (bool feeSuccess, ) = feeCollector.call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
            emit FeeCollected(feeCollector, fee);
        }

        // Disperse to recipients
        for (uint256 i = 0; i < recipients.length; i++) {
            (bool success, ) = recipients[i].call{value: amounts[i]}("");
            require(success, "Transfer failed");
        }

        emit NativeDispersed(msg.sender, totalAmount, recipients.length);

        // Refund excess
        if (msg.value > totalAmount + fee) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - totalAmount - fee}("");
            require(refundSuccess, "Refund failed");
        }
    }

    function disperseToken(
        address tokenAddress,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length > 0, "Empty recipients");

        IERC20 token = IERC20(tokenAddress);
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        uint256 fee = (totalAmount * feePercentage) / 10000;
        uint256 totalRequired = totalAmount + fee;

        require(
            token.transferFrom(msg.sender, address(this), totalRequired),
            "Transfer to contract failed"
        );

        // Collect fee
        if (fee > 0) {
            require(token.transfer(feeCollector, fee), "Fee transfer failed");
            emit FeeCollected(feeCollector, fee);
        }

        // Disperse to recipients
        for (uint256 i = 0; i < recipients.length; i++) {
            require(token.transfer(recipients[i], amounts[i]), "Token transfer failed");
        }

        emit TokenDispersed(tokenAddress, msg.sender, totalAmount, recipients.length);
    }

    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee too high"); // Max 10%
        feePercentage = _feePercentage;
    }

    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "Invalid address");
        feeCollector = _feeCollector;
    }
}

