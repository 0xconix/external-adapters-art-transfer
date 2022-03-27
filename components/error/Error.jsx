import styles from './Error.module.scss'

export default function Error() {
  const renderErrorActions = () => {
    return [
      'Click on "Connect Wallet"',
      'Check that you have MetaMask set to an Avalanche FUJI network',
      'Refresh the page',
    ].map((action) => (
      <li key={action} className={styles.errorAction}>
        {action}
      </li>
    ))
  }

  return (
    <div className={styles.error}>
      <h1 className={styles.errorHeading}>
        Something went wrong. Perform the following actions:
      </h1>

      <ul className={styles.errorActions}>{renderErrorActions()}</ul>
    </div>
  )
}
