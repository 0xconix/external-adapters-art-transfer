import React from 'react'
import axios from 'axios'
import { ethers, utils } from 'ethers'

import { useAvaxboxContext } from '../../../context/avaxbox/avaxboxContext'


import ERC721 from '../../../artifacts/contracts/ERC721.json'

import styles from './SendMessage.module.scss'





class SendMessage extends React.Component{

  state = {
    name: "hello",
    NFTs: [],
    isLoading: true,
    hashmap: undefined,
    totalNFT: 0
  }

  sleep = (milliseconds) => { //api
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

  extractURL = (contract, index) => {
    let provider = new ethers.providers.Web3Provider(window.ethereum)
    let signer = provider.getSigner()
    contract = new ethers.Contract(contract, ERC721, signer)
      return new Promise(resolve => {
        contract.tokenURI(index).then(succ => {
          resolve(succ)
        })
      })
  }

  callback_Original(ABI, signer) {
    let NFTs = []
    return new Promise((resolve, reject) => {

      Object.entries(this.state.hashmap).forEach(([key, value]) => {
        const contract = new ethers.Contract(key, ABI, signer)
        value.forEach(i => {
          contract.tokenURI(i).then(succ => {
            NFTs.push(succ)
            //console.log("MDR", NFTs)
          }).catch(err => {
            console.log("error:", err)
          })
        });
      })
      resolve(NFTs)
    });
    }

  extractContractAndTokenID = () => {

    //let NFTs_ = []


    let totalNFT = 0
    const hashmap = {} 
    //const address = "0x6bF3017Af8A89334da69FE6111cCF09F60f75759"
    const address = "0x47A9A6856661360855c92b57660981DEe591C2eC"
    //const address = "0x33969689cDF151A087C9763d1A0410ba3C43a1C0"
    return new Promise((resolve, reject) => {
    axios.get("https://api-testnet.snowtrace.io/api?module=account&action=tokennfttx&address="+address+"&startblock=0&endblock=999999999&sort=asc")
        .then(function(result) { 
        result.data.result.map(x => {
            const contractAddress = x["contractAddress"].toLowerCase()
            if (hashmap[contractAddress] === undefined){
              hashmap[contractAddress] = new Set()
            }
            if (x["from"].toLowerCase() === address.toLowerCase() && x["from"].toLowerCase() !== x["to"].toLowerCase()){
                hashmap[contractAddress].delete(x["tokenID"])
                totalNFT -= 1
              }
              else {
                hashmap[contractAddress].add(x["tokenID"])
                totalNFT += 1
              }
          })
      }).catch((err) => {
        console.log("error", err)
      })
      .then(() => {
        this.setState({hashmap: hashmap, totalNFT: totalNFT})

        resolve()
      })
        /*Object.entries(hashmap).forEach(([key, value]) => {
        const contractAddress = key
        // Initialise the contract instance
        this.callback_Original(contractAddress, ERC721, signer, value)
            //if (NFTs.length === value.length)
            //  resolve()
        })
      }).then(() => {
        this.setState({isLoading: false})
        });*/
      });

  } 

  /*componentDidMount =  () => {
    //0xec41e87ffeab7e69100c56a35f7ec23f3b998c7c: Set(3) {"0", "1", "2"}
    let NFTs = []
    this.extractContractAndTokenID().then(() => {
      console.log("MDR", this.state.hashmap)
      Object.entries(this.state.hashmap).forEach(([key, value]) => {
          value.forEach(i => {
            this.extractURL(key, i).then(url => {
            //console.log(url)
              NFTs.push(url)  
              console.log(NFTs)
            })
          })
        if (NFTs.length >= 3){
          this.setState({isLoading: false, NFTs: NFTs})
        }
      })
    })
    
  }*/


  render(){

    //this.getNFT()
    const isLoading = this.state.isLoading;

    if (isLoading) {
      this.sleep(250).then(r => {
      let NFTs = []
      this.extractContractAndTokenID().then(() => {
        Object.entries(this.state.hashmap).forEach(([key, value]) => {
            value.forEach(i => {
              this.extractURL(key, i).then(url => {
              //console.log(url)
                NFTs.push(url)  
                if (NFTs.length >= this.state.totalNFT) {
                  this.setState({isLoading: false, NFTs: NFTs})
                }
              })
            })
        })
      })})
      return <div>Loading...</div>;
    }
    else{

    const NFTsDiv = this.state.NFTs.map((img) => {
        return <img src= {img}/>
    })
      
    return (
    <div>{NFTsDiv}</div>
    )
    }
  }
}

export default SendMessage;