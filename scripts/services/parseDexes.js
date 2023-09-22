const axios = require("axios");
const fs = require("fs");
const path = require("path");
const log = require("./../utils/logger");
const { productionChains } = require("./../../hardhat.helper");

async function main() {
  // Парсить в один файл с роутерами, чтобы удобнее потом добавлять
  // Правильнее будет сортировать не по tvl, а по объему торгов

  const data = (
    await axios.get("https://defillama-datasets.llama.fi/lite/protocols2?b=2")
  ).data;
  const protocols = data.protocols;

  const uniswapV2ForksByChain = {};
  for (const protocol of protocols) {
    if (protocol.forkedFrom !== undefined && protocol.forkedFrom.length !== 0) {
      if (protocol.forkedFrom.includes("Uniswap V2")) {
        for (const chain of protocol.chains) {
          const dex = {};
          dex.name = protocol.name;
          dex.url = protocol.url;
          dex.tvl = protocol.chainTvls[chain].tvl;

          const tvlMinAmount = 10000;
          if (dex.tvl > tvlMinAmount)
            if (uniswapV2ForksByChain[chain] !== undefined) {
              uniswapV2ForksByChain[chain].push(dex);
            } else {
              uniswapV2ForksByChain[chain] = [dex];
            }
        }
      }
    }
  }

  for (const chain in uniswapV2ForksByChain) {
    if (!productionChains.includes(chain.toLowerCase())) continue;

    uniswapV2ForksByChain[chain].sort((a, b) => b.tvl - a.tvl);

    const dir = `./data/${chain.toLowerCase()}/`;
    const filePath = path.join(dir, `dexes-uniswap-v2-forks.json`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.writeFile(
      filePath,
      JSON.stringify(uniswapV2ForksByChain[chain], null, 2),
      (err) => {
        if (err) throw err;
        log.info(`${chain} Uniswap V2 ${filePath} has been saved!`);
      }
    );
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
