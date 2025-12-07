// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title MonadGuestbook
 * @dev On-chain guestbook for messages
 */
contract MonadGuestbook is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    struct Message {
        address author;
        string content;
        uint256 timestamp;
        uint256 likes;
    }
    
    Message[] public messages;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    
    event MessagePosted(address indexed author, uint256 indexed messageId, string content);
    event MessageLiked(uint256 indexed messageId, address indexed liker);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function postMessage(string calldata content) external {
        require(bytes(content).length > 0 && bytes(content).length <= 280, "Invalid message length");
        
        messages.push(Message({
            author: msg.sender,
            content: content,
            timestamp: block.timestamp,
            likes: 0
        }));
        
        emit MessagePosted(msg.sender, messages.length - 1, content);
    }

    function likeMessage(uint256 messageId) external {
        require(messageId < messages.length, "Message does not exist");
        require(!hasLiked[messageId][msg.sender], "Already liked");
        
        messages[messageId].likes++;
        hasLiked[messageId][msg.sender] = true;
        
        emit MessageLiked(messageId, msg.sender);
    }

    function getMessages(uint256 offset, uint256 limit) external view returns (Message[] memory) {
        require(offset < messages.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > messages.length) {
            end = messages.length;
        }
        
        uint256 size = end - offset;
        Message[] memory result = new Message[](size);
        
        for (uint256 i = 0; i < size; i++) {
            result[i] = messages[messages.length - 1 - (offset + i)]; // Reverse order (newest first)
        }
        
        return result;
    }

    function getMessageCount() external view returns (uint256) {
        return messages.length;
    }

    function deleteMessage(uint256 messageId) external {
        require(messageId < messages.length, "Message does not exist");
        require(
            messages[messageId].author == msg.sender || msg.sender == owner(),
            "Not authorized"
        );
        
        // Mark as deleted by clearing content
        messages[messageId].content = "[deleted]";
    }
}

