import { Routes, Route } from 'react-router-dom'
import App from '../App'
import LoginPage from '../LoginPage'

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<App />} /> 
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    )
}
