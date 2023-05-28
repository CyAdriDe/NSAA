import { agent } from './veramo/setup.js' // use .js extension when importing local modules

async function main() {
  const input = process.argv[2];
  const identity = await agent.didManagerCreate({
  	alias: input
  })
  console.log(`New identity created`)
  console.log(identity)
}

main().catch(console.log)
