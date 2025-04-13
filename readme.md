# Farming Contract Documentation

## Contract Architecture

### Core Components

#### 1. Farming Contract (`Farming.sol`)
The main contract that handles staking and reward distribution.

```solidity
contract Farming {
    // Core State Variables
    IERC20 public immutable stakeToken;    // TTK token
    IERC20 public immutable rewardToken;    // RTK token

    // Constants
    uint256 public constant REWARD_PER_HOUR = 1 ether;    // 1 RTK per TTK per hour
    uint256 public constant MIN_STAKE_DURATION = 1 hours;  // Minimum staking period
    uint256 public constant MAX_STAKE_PER_USER = 1000 ether; // Maximum stake limit

    // Staking Data Structure
    struct StakeInfo {
        uint256 amount;      // Amount of TTK staked
        uint256 timestamp;   // Last stake/reward update time
    }

    // User Stakes Mapping
    mapping(address => StakeInfo) public stakes;
}
```

#### Key Functions:
1. `deposit(uint256 _amount)`
   - Accepts TTK tokens for staking
   - Updates rewards before new deposit
   - Enforces maximum stake limit

2. `withdraw()`
   - Withdraws staked TTK tokens
   - Distributes accumulated rewards
   - Enforces minimum stake duration

3. `calculateReward(address user)`
   - Calculates pending rewards
   - Based on stake amount and time

4. `_updateReward(address user)`
   - Internal function for reward distribution
   - Called before deposits

#### 2. Test Tokens (`ERC20Mock.sol`)
Simple ERC20 implementation for testing:
- TestToken (TTK)
- RewardToken (RTK)

## Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Git

### Project Setup

1. Clone and Install
```bash
# Clone repository
git clone <repository-url>
cd farming-contract

# Install dependencies
npm install
```

2. Configure Environment
```bash
# Create .env file
cp .env.example .env

# Add your private key and API key
TEST_PK=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Testing

Run Complete Test Suite
```bash
# Test farm contract
npx hardhat test
```

### Deployment

# Deploy contracts

Testnet Deployment
```bash
# Deploy the token contract to testnet
npx hardhat run scripts/deploy-token.js --network sonic_test

# Deploy the farm contract to testnet
npx hardhat run scripts/deploy-farm.js --network sonic_test

# Verify the token contract
npx hardhat run scripts/verify-token.js --network sonic_test

# Verify the farm contract
npx hardhat run scripts/verify-farm.js --network sonic_test
```

### Project Structure

```
farming-contract/
├── contracts/
│ ├── Farming.sol # Main contract
│ └── ERC20Mock.sol # Test tokens
├── scripts/
│ ├── deploy-farm.js # Farm Contract Deployment 
│ ├── deploy-token.js # Token Contract Deployment 
│ ├── verify-farm.js # Farm Contract Verification 
│ └── verify-token.js # Token Contract Verification
├── test/
│ └── Farming.test.js # Test suite
└── hardhat.config.js # Configuration
```

# Step-by-Step Guide

## 1. Token Deployment
```bash
npx hardhat run scripts/deploy-token.js --network sonic_test
```

- This will deploy both TTK and RTK tokens
- **Important:** Save both token addresses for later use

## 2. Token Verification
```bash
npx hardhat run scripts/verify-token.js --network sonic_test
```

- After verification, you can view your tokens at: https://testnet.sonicscan.org/address/TOKEN_CONTRACT_ADDRESS

## 3. Token Minting
- Navigate to your token contract on SonicScan
- Go to the "Contract" tab → "Write Contract"
- Find the mint function
- **Important Note on Amount Calculation:**
  - Use this formula: amount * 10^18
  - Example: For 10 tokens, input 10000000000000000000
  - This applies to both TTK and RTK tokens

## 4. Farm Contract Deployment
- Edit scripts/deploy-farm.js to set:
  - stakeTokenAddress = Your TTK address
  - rewardTokenAddress = Your RTK address
- Deploy the farm contract:
```bash
npx hardhat run scripts/deploy-farm.js --network sonic_test
```
- Save the farm contract address

## 5. Farm Contract Verification
- Update verification script with:
  - farmAddress = Your deployed farm contract address
  - stakeTokenAddress = Your TTK address
  - rewardTokenAddress = Your RTK address
- Run verification:
```bash
npx hardhat run scripts/verify-farm.js --network sonic_test
```
## 6. Testing
- Run the test suite to ensure everything works:
```bash
npx hardhat test
```

## 7. Interacting with the Contract
- Access your farm contract at: https://testnet.sonicscan.org/address/Farm_CONTRACT_ADDRESS
- Go to the "Contract" tab → "Write Contract" to:
  - Deposit tokens for staking
  - Withdraw tokens

## Important Notes
- Always double-check addresses before transactions
- Remember the 18 decimal places when setting token amounts
- Keep your private keys secure
