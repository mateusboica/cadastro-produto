import { Route, Routes } from 'react-router-dom'
import App from '../App'
import RegisterPage from '../pages/RegisterPage'

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<h1 style={{ color: 'black', backgroundColor: 'white' }}>TESTE FUNCIONANDO</h1>} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  )
}
