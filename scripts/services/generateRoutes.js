const { ethers, network, getNamedAccounts } = require("hardhat");
const path = require("path");
const fs = require("fs");
const log = require("./../utils/logger");

async function main() {
  // Выводить аналитику по дексам и валютам для оптимизации и починки
  log.info(`Generating routes on ${network.name}...`);

  // Setup
  const owner = (await getNamedAccounts()).owner;
  const arb = await ethers.getContract("Arb", owner);

  const dataPath = `./data/${network.name}/`;

  const routers = JSON.parse(fs.readFileSync(dataPath + "dexes.json")).map(
    (dex) => dex.router
  );
  const baseAssets = JSON.parse(
    fs.readFileSync(dataPath + "baseAssets.json")
  ).map((asset) => asset.address);
  const stables = JSON.parse(fs.readFileSync(dataPath + `stables.json`)).map(
    (token) => token.address
  );
  let tokens = JSON.parse(fs.readFileSync(dataPath + `tokens.json`)).map(
    (token) => token.address
  );
  tokens = [...stables, ...tokens];

  // Обрабатывать токены тут

  // Generate
  const routes = [];
  for (let routerIdx1 = 0; routerIdx1 < routers.length; routerIdx1++) {
    for (let routerIdx2 = 0; routerIdx2 < routers.length; routerIdx2++) {
      for (let assetsIdx = 0; assetsIdx < baseAssets.length; assetsIdx++) {
        for (let tokensIdx = 0; tokensIdx < tokens.length; tokensIdx++) {
          if (
            routers[routerIdx1].toUpperCase() !=
              routers[routerIdx2].toUpperCase() &&
            baseAssets[assetsIdx].toUpperCase() !=
              tokens[tokensIdx].toUpperCase()
          ) {
            const route = [];
            route.push(routers[routerIdx1]);
            route.push(routers[routerIdx2]);
            route.push(baseAssets[assetsIdx]);
            route.push(tokens[tokensIdx]);

            try {
              // Учитывать реальные объемы сделок
              const value = ethers.parseUnits("196", 18);
              const amountBack = await arb.estDT(
                route[0],
                route[1],
                route[2],
                route[3],
                value
              );

              const isLiquidityEnough = amountBack > (value / 100n) * 90n;
              if (isLiquidityEnough) {
                routes.push(route);
              }
              // log.info(`Added: ${route}`);
            } catch (e) {
              const error = e.message.split("\n")[0];
              if (error !== "execution reverted") {
                log.error(`${error}`);
              }
            }
          }
        }
      }
    }
  }

  console.log(`\nFound ${routes.length} routes\n`);

  const dir = `./data/${network.name}/`;
  const filePath = path.join(dir, `routes.json`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.writeFile(filePath, JSON.stringify(routes, null, 2), (err) => {
    if (err) throw err;
    console.log(`The file ${filePath} has been saved!`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
