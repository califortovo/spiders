const { network, ethers, getNamedAccounts } = require("hardhat");
const log = require("./utils/logger");
const fs = require("fs");

let arb, owner, balances, gasCosts;
let config, routes, baseAssets;

async function main() {
  await setup();
  await printBalances();

  await benchmark();

  while (true) {
    await lookForDualTrade();
  }

  // https://owlracle.info/ftm - gas API
}

// Вынести в отдельный модуль
async function setup() {
  const dataPath = `./data/${network.name}/`;
  routes = JSON.parse(fs.readFileSync(dataPath + "routes.json"));
  baseAssets = JSON.parse(fs.readFileSync(dataPath + "baseAssets.json"));
  gasCosts = baseAssets.reduce((result, asset) => {
    result[asset.address] = BigInt(asset.dualTradeCost);
    return result;
  }, {});

  owner = (await getNamedAccounts()).owner;
  arb = await ethers.getContract("Arb", owner);
  arbAddress = arb.target;
  log.info(`Loaded config for ${network.name} network`);
  log.info(`Owner: ${owner}`);
  log.info(`Found ${routes.length} routes`);
  log.info(`Contract: ${arbAddress}`);
  log.info(`╰◠◡◠◡◠╯ Setup is Done ! ╰◠◡◠◡◠╯\n`);
}

async function printBalances() {
  log.info(`Balances:`);
  balances = {};
  for (let i = 0; i < baseAssets.length; i++) {
    const asset = baseAssets[i];
    const tokenContract = await ethers.getContractAt("IERC20", asset.address);
    const balance = await tokenContract.balanceOf(arbAddress);
    balances[asset.address] = {
      symbol: asset.symbol,
      balance,
    };
    log.info(`${asset.symbol}: ${getWithDecimal(balance, asset.decimals)}`);
  }
}

function getWithDecimal(amount, decimal) {
  return (Number(amount) / 10 ** decimal).toFixed(decimal);
}

async function lookForDualTrade() {
  for (const route of routes) {
    try {
      const gasCost = gasCosts[route[2]];
      const token0Balance = balances[route[2]].balance;
      const token1Balance =
        balances[route[3]] !== undefined ? balances[route[3]].balance : 0n; // Может лучше сделать Если не baseAsset то 0

      const amountBack = await arb.estDT(
        route[0],
        route[1],
        route[2],
        route[3],
        token0Balance
      );

      const profit = amountBack - token0Balance - gasCost;
      // log.info(getWithDecimal(profit, 18));
      if (profit > 0) {
        trade(route, token0Balance, token1Balance);
      }
    } catch (e) {
      log.error(e.message.split("\n")[0]);
    }
  }
}

async function trade(route, token0Balance, token1Balance) {
  const tx = await arb.dT(
    route[0],
    route[1],
    route[2],
    route[3],
    token0Balance,
    token1Balance
  );
  tx.wait();
  await printBalances();
}

async function benchmark() {
  const start = Date.now();
  await lookForDualTrade();
  const end = Date.now();
  log.info(
    `Benchmark: ${routes.length} for ${end - start} ms (avg: ${
      (end - start) / routes.length
    })`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
