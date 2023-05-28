import { agent } from './veramo/setup.js' // use .js extension when importing local modules

async function main() {
  const input = process.argv[2];
  const identity = await agent.didManagerFind({
  	alias: input
  })
  await agent.didManagerAddService({
  	did: identity[0].did,
  	service: { id: identity[0].did, serviceEndpoint: 'https://sepolia.infura.io/v3/7f0fd16c271848ce9ff76beab5d51ecc', type: 'example' },
});
}
main().catch(console.log)
