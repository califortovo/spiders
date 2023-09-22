async function main() {
  await withdraw("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c");
}

async function withdraw(tokenAddress) {
  const arb = await ethers.getContract("Arb");
  const withdrawTx = await arb.recoverToken(tokenAddress);
  withdrawTx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
