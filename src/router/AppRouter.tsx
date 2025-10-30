import { Route, BrowserRouter, Routes } from "react-router-dom"
import Login from "../pages/Login"
import Register from "../pages/Register"
import FaceCapture from "../pages/FaceCapture"
import HomePage from "../pages/HomePage"
import Profile from "../pages/Profile"
import DisciplineDetail from "../pages/DisciplineDetail"
import ForgotPassword from "../pages/ForgotPassword"
import ResetPassword from "../pages/ResetPassword"
import Enrollment from "../pages/Enrollment"
import ProtectedRoute from "../utils/Guards/AuthGuard"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/face-capture" element={<FaceCapture />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        >
          <Route index element={<div />} />
          <Route path="profile" element={<Profile />} />
          <Route path="enrollment" element={<Enrollment />} />
          <Route path="discipline/:id" element={<DisciplineDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}