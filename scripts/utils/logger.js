const pino = require("pino");
const { network } = require("hardhat");
const transport = pino.transport({
  targets: [
    // {
    //   target: "pino/file",
    //   options: {
    //     destination: `./data/logs/${network.name}+дата.log`,
    //     colorize: true,
    //     ignore: "pid,hostname,time",
    //   },
    // },
    {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname,time",
      },
    },
  ],
});
module.exports = pino({}, transport);
