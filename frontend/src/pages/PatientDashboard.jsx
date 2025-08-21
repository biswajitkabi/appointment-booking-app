import { useEffect, useMemo, useState } from "react";
import api from "../api";
import SlotCard from "../components/SlotCard";

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function PatientDashboard() {
  const [slots, setSlots] = useState([]);
  const [my, setMy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const range = useMemo(() => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 6);
    return { from: isoDate(from), to: isoDate(to) };
  }, []);

  async function load() {
    setLoading(true); setErr("");
    try {
      const [s, b] = await Promise.all([
        api.get(`/slots?from=${range.from}&to=${range.to}`),
        api.get(`/my-bookings`)
      ]);
      setSlots(s.data);
      setMy(b.data);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function book(slotId) {
    try {
      await api.post("/book", { slotId });
      await load();
      alert("Booked!");
    } catch (e) {
      alert(e?.response?.data?.error?.message || "Booking failed");
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-3">Patient Dashboard</h1>
      <div className="text-sm text-gray-600 mb-4">
        Showing available slots between <b>{range.from}</b> and <b>{range.to}</b> (times shown in your local timezone).
      </div>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      {loading ? <div>Loading…</div> : (
        <div className="grid gap-3">
          {slots.length === 0 && <div className="text-sm text-gray-600">No available slots.</div>}
          {slots.map(s => (
            <SlotCard key={s.id} slot={s} onBook={book} />
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold mt-8 mb-2">My Bookings</h2>
      <div className="grid gap-3">
        {my.length === 0 && <div className="text-sm text-gray-600">No bookings yet.</div>}
        {my.map(b => {
          const start = new Date(b.slot.startAt);
          const end = new Date(b.slot.endAt);
          return (
            <div key={b.id} className="border rounded p-3 bg-white">
              <div className="text-sm">
                {start.toLocaleString()} → {end.toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
