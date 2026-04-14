import { Route, Routes } from 'react-router-dom'
import App from '../App'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<h1 style={{ color: 'red' }}>A ROTA NÃO FOI ENCONTRADA</h1>} />
    </Routes>
  )
}
