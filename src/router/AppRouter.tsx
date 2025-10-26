import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import FaceCapture from "../pages/FaceCapture";
import HomePage from "../pages/HomePage";
import Profile from "../pages/Profile";
import DisciplineDetail from "../pages/DisciplineDetail";
import ProtectedRoute from "../utils/Guards/AuthGuard";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/face-capture" element={<FaceCapture />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }>
          <Route index element={<div />} />
          <Route path="profile" element={<Profile />} />
          <Route path="discipline/:id" element={<DisciplineDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}