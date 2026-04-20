import { useEffect, useState } from 'react'
import Header from './components/Header'
import ProductPage from './components/ProductPage'
import Toast from './components/Toast'
import type { ToastState, ToastType } from './features/products/types'
import './styles.css'

function App() {
  const [toast, setToast] = useState<ToastState>(null)

  function showToast(message: string, type: ToastType = 'success') {
    setToast({ message, type })
  }

  useEffect(() => {
    if (!toast) {
      return
    }

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 3500)

    return () => window.clearTimeout(timer)
  }, [toast])

  return (
    <>
      <Header />
      <ProductPage showToast={showToast} />
      <Toast toast={toast} />
    </>
  )
}

export default App
