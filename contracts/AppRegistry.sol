// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./AppToken.sol";

contract AppRegistry is Initializable, OwnableUpgradeable {
    struct AppInfo {
        string appId; // MongoDB ID
        string name;
        string category;
        address creator;
        address tokenAddress;
        uint256 createdAt;
        bool exists;
    }
    
    mapping(string => AppInfo) public apps; // appId => AppInfo
    mapping(address => string[]) public creatorApps; // creator => appIds
    string[] public allAppIds;
    
    address public monadToken;
    address public appTokenImplementation;
    
    event AppRegistered(string indexed appId, string name, address creator, address tokenAddress);
    event AppDownloaded(string indexed appId, address indexed user);
    
    function initialize(address _monadToken) public initializer {
        __Ownable_init(msg.sender);
        monadToken = _monadToken;
    }
    
    function setAppTokenImplementation(address _implementation) external onlyOwner {
        appTokenImplementation = _implementation;
    }
    
    // Register new app and deploy its token
    function registerApp(
        string memory appId,
        string memory name,
        string memory symbol,
        string memory category
    ) external returns (address tokenAddress) {
        require(!apps[appId].exists, "App already exists");
        require(bytes(appId).length > 0, "Invalid app ID");
        
        // Deploy new AppToken
        AppToken newToken = new AppToken();
        newToken.initialize(name, symbol, msg.sender, monadToken);
        
        tokenAddress = address(newToken);
        
        // Store app info
        apps[appId] = AppInfo({
            appId: appId,
            name: name,
            category: category,
            creator: msg.sender,
            tokenAddress: tokenAddress,
            createdAt: block.timestamp,
            exists: true
        });
        
        creatorApps[msg.sender].push(appId);
        allAppIds.push(appId);
        
        emit AppRegistered(appId, name, msg.sender, tokenAddress);
        
        return tokenAddress;
    }
    
    // Record app download and reward user
    function downloadApp(string memory appId) external {
        require(apps[appId].exists, "App does not exist");
        
        AppInfo memory app = apps[appId];
        AppToken appToken = AppToken(app.tokenAddress);
        
        // Reward user with app tokens
        appToken.rewardDownload(msg.sender);
        
        emit AppDownloaded(appId, msg.sender);
    }
    
    // Get app info
    function getApp(string memory appId) external view returns (AppInfo memory) {
        require(apps[appId].exists, "App does not exist");
        return apps[appId];
    }
    
    // Get all apps
    function getAllApps() external view returns (string[] memory) {
        return allAppIds;
    }
    
    // Get apps by creator
    function getCreatorApps(address creator) external view returns (string[] memory) {
        return creatorApps[creator];
    }
    
    // Get total app count
    function getAppCount() external view returns (uint256) {
        return allAppIds.length;
    }
}

