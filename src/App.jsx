import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import BrandDashboard from './pages/BrandDashboard'
import Influencers from './pages/Influencers'
import Campaigns from './pages/Campaigns'
import Pipeline from './pages/Pipeline'
import AdminDashboard from './pages/AdminDashboard'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['BRAND_MANAGER']}>
                  <BrandDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/influencers"
              element={
                <ProtectedRoute allowedRoles={['BRAND_MANAGER']}>
                  <Influencers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/campaigns"
              element={
                <ProtectedRoute allowedRoles={['BRAND_MANAGER']}>
                  <Campaigns />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pipeline"
              element={
                <ProtectedRoute allowedRoles={['BRAND_MANAGER']}>
                  <Pipeline />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App