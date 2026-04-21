import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import type { ToastState, ToastType } from './features/products/types'
import './styles.css'

export type AppOutletContext = {
  showToast: (message: string, type?: ToastType) => void
}

type Theme = 'dark' | 'light'

function App() {
  const [toast, setToast] = useState<ToastState>(null)
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme === 'light' ? 'light' : 'dark'
  })

  function showToast(message: string, type: ToastType = 'success') {
    setToast({ message, type })
  }

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

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
    <div className="app-shell">
      <Sidebar />

      <div className="app-content">
        <Header theme={theme} onToggleTheme={toggleTheme} />
        <main className="app-main">
          <Outlet context={{ showToast } satisfies AppOutletContext} />
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  )
}

export default App
