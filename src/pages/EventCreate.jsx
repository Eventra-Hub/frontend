import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function EventCreate() {
  const { auth } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'Conference', location: '',
    starts_at: '', ends_at: '', capacity: 50,
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
      };
      const created = await api.createEvent(payload, auth.token);
      nav(`/events/${created.id || created._id}`);
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Create event</h1>
          <div className="sub">Add a new conference, workshop, seminar, or meetup.</div>
        </div>
      </div>
      <form className="card form" style={{ maxWidth: 600 }} onSubmit={onSubmit}>
        <label>Title<input value={form.title} onChange={set('title')} required /></label>
        <label>Description<textarea rows="4" value={form.description} onChange={set('description')} required /></label>
        <label>Category
          <select value={form.category} onChange={set('category')}>
            <option>Conference</option><option>Workshop</option>
            <option>Seminar</option><option>Meetup</option>
          </select>
        </label>
        <label>Location<input value={form.location} onChange={set('location')} placeholder="City, Country or Online" required /></label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <label>Starts at<input type="datetime-local" value={form.starts_at} onChange={set('starts_at')} required /></label>
          <label>Ends at<input type="datetime-local" value={form.ends_at} onChange={set('ends_at')} required /></label>
        </div>
        <label>Capacity<input type="number" min="1" value={form.capacity} onChange={set('capacity')} required /></label>
        {err && <div className="error">{err}</div>}
        <div className="row">
          <button disabled={busy}>{busy ? 'Creating…' : 'Create event'}</button>
          <button type="button" className="ghost" onClick={() => nav(-1)}>Cancel</button>
        </div>
      </form>
    </>
  );
}
