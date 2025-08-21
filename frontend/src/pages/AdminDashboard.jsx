import { useEffect, useState } from "react";
import api from "../api";

export default function AdminDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true); setErr("");
    try {
      const res = await api.get("/all-bookings");
      setRows(res.data);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-3">Admin Dashboard</h1>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      {loading ? <div>Loading…</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-2 text-sm">Booking ID</th>
                <th className="text-left p-2 text-sm">Patient</th>
                <th className="text-left p-2 text-sm">Email</th>
                <th className="text-left p-2 text-sm">Start</th>
                <th className="text-left p-2 text-sm">End</th>
                <th className="text-left p-2 text-sm">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const start = new Date(r.slot.startAt).toLocaleString();
                const end = new Date(r.slot.endAt).toLocaleTimeString();
                const created = new Date(r.createdAt).toLocaleString();
                return (
                  <tr key={r.id} className="border-b">
                    <td className="p-2 text-sm">{r.id}</td>
                    <td className="p-2 text-sm">{r.user.name}</td>
                    <td className="p-2 text-sm">{r.user.email}</td>
                    <td className="p-2 text-sm">{start}</td>
                    <td className="p-2 text-sm">{end}</td>
                    <td className="p-2 text-sm">{created}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
