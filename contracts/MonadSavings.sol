// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title MonadSavings
 * @dev Simple savings account with simulated interest
 */
contract MonadSavings is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable 
{
    struct Account {
        uint256 balance;
        uint256 lastInterestUpdate;
        uint256 totalInterestEarned;
    }
    
    mapping(address => Account) public accounts;
    uint256 public annualInterestRate; // Basis points (5% = 500)
    uint256 public minDeposit;
    uint256 public lockPeriod; // Seconds
    
    event Deposited(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);
    event InterestAccrued(address indexed account, uint256 interest);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        uint256 _annualInterestRate,
        uint256 _minDeposit,
        uint256 _lockPeriod
    ) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        annualInterestRate = _annualInterestRate; // 500 = 5%
        minDeposit = _minDeposit;
        lockPeriod = _lockPeriod;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function deposit() external payable nonReentrant {
        require(msg.value >= minDeposit, "Below minimum deposit");
        
        Account storage account = accounts[msg.sender];
        
        // Accrue interest before deposit
        if (account.balance > 0) {
            _accrueInterest(msg.sender);
        } else {
            account.lastInterestUpdate = block.timestamp;
        }
        
        account.balance += msg.value;
        
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external nonReentrant {
        Account storage account = accounts[msg.sender];
        require(account.balance > 0, "No balance");
        require(
            block.timestamp >= account.lastInterestUpdate + lockPeriod,
            "Lock period not elapsed"
        );
        
        // Accrue interest before withdrawal
        _accrueInterest(msg.sender);
        
        require(amount <= account.balance, "Insufficient balance");
        
        account.balance -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawn(msg.sender, amount);
    }

    function withdrawAll() external nonReentrant {
        Account storage account = accounts[msg.sender];
        require(account.balance > 0, "No balance");
        require(
            block.timestamp >= account.lastInterestUpdate + lockPeriod,
            "Lock period not elapsed"
        );
        
        // Accrue interest before withdrawal
        _accrueInterest(msg.sender);
        
        uint256 amount = account.balance;
        account.balance = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawn(msg.sender, amount);
    }

    function accrueInterest() external {
        _accrueInterest(msg.sender);
    }

    function _accrueInterest(address user) internal {
        Account storage account = accounts[user];
        
        if (account.balance == 0) return;
        
        uint256 timeElapsed = block.timestamp - account.lastInterestUpdate;
        if (timeElapsed == 0) return;
        
        // Calculate interest: (balance * rate * time) / (10000 * 365 days)
        uint256 interest = (account.balance * annualInterestRate * timeElapsed) / (10000 * 365 days);
        
        account.balance += interest;
        account.totalInterestEarned += interest;
        account.lastInterestUpdate = block.timestamp;
        
        emit InterestAccrued(user, interest);
    }

    function getAccountInfo(address user) external view returns (
        uint256 balance,
        uint256 pendingInterest,
        uint256 totalInterestEarned,
        uint256 timeUntilUnlock
    ) {
        Account storage account = accounts[user];
        
        balance = account.balance;
        totalInterestEarned = account.totalInterestEarned;
        
        // Calculate pending interest
        if (account.balance > 0) {
            uint256 timeElapsed = block.timestamp - account.lastInterestUpdate;
            pendingInterest = (account.balance * annualInterestRate * timeElapsed) / (10000 * 365 days);
        }
        
        // Calculate time until unlock
        uint256 unlockTime = account.lastInterestUpdate + lockPeriod;
        timeUntilUnlock = block.timestamp >= unlockTime ? 0 : unlockTime - block.timestamp;
        
        return (balance, pendingInterest, totalInterestEarned, timeUntilUnlock);
    }

    function setInterestRate(uint256 _annualInterestRate) external onlyOwner {
        require(_annualInterestRate <= 5000, "Rate too high"); // Max 50%
        annualInterestRate = _annualInterestRate;
    }

    function setLockPeriod(uint256 _lockPeriod) external onlyOwner {
        lockPeriod = _lockPeriod;
    }

    function fundContract() external payable onlyOwner {}
}

