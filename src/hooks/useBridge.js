import { useState, useCallback, useEffect } from 'react';
import appBridge from '../common/bridge/appBridge'

const useBridge = (callback) => {
  const [ bridge, setBridge ] = useState(null)

  const memoizedCallback = useCallback(
    (xgimi) => {
      if (typeof callback === 'function') {
        callback(xgimi)
      }
    },
    [callback],
  )

  useEffect(() => {
    appBridge.init((xgimi) => {
      memoizedCallback(xgimi)
      setBridge(xgimi)
    })
  }, [])

  return bridge;
}

export default useBridge;
