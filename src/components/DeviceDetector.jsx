import { useState, useEffect } from 'react'

function DeviceDetector() {
  const [device, setDevice] = useState('pc')

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone|opera mini|iemobile/i.test(userAgent)
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent)
    
    if (isTablet || isMobile) {
      setDevice('mobile')
    } else {
      setDevice('pc')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('deviceType', device)
  }, [device])

  return null
}

export default DeviceDetector