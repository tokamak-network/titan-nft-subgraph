const axios = require('axios')

const URL = 'https://thegraph.titan-goerli.tokamak.network:/subgraphs/name/usgeeus/titan-nft-subgraph'
const WSURL = 'wss://thegraph.titan-goerli.tokamak.network:/subgraphs/name/usgeeus/titan-nft-subgraph'
query = `
    {
    nfts (orderBy:tokenID){
        id
        tokenID
        owner
        ownerHistory
        attribute
    }
  }
`
axios.post(WSURL, { subscription: query}).then((result)=>{
    console.log(result.data.data)
})