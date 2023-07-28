import { createClient } from 'graphql-sse';
 
const client = createClient({
  // singleConnection: true, preferred for HTTP/1 enabled servers and subscription heavy apps
  url: 'https://thegraph.titan-goerli.tokamak.network:/subgraphs/name/tokamak/titan-nft-subgraph',
});

async function main() {
    console.log("what");
    // query
    (async () => {
        const query = client.iterate({
        query: '{ nfts { tokenID } }',
        });
        console.log(query);
    
        const { value } = await query.next();
        console.log(value);
        //expect(value).toEqual({ hello: 'world' });
    })();
   
  // subscription
  (async () => {
    const subscription = client.iterate({
      query: 'subscription { nfts { tokenID } }',
    });
    console.log(subscription);
   
    for await (const event of subscription) {
      //expect(event).toEqual({ greetings: 'Hi' });
      console.log(event);
      // complete a running subscription by breaking the iterator loop
      break;
    }
  })();
}

main().catch(console.error);