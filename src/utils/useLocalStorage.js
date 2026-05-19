import { useState, useEffect } from 'react'

export function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const s = window.localStorage.getItem(key)
      return s ? JSON.parse(s) : init
    } catch { return init }
  })
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(val)) } catch {}
  }, [key, val])
  return [val, setVal]
}
