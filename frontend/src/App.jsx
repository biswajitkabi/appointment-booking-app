import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function RequireAuth({ children, role }) {
  const token = localStorage.getItem("token");
  const myRole = localStorage.getItem("role");
  const loc = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (role && myRole !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <RequireAuth role="patient">
            <PatientDashboard />
          </RequireAuth>
        }/>
        <Route path="/admin" element={
          <RequireAuth role="admin">
            <AdminDashboard />
          </RequireAuth>
        }/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}
