const { deployments, getNamedAccounts, network } = require("hardhat");

module.exports = async (hre) => {
  const { owner } = await getNamedAccounts();

  await deployments.deploy("Arb", {
    from: owner,
    args: [],
    log: true,
  });
};

module.exports.tags = ["all", "arb"];
