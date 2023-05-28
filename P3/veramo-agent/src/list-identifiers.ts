import { agent } from './veramo/setup.js' // use .js extension when importing local modules

async function main() {
  const identifiers = await agent.didManagerFind()

  console.log(`There are ${identifiers.length} identifiers`)
  console.log('..................')

  if (identifiers.length > 0) {
    identifiers.map((id) => {
      console.log("Alias: " + id.alias)
      console.log("DID: " + id.did)
      console.log("Provider: " + id.provider)
      console.log(id.keys)
      console.log(id.services)
      console.log('..................')
    })
  }
}

main().catch(console.log)
