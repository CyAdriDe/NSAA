import { agent } from './veramo/setup.js' // use .js extension when importing local modules

async function main() {
  const identity = await agent.didManagerCreate()
  console.log(`New identity created`)
  console.log(identity)
}

main().catch(console.log)
