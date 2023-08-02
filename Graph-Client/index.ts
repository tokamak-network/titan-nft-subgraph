import { execute, getBuiltGraphSDK, GetNFTsDocument } from './.graphclient';
const { GetNFTs } = getBuiltGraphSDK();

async function main() {
    // const data = await GetNFTs();
    // console.log(data);
    // console.log(data[Symbol.asyncIterator]);
    // for await (const item of data) {
    //     console.log(item);
    //     console.log(item.nfts);
    // }
    execute(GetNFTsDocument, "").then(async (data) => {
        // for await (const item of data) {
        //         console.log(item.nfts);
        // }
        console.log(data);
    });
}

main().catch(console.error);