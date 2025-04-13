// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address sender, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Farming {
    IERC20 public immutable stakeToken;
    IERC20 public immutable rewardToken;

    uint256 public constant REWARD_PER_HOUR = 1 ether; // 1 RTK per TTK per hour
    uint256 public constant MIN_STAKE_DURATION = 1 hours;
    uint256 public constant MAX_STAKE_PER_USER = 1000 ether;

    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => StakeInfo) public stakes;

    constructor(address _stakeToken, address _rewardToken) {
        stakeToken = IERC20(_stakeToken);
        rewardToken = IERC20(_rewardToken);
    }

    function deposit(uint256 _amount) external {
        require(_amount > 0, "Amount must be > 0");

        StakeInfo storage stake = stakes[msg.sender];
        require(stake.amount + _amount <= MAX_STAKE_PER_USER, "Exceeds max stake");

        _updateReward(msg.sender);

        stakeToken.transferFrom(msg.sender, address(this), _amount);
        stake.amount += _amount;
        stake.timestamp = block.timestamp;
    }

    function withdraw() external {
        StakeInfo storage stake = stakes[msg.sender];
        require(stake.amount > 0, "No stake");

        uint256 stakedTime = block.timestamp - stake.timestamp;
        require(stakedTime >= MIN_STAKE_DURATION, "Stake too short");

        uint256 reward = calculateReward(msg.sender);
        uint256 amount = stake.amount;

        stake.amount = 0;
        stake.timestamp = 0;

        stakeToken.transfer(msg.sender, amount);
        rewardToken.transfer(msg.sender, reward);
    }

    function calculateReward(address user) public view returns (uint256) {
        StakeInfo storage stake = stakes[user];
        if (stake.amount == 0) return 0;

        uint256 timeDiff = block.timestamp - stake.timestamp;
        if (timeDiff < MIN_STAKE_DURATION) return 0;

        return (stake.amount * REWARD_PER_HOUR * timeDiff) / 1 hours / 1 ether;
    }

    function _updateReward(address user) internal {
        StakeInfo storage stake = stakes[user];
        if (stake.amount > 0) {
            uint256 reward = calculateReward(user);
            if (reward > 0) {
                rewardToken.transfer(user, reward);
                // Update timestamp after distributing reward
                stake.timestamp = block.timestamp;
            }
        }
    }
}
