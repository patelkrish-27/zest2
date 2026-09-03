import { useState, useCallback } from "react"

export function useToggle(initialValue = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue((v) => !v)
  }, [])

  const set = useCallback((v: boolean) => setValue(v), [])

  return [value, toggle, set]
}

export default useToggle
