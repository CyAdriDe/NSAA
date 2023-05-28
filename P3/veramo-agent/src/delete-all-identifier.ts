import { agent } from './veramo/setup.js' // use .js extension when importing local modules

async function main() {
  const identity = await agent.didManagerFind();
  console.log(`Deleting identity`);
  console.log(identity);
  for (let i = 0; i < identity.length; i++){
  	let did = identity[i].did;
  	await agent.didManagerDelete({ did });
  }
  console.log(`Identities deleted successfully`);
}

main().catch(console.log)
