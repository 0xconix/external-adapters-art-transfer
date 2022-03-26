import React from 'react'
import axios from 'axios'
import { ethers } from 'ethers'
import Promise from 'promise'

import ERC721 from '../../../artifacts/contracts/ERC721.json'

import styles from './SendMessage.module.scss'


class SendMessage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      NFTs: [],
      isLoading: true,
      hashmap: undefined,
      totalNFT: 0,
    }
  }

  extractURL(contract, index) {
    let provider = new ethers.providers.Web3Provider(window.ethereum)
    let signer = provider.getSigner()
    contract = new ethers.Contract(contract, ERC721, signer)
    return new Promise((resolve) => {
      contract.tokenURI(index).then((succ) => {
        resolve(succ)
      })
    })
  }

  callback_Original(ABI, signer) {
    const NFTs = []
    return new Promise((resolve) => {
      Object.entries(this.state.hashmap).forEach(([key, value]) => {
        const contract = new ethers.Contract(key, ABI, signer)
        value.forEach((i) => {
          contract
            .tokenURI(i)
            .then((succ) => {
              NFTs.push(succ)
            })
            .catch((err) => {
              console.log('error:', err)
            })
        })
      })
      resolve(NFTs)
    })
  }

  extractContractAndTokenID() {
    let totalNFT = 0
    const hashmap = {}
    const address = '0x47A9A6856661360855c92b57660981DEe591C2eC'
    return new Promise((resolve) => {
      axios
        .get(
          'https://api-testnet.snowtrace.io/api?module=account&action=tokennfttx&address=' +
            address +
            '&startblock=0&endblock=999999999&sort=asc'
        )
        .then(function (result) {
          result.data.result.map((x) => {
            const contractAddress = x['contractAddress'].toLowerCase()
            if (hashmap[contractAddress] === undefined) {
              /*eslint no-undef: "error"*/
              hashmap[contractAddress] = new Set()
            }
            if (
              x['from'].toLowerCase() === address.toLowerCase() &&
              x['from'].toLowerCase() !== x['to'].toLowerCase()
            ) {
              hashmap[contractAddress].delete(x['tokenID'])
              totalNFT -= 1
            } else {
              hashmap[contractAddress].add(x['tokenID'])
              totalNFT += 1
            }
          })
        })
        .catch((err) => {
          console.log('error', err)
        })
        .then(() => {
          this.setState({ hashmap: hashmap, totalNFT: totalNFT })
          resolve()
        })
    })
  }

  render() {
    const isLoading = this.state.isLoading

    if (isLoading) {
      const NFTs = []
      this.extractContractAndTokenID().then(() => {
        Object.entries(this.state.hashmap).forEach(([key, value]) => {
          value.forEach((i) => {
            this.extractURL(key, i).then((url) => {
              NFTs.push(url)
              if (NFTs.length >= this.state.totalNFT) {
                this.setState({ isLoading: false, NFTs: NFTs })
              }
            })
          })
        })
      })
      return <div>Loading...</div>
    } else {
      const NFTsDiv = this.state.NFTs.map((img) => {
        return <img  style={{padding: '10px', alignSelf: 'flex-start'}} key={img} alt="" src={img} />
      })
      return <div className={styles.divNFT}>{NFTsDiv}</div>
    }
  }
}

export default SendMessage
