import hre from 'hardhat';

async function main() {
  const cruzzer = await hre.ethers.deployContract('Cruzzer');
  await cruzzer.waitForDeployment();

  const cruzzerAddr = await cruzzer.getAddress();

  console.log('Cruzzer deployed at: ' + cruzzerAddr);
}

main()
  .then(() => process.exit(1))
  .catch(console.error);
