const { expect } = require("chai");
const { ethers } = require("hardhat");
const { describe, it, beforeEach } = require("mocha");

describe("Farming Contract", function () {
  let owner, user1;
  let farming, stakeToken, rewardToken;

  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    stakeToken = await ERC20Mock.deploy("TestToken", "TTK");
    await stakeToken.waitForDeployment();

    rewardToken = await ERC20Mock.deploy("RewardToken", "RTK");
    await rewardToken.waitForDeployment();

    await stakeToken.mint(user1.address, ethers.parseEther("2000"));
    await rewardToken.mint(owner.address, ethers.parseEther("2000"));

    const Farming = await ethers.getContractFactory("Farming");
    farming = await Farming.deploy(
      await stakeToken.getAddress(),
      await rewardToken.getAddress()
    );
    await farming.waitForDeployment();

    await rewardToken.transfer(await farming.getAddress(), ethers.parseEther("1000"));
  });

  it("should allow deposit and withdraw with rewards", async () => {
    const amount = ethers.parseEther("100");

    await stakeToken.connect(user1).approve(await farming.getAddress(), amount);
    await farming.connect(user1).deposit(amount);

    // Simulate 2 hours
    await ethers.provider.send("evm_increaseTime", [2 * 3600]);
    await ethers.provider.send("evm_mine");

    const stake = await farming.stakes(user1.address);
    expect(stake.amount).to.equal(amount);

    await farming.connect(user1).withdraw();

    const finalReward = await rewardToken.balanceOf(user1.address);
    expect(finalReward).to.be.closeTo(ethers.parseEther("200"), ethers.parseEther("1"));
  });

  it("should distribute rewards on multiple deposits", async () => {
    const initialAmount = ethers.parseEther("100");
    const additionalAmount = ethers.parseEther("50");

    // First deposit
    await stakeToken.connect(user1).approve(await farming.getAddress(), initialAmount + additionalAmount);
    await farming.connect(user1).deposit(initialAmount);

    // Wait 2 hours
    await ethers.provider.send("evm_increaseTime", [2 * 3600]);
    await ethers.provider.send("evm_mine");

    // Check rewards before second deposit
    const rewardsBefore = await rewardToken.balanceOf(user1.address);
    
    // Second deposit should trigger reward distribution
    await farming.connect(user1).deposit(additionalAmount);
    
    // Check rewards after second deposit
    const rewardsAfter = await rewardToken.balanceOf(user1.address);
    const rewardDiff = rewardsAfter - rewardsBefore;
    expect(rewardDiff).to.be.closeTo(
      ethers.parseEther("200"), // Expected reward for 100 TTK over 2 hours
      ethers.parseEther("1")
    );

    // Verify total staked amount
    const stake = await farming.stakes(user1.address);
    expect(stake.amount).to.equal(initialAmount + additionalAmount);
  });

  it("should fail if minimum stake period not reached", async () => {
    const amount = ethers.parseEther("100");

    await stakeToken.connect(user1).approve(await farming.getAddress(), amount);
    await farming.connect(user1).deposit(amount);

    await expect(farming.connect(user1).withdraw()).to.be.revertedWith("Stake too short");
  });

  it("should reject deposits exceeding max", async () => {
    const tooMuch = ethers.parseEther("1500");
    await stakeToken.connect(user1).approve(await farming.getAddress(), tooMuch);
    await expect(farming.connect(user1).deposit(tooMuch)).to.be.revertedWith("Exceeds max stake");
  });

  it("should not distribute rewards if minimum stake duration not met", async () => {
    const amount = ethers.parseEther("100");

    await stakeToken.connect(user1).approve(await farming.getAddress(), amount * 2n);
    await farming.connect(user1).deposit(amount);

    // Wait 30 minutes (less than MIN_STAKE_DURATION)
    await ethers.provider.send("evm_increaseTime", [1800]);
    await ethers.provider.send("evm_mine");

    // Second deposit
    await farming.connect(user1).deposit(amount);

    // Check no rewards were distributed
    const rewards = await rewardToken.balanceOf(user1.address);
    expect(rewards).to.equal(0);
  });

  it("should correctly handle multiple reward distributions", async () => {
    const amount = ethers.parseEther("100");

    // First deposit
    await stakeToken.connect(user1).approve(await farming.getAddress(), amount * 3n);
    await farming.connect(user1).deposit(amount);

    // Wait 2 hours
    await ethers.provider.send("evm_increaseTime", [2 * 3600]);
    await ethers.provider.send("evm_mine");

    // Second deposit (should trigger reward distribution)
    await farming.connect(user1).deposit(amount);
    let rewards1 = await rewardToken.balanceOf(user1.address);

    // Wait another 3 hours
    await ethers.provider.send("evm_increaseTime", [3 * 3600]);
    await ethers.provider.send("evm_mine");

    // Third deposit (should trigger reward distribution)
    await farming.connect(user1).deposit(amount);
    let rewards2 = await rewardToken.balanceOf(user1.address);

    // Total rewards should be for 2 hours of 100 TTK + 3 hours of 200 TTK
    expect(rewards2 - rewards1).to.be.closeTo(
      ethers.parseEther("600"), // Expected reward for 200 TTK over 3 hours
      ethers.parseEther("1")
    );
  });
});
