import { agent } from './veramo/setup.js' // use .js extension when importing local modules

async function main() {
  const input = process.argv[2];
  const identity = await agent.didManagerFind({
  	alias: input,
  })
  console.log(`Deleting identity`);
  console.log(identity);
  const did = identity[0].did;
  // Delete the identity.
  await agent.didManagerDelete({ did });
  console.log(`Identity deleted successfully`);
}

main().catch(console.log)
