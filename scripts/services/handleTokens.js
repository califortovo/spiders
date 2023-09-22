const { ethers, network } = require("hardhat");
const fs = require("fs");
const log = require("./../utils/logger");

async function main() {
  // Проверку на дубликаты
  log.info("Start parsing tokens data...");
  await handleIERC20("tokens");
  await handleIERC20("stables");
  log.info("Done!");
}

async function handleIERC20(entity) {
  const filePath = `./data/${network.name}/${entity}.json`;
  const tokens = JSON.parse(fs.readFileSync(filePath), "utf8");
  for (const token of tokens) {
    if (token.address === undefined || token.address === "") continue;
    if (token.name !== undefined) continue;

    const tokenContract = await ethers.getContractAt(
      "IERC20Metadata",
      token.address
    );
    token.symbol = await tokenContract.symbol();
    token.name = await tokenContract.name();
    token.decimals = parseInt(await tokenContract.decimals());
  }
  fs.writeFileSync(filePath, JSON.stringify(tokens));
  log.info(`Successfuly handled ${entity}!`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
