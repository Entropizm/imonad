// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title MonadNFT
 * @dev Simple NFT minter for Monad testnet
 */
contract MonadNFT is 
    Initializable, 
    ERC721Upgradeable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    uint256 public tokenIdCounter;
    uint256 public mintPrice;
    string public baseTokenURI;
    
    event NFTMinted(address indexed minter, uint256 indexed tokenId);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name,
        string memory symbol,
        uint256 _mintPrice,
        string memory _baseTokenURI
    ) public initializer {
        __ERC721_init(name, symbol);
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        
        mintPrice = _mintPrice;
        baseTokenURI = _baseTokenURI;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function mint() external payable {
        require(msg.value >= mintPrice, "Insufficient payment");
        
        uint256 tokenId = tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        
        emit NFTMinted(msg.sender, tokenId);
        
        // Refund excess
        if (msg.value > mintPrice) {
            (bool success, ) = msg.sender.call{value: msg.value - mintPrice}("");
            require(success, "Refund failed");
        }
    }

    function mintBatch(uint256 quantity) external payable {
        require(quantity > 0 && quantity <= 10, "Invalid quantity");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = tokenIdCounter++;
            _safeMint(msg.sender, tokenId);
            emit NFTMinted(msg.sender, tokenId);
        }
        
        // Refund excess
        if (msg.value > mintPrice * quantity) {
            (bool success, ) = msg.sender.call{value: msg.value - (mintPrice * quantity)}("");
            require(success, "Refund failed");
        }
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseURI(string memory _baseTokenURI) external onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}

