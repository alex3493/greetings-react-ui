import ProgressBar from 'react-bootstrap/ProgressBar'
import { useBusyIndicator } from '@/hooks'

function LoadingProgressBar() {
  const { loadingCount, sendingCount } = useBusyIndicator()

  const styles = {
    progressBar: {
      borderRadius: 0,
      height: 5
    }
  }

  return (
    <>
      {loadingCount() > 0 && (
        <ProgressBar
          variant="success"
          now={100 / loadingCount()}
          style={styles.progressBar}
        />
      )}
      {sendingCount() > 0 && (
        <ProgressBar
          variant="danger"
          now={100 / sendingCount()}
          style={styles.progressBar}
        />
      )}
    </>
  )
}

export default LoadingProgressBar
