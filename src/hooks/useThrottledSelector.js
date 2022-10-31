import BigNumber from 'bignumber.js'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import throttle from 'lodash.throttle'

function useThrottledSelector(selectorFn, initialValue, time = 2000) {
  const [data, setState] = useState(initialValue)

  const selectorData = useSelector(selectorFn)

  const throttled = useRef(
    throttle(function (value) {
      setState(value)
    }, time)
  )

  useEffect(() => throttled.current(selectorData), [selectorData])

  return data
}

export default useThrottledSelector
