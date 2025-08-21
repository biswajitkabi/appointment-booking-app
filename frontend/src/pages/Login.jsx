import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("patient@example.com");
  const [password, setPassword] = useState("Passw0rd!");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      nav(res.data.role === "admin" ? "/admin" : "/");
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white border rounded p-6">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Email"
               value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password"
               value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-gray-900 text-white rounded py-2" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      <div className="text-sm mt-3">
        No account? <Link to="/register" className="underline">Register</Link>
      </div>
      <div className="text-xs text-gray-500 mt-4">
        Try admin: admin@example.com / Passw0rd!
      </div>
    </div>
  );
}
