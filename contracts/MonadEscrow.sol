// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title MonadEscrow
 * @dev Simple escrow service for secure transactions
 */
contract MonadEscrow is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable 
{
    enum EscrowState { Created, Funded, Completed, Refunded, Disputed }
    
    struct Escrow {
        address buyer;
        address seller;
        uint256 amount;
        EscrowState state;
        uint256 createdAt;
        string description;
    }
    
    mapping(uint256 => Escrow) public escrows;
    uint256 public escrowCounter;
    uint256 public serviceFee; // Basis points (0.5% = 50)
    
    event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount);
    event EscrowFunded(uint256 indexed escrowId);
    event EscrowCompleted(uint256 indexed escrowId);
    event EscrowRefunded(uint256 indexed escrowId);
    event EscrowDisputed(uint256 indexed escrowId);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 _serviceFee) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        serviceFee = _serviceFee; // 50 = 0.5%
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function createEscrow(address seller, string calldata description) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Amount must be greater than 0");
        require(seller != address(0) && seller != msg.sender, "Invalid seller");
        
        uint256 escrowId = escrowCounter++;
        
        escrows[escrowId] = Escrow({
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            state: EscrowState.Funded,
            createdAt: block.timestamp,
            description: description
        });
        
        emit EscrowCreated(escrowId, msg.sender, seller, msg.value);
        emit EscrowFunded(escrowId);
        
        return escrowId;
    }

    function completeEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.state == EscrowState.Funded, "Escrow not funded");
        require(msg.sender == escrow.buyer, "Only buyer can complete");
        
        escrow.state = EscrowState.Completed;
        
        uint256 fee = (escrow.amount * serviceFee) / 10000;
        uint256 sellerAmount = escrow.amount - fee;
        
        (bool success, ) = escrow.seller.call{value: sellerAmount}("");
        require(success, "Transfer to seller failed");
        
        if (fee > 0) {
            (bool feeSuccess, ) = owner().call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        emit EscrowCompleted(escrowId);
    }

    function refundEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.state == EscrowState.Funded, "Escrow not funded");
        require(msg.sender == escrow.seller, "Only seller can refund");
        
        escrow.state = EscrowState.Refunded;
        
        (bool success, ) = escrow.buyer.call{value: escrow.amount}("");
        require(success, "Refund failed");
        
        emit EscrowRefunded(escrowId);
    }

    function disputeEscrow(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.state == EscrowState.Funded, "Escrow not funded");
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "Not a party to this escrow"
        );
        
        escrow.state = EscrowState.Disputed;
        emit EscrowDisputed(escrowId);
    }

    function resolveDispute(uint256 escrowId, bool favorBuyer) external onlyOwner nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.state == EscrowState.Disputed, "Escrow not disputed");
        
        address recipient = favorBuyer ? escrow.buyer : escrow.seller;
        escrow.state = favorBuyer ? EscrowState.Refunded : EscrowState.Completed;
        
        (bool success, ) = recipient.call{value: escrow.amount}("");
        require(success, "Resolution transfer failed");
    }

    function setServiceFee(uint256 _serviceFee) external onlyOwner {
        require(_serviceFee <= 1000, "Fee too high"); // Max 10%
        serviceFee = _serviceFee;
    }
}

