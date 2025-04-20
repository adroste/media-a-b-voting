import { useEffect, useState } from 'react'

export function useObjectUrl(file?: File) {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setUrl(url)

    return () => {
      URL.revokeObjectURL(url)
      setUrl(undefined)
    }
  }, [file])

  return url
}
