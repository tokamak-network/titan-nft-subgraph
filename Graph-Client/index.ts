import { getBuiltGraphSDK } from './.graphclient';
const { GetNFTs } = getBuiltGraphSDK();

async function main() {
    const data = await GetNFTs();
    console.log(data);
    console.log(data[Symbol.asyncIterator]);
    for await (const item of data) {
        console.log(item.nfts);
    }
}

main().catch(console.error);