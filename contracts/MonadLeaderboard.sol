// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title MonadLeaderboard
 * @dev On-chain leaderboard for high scores
 */
contract MonadLeaderboard is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    struct Score {
        address player;
        uint256 score;
        uint256 timestamp;
        string username;
    }
    
    Score[] public leaderboard;
    uint256 public maxLeaderboardSize;
    
    mapping(address => string) public usernames;
    mapping(address => bool) public authorizedGames;
    
    event ScoreSubmitted(address indexed player, uint256 score, string username);
    event UsernameSet(address indexed player, string username);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 _maxLeaderboardSize) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        
        maxLeaderboardSize = _maxLeaderboardSize;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function setUsername(string calldata _username) external {
        require(bytes(_username).length > 0 && bytes(_username).length <= 20, "Invalid username length");
        usernames[msg.sender] = _username;
        emit UsernameSet(msg.sender, _username);
    }

    function submitScore(uint256 score) external {
        _submitScore(msg.sender, score);
    }

    function submitScoreForPlayer(address player, uint256 score) external {
        require(authorizedGames[msg.sender], "Not authorized");
        _submitScore(player, score);
    }

    function _submitScore(address player, uint256 score) internal {
        string memory username = bytes(usernames[player]).length > 0 
            ? usernames[player] 
            : "Anonymous";
        
        Score memory newScore = Score({
            player: player,
            score: score,
            timestamp: block.timestamp,
            username: username
        });
        
        // If leaderboard is not full, add the score
        if (leaderboard.length < maxLeaderboardSize) {
            leaderboard.push(newScore);
            _sortLeaderboard();
        } else {
            // Only add if score is higher than the lowest score
            if (score > leaderboard[leaderboard.length - 1].score) {
                leaderboard[leaderboard.length - 1] = newScore;
                _sortLeaderboard();
            }
        }
        
        emit ScoreSubmitted(player, score, username);
    }

    function _sortLeaderboard() internal {
        // Simple bubble sort (sufficient for small leaderboards)
        for (uint256 i = 0; i < leaderboard.length; i++) {
            for (uint256 j = i + 1; j < leaderboard.length; j++) {
                if (leaderboard[j].score > leaderboard[i].score) {
                    Score memory temp = leaderboard[i];
                    leaderboard[i] = leaderboard[j];
                    leaderboard[j] = temp;
                }
            }
        }
    }

    function getLeaderboard() external view returns (Score[] memory) {
        return leaderboard;
    }

    function getTopN(uint256 n) external view returns (Score[] memory) {
        uint256 size = n < leaderboard.length ? n : leaderboard.length;
        Score[] memory topScores = new Score[](size);
        
        for (uint256 i = 0; i < size; i++) {
            topScores[i] = leaderboard[i];
        }
        
        return topScores;
    }

    function authorizeGame(address game, bool authorized) external onlyOwner {
        authorizedGames[game] = authorized;
    }

    function clearLeaderboard() external onlyOwner {
        delete leaderboard;
    }
}

