import Link from 'next/link'

import Button from '../button/Button'

import { ethers } from 'ethers'

import { useAuthContext } from '../../context/auth/authContext'
import { ACCOUNTS_FETCHED } from '../../context/auth/authReducer'
import compressAddress from '../../utilities/compressAddress'


import safemint from '../../artifacts/contracts/safeMint.json'

import styles from './Header.module.scss'

function mint(addr){
  const provider = new ethers.providers.Web3Provider(window.ethereum)

  const signer = provider.getSigner()

  let contract = new ethers.Contract("0xb016D218c071FA94559d0976FC62F16efEcA6C99", safemint, signer)
  contract.safeMint(addr).then((succ) => {
      console.log(succ)
    })
}

export default function Header() {
  const { authState, connectWallet } = useAuthContext()

  const isConnected = [ACCOUNTS_FETCHED].includes(authState.status)
  const connectText = authState.isLoading
    ? 'Connecting'
    : isConnected
    ? compressAddress(authState.data[0])
    : 'Connect Wallet'

  const getNFT = isConnected ? 'Mint 1 NFT 🔺' : '🔺'

  return (
    <div className={styles.header}>
      <Link href="/">
        <a className={styles.headerTitle}>Avart Transfert</a>
      </Link>

      <div className={styles.headerButtons}>
      <a onClick={() => mint(authState.data[0])}className={styles.headerLink}>{getNFT}</a>

        <Button
          extraClassnames={styles.headerButton}
          handleClick={connectWallet}
          isActive={isConnected}
        >
          {connectText}
        </Button>
      </div>
    </div>
  )
}
