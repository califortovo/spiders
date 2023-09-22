const { expect } = require("chai");
const { ethers, getNamedAccounts } = require("hardhat");
const { getTestTokens } = require("./../scripts/services/getTestTokens");
const fs = require("fs");
const { assert } = require("console");

describe("Arb", function () {
  this.timeout(60000);

  let arb,
    wETH,
    wETHaddress,
    uniswap0,
    uniswap1,
    owner,
    routers,
    dualTradeRoutes;

  beforeEach(async () => {
    routers = JSON.parse(fs.readFileSync("./data/bsc/dexes.json")).map(
      (dex) => dex.router
    );
    dualTradeRoutes = JSON.parse(fs.readFileSync("./data/bsc/routes.json"));

    arb = await ethers.deployContract("Arb");
    owner = (await getNamedAccounts()).owner;
    uniswap0 = await ethers.getContractAt("IUniswapV2Router", routers[0]);
    uniswap1 = await ethers.getContractAt("IUniswapV2Router", routers[1]);
    wETHaddress = await uniswap0.WETH();
    wETH = await ethers.getContractAt("WETH9", wETHaddress);

    // Get wETH
    const value = ethers.parseEther("100", 18);
    const wrapTx = await wETH.deposit({
      value: value,
      from: owner,
    });
    wrapTx.wait();
    const transferTx = await wETH.transfer(arb.target, value);
    transferTx.wait();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await arb.owner()).to.equal(owner);
    });
    it("Withdraw tokens", async function () {
      const withdrawTx = await arb.recoverToken(wETHaddress);
      withdrawTx.wait();
      expect(await wETH.balanceOf(arb.target)).to.be.equal(0n);
    });
  });

  // describe("Swap", function () {
  //   it("Should swap WETH for another token", async function () {
  //     const route = dualTradeRoutes[0];
  //     const swapTx = await arb.swap(
  //       route[0],
  //       route[2],
  //       route[3],
  //       await wETH.balanceOf(arb.target)
  //     );
  //     const newToken = await ethers.getContractAt("IERC20", route[3]);
  //     expect(await newToken.balanceOf(arb.address)).to.be.above(0);
  //   });
  // });

  describe("dT should revert if unprofitable", function () {
    it("Should perform the dT operation", async function () {
      const route = dualTradeRoutes[0];
      await arb.dT(
        route[0],
        route[1],
        route[2],
        route[3],
        await wETH.balanceOf(arb.target),
        0n
      );
      expect(await wETH.balanceOf(arb.target)).to.be.revertedWith(":(");
    });
  });

  describe("tT should revert if unprofitable", function () {
    it("Should perform the dT operation", async function () {
      const route = dualTradeRoutes[0];
      await arb.dT(
        route[0],
        route[1],
        route[2],
        route[3],
        await wETH.balanceOf(arb.target),
        0n
      );
      expect(await wETH.balanceOf(arb.target)).to.be.revertedWith(":(");
    });
  });
});
