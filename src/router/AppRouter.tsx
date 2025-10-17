import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import HomePage from "../pages/HomePage";
import ProtectedRoute from "../utils/Guards/AuthGuard";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }/>
      </Routes>
    </BrowserRouter>
  )
}