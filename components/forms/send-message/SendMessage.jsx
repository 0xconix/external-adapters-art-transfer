import React from 'react'
import axios from 'axios'
import { ethers } from 'ethers'
import { useAuthContext } from '../../../context/auth/authContext'
import Promise from 'promise'

import ERC721 from '../../../artifacts/contracts/ERC721.json'
import Consumer from '../../../artifacts/contracts/Consumer.json'

import styles from './SendMessage.module.scss'
import { MinInt256 } from '@ethersproject/constants';




class SendMessage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      NFTs: [],
      isLoading: true,
      hashmap: undefined,
      totalNFT: 0,
      address: ""
    }
  }

  //authState, connectWallet = useAuthContext()


  getAddress() {
    let provider = new ethers.providers.Web3Provider(window.ethereum)
    let signer = provider.getSigner()
    signer.getAddress().then(succ => {
      this.setState({address: succ})
    }).catch(err => {
      console.log(err)
    })
    
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

  mint = (url) => {
    let provider = new ethers.providers.Web3Provider(window.ethereum)
    let signer = provider.getSigner()
    
    let contract = new ethers.Contract("0x778b17597413b9f346a18f695dfffa282aeeb0b3", Consumer, signer)
    contract.requestVolumeData(url).then((succ) => {
        console.log(succ)
      })
  }

  extractContractAndTokenID() {
    let totalNFT = 0
    const hashmap = {}
    let address = this.state.address//'0x47A9A6856661360855c92b57660981DEe591C2eC'
    //let address = '0x47A9A6856661360855c92b57660981DEe591C2eC'

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

  componentDidMount() {
    this.getAddress()
  }

  render() {
    const isLoading = this.state.isLoading

    if (isLoading) {
      const NFTs = []
      this.extractContractAndTokenID().then(() => {
        if (this.state.totalNFT === 0) {
          this.setState({ isLoading: false})
        }
        else{
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
        }
      })
      return <div>Loading...</div>
    } else {

      /*if (this.state.totalNFT === 0) {
        return <div className={styles.divNFT}>No NFT detected on Fuji Network 😞</div>
      }
      else*/{
        const NFTsDiv = this.state.NFTs.map((img) => {
          if (img.includes("cloudinary"))
            return <img style={{width:'auto', maxWidth: '400px', padding: '10px', alignSelf: 'flex-start'}} key={img} alt="" src={img} />
          else
            return <img onClick={() => this.mint(img)} style={{cursor: 'pointer', width:'auto', maxWidth: '400px', padding: '10px', alignSelf: 'flex-start'}} key={img} alt="" src={img} />
        })
        return <div className={styles.divNFT}>{NFTsDiv}</div>
      }
    }
  }
}

export default SendMessage
