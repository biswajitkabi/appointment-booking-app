import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }

  return (
    <nav className="w-full bg-white border-b">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold">Clinic Appointments</Link>
        <div className="flex items-center gap-4">
          {token ? (
            <>
              {role === "admin" ? (
                <Link className="text-sm underline" to="/admin">Admin</Link>
              ) : (
                <Link className="text-sm underline" to="/">Dashboard</Link>
              )}
              <button onClick={logout} className="text-sm bg-gray-900 text-white px-3 py-1 rounded">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="text-sm underline" to="/login">Login</Link>
              <Link className="text-sm underline" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
