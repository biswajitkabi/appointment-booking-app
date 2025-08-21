export default function SlotCard({ slot, onBook, disabled }) {
  const start = new Date(slot.startAt);
  const end = new Date(slot.endAt);
  const label = `${start.toLocaleString()} → ${end.toLocaleTimeString()}`;
  return (
    <div className="border rounded p-3 flex items-center justify-between bg-white">
      <div className="text-sm">{label}</div>
      <button
        onClick={() => onBook(slot.id)}
        disabled={disabled}
        className="text-sm px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        Book
      </button>
    </div>
  );
}
