const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HODL Jar System", function () {
  let mockMoreProtocol;
  let mockYieldVault;
  let hodlJar;
  let owner;
  let fosterHome;
  let donor;
  let addr3;
  
  const LOCK_PERIOD_YEARS = 2;
  const KID_AGE = 10;
  const DONATION_AMOUNT = ethers.utils.parseEther("1000"); // 1000 FLOW

  beforeEach(async function () {
    // Get signers
    [owner, fosterHome, donor, addr3] = await ethers.getSigners();
    
    // Deploy a mock yield vault
    const MockYieldVault = await ethers.getContractFactory("MockYieldVault");
    mockYieldVault = await MockYieldVault.deploy();
    
    // Deploy HODL Jar with lower gas limits
    const HODLJar = await ethers.getContractFactory("HODLJar");
    hodlJar = await HODLJar.deploy(
      mockYieldVault.address,
      "Test Kid",
      "Test Story",
      KID_AGE,
      fosterHome.address,
      LOCK_PERIOD_YEARS,
      { gasLimit: 3000000 } // Limit the gas for deployment
    );
  });

  describe("Basic Functionality", function () {
    it("Should create a HODL jar correctly", async function () {
      const kidData = await hodlJar.kid();
      
      expect(kidData.name).to.equal("Test Kid");
      expect(kidData.story).to.equal("Test Story");
      expect(kidData.age).to.equal(KID_AGE);
      expect(kidData.fosterHome).to.equal(fosterHome.address);
      expect(kidData.donor).to.equal(ethers.constants.AddressZero);
      expect(kidData.lockPeriodInYears).to.equal(LOCK_PERIOD_YEARS);
    });

    it("Should accept a donation", async function () {
      await expect(
        hodlJar.connect(donor).donate({ value: DONATION_AMOUNT })
      ).to.emit(hodlJar, "DonationReceived")
        .withArgs(donor.address, DONATION_AMOUNT);
      
      const kidData = await hodlJar.kid();
      expect(kidData.donor).to.equal(donor.address);
      expect(kidData.initialDeposit).to.equal(DONATION_AMOUNT);
    });
    
    it("Should reject donation with incorrect amount", async function () {
      await expect(
        hodlJar.connect(donor).donate({ value: ethers.utils.parseEther("500") })
      ).to.be.revertedWith("Donation amount must be 1000 FLOW");
    });
  });

  describe("Yield Management", function () {
    beforeEach(async function () {
      // Donate to the jar
      await hodlJar.connect(donor).donate({ value: DONATION_AMOUNT });
      
      // Simulate yield generation in the mock vault
      await mockYieldVault.addYield(hodlJar.address, DONATION_AMOUNT.div(10));
    });
    
    it("Should show yield correctly", async function () {
      const yield = await hodlJar.getCurrentYield();
      expect(yield).to.be.closeTo(DONATION_AMOUNT.div(10), 100);
    });
    
    it("Should allow foster home to withdraw yield", async function () {
      // Check foster home balance before withdrawal
      const balanceBefore = await ethers.provider.getBalance(fosterHome.address);
      
      // Withdraw yield
      await hodlJar.connect(fosterHome).withdrawYield();
      
      // Check foster home balance after withdrawal
      const balanceAfter = await ethers.provider.getBalance(fosterHome.address);
      
      // The difference should be approximately the yield amount (minus gas costs)
      const balanceDiff = balanceAfter.sub(balanceBefore);
      expect(balanceDiff).to.be.gt(0);
    });
    
    it("Should not allow foster home to withdraw principal before lock period", async function () {
      await expect(
        hodlJar.connect(fosterHome).withdrawPrincipal()
      ).to.be.revertedWith("Lock period has not passed yet");
    });
  });

  describe("Principal Withdrawal", function () {
    beforeEach(async function () {
      // Donate to the jar
      await hodlJar.connect(donor).donate({ value: DONATION_AMOUNT });
    });
    
    it("Should allow principal withdrawal after lock period", async function () {
      // Fast forward time to after lock period
      const lockPeriodInSeconds = LOCK_PERIOD_YEARS * 365 * 24 * 60 * 60;
      await ethers.provider.send("evm_increaseTime", [lockPeriodInSeconds + 1]);
      await ethers.provider.send("evm_mine");
      
      // Check foster home balance before withdrawal
      const balanceBefore = await ethers.provider.getBalance(fosterHome.address);
      
      // Withdraw principal
      await hodlJar.connect(fosterHome).withdrawPrincipal();
      
      // Check foster home balance after withdrawal
      const balanceAfter = await ethers.provider.getBalance(fosterHome.address);
      
      // The difference should be approximately the principal amount (minus gas costs)
      const balanceDiff = balanceAfter.sub(balanceBefore);
      expect(balanceDiff).to.be.gt(DONATION_AMOUNT.mul(95).div(100));
    });
    
    it("Should not allow non-foster home to withdraw principal", async function () {
      // Fast forward time to after lock period
      const lockPeriodInSeconds = LOCK_PERIOD_YEARS * 365 * 24 * 60 * 60;
      await ethers.provider.send("evm_increaseTime", [lockPeriodInSeconds + 1]);
      await ethers.provider.send("evm_mine");
      
      // Try to withdraw as someone else
      await expect(
        hodlJar.connect(addr3).withdrawPrincipal()
      ).to.be.revertedWith("Only foster home can withdraw principal");
    });
  });
});