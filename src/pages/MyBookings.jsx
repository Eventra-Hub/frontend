import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const fmt = (s) => { try { return new Date(s).toLocaleString(); } catch { return s; } };

export default function MyBookings() {
  const { auth } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState({});
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await api.myBookings(auth.token);
      const arr = Array.isArray(list) ? list : list?.items || [];
      setBookings(arr);
      const ids = [...new Set(arr.map((b) => b.event_id).filter(Boolean))];
      const map = {};
      await Promise.all(ids.map((id) => api.getEvent(id).then((e) => { map[id] = e; }).catch(() => {})));
      setEvents(map);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    setErr('');
    try { await api.cancelBooking(id, auth.token); load(); }
    catch (e) { setErr(e.message); }
  };

  if (loading) return <div className="spinner" />;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My bookings</h1>
          <div className="sub">{bookings.length} booking{bookings.length === 1 ? '' : 's'}</div>
        </div>
      </div>
      {err && <div className="error">{err}</div>}
      {!bookings.length ? (
        <div className="empty">
          <div className="icon">🎟️</div>
          <p>No bookings yet. <Link to="/events">Browse events</Link></p>
        </div>
      ) : (
        <div className="stack-y">
          {bookings.map((b) => {
            const id = b.booking_id || b.id || b._id;
            const ev = events[b.event_id];
            const cancelled = b.status === 'cancelled';
            return (
              <div className="card" key={id}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h2><Link to={`/events/${b.event_id}`}>{ev?.title || `Event ${b.event_id}`}</Link></h2>
                    <div className="muted">
                      {ev?.location && <>📍 {ev.location} · </>}
                      🗓 {fmt(ev?.starts_at || b.created_at)}
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <span className={`badge ${cancelled ? 'danger' : 'success'}`}>{b.status}</span>
                      {b.payment_status && (
                        <span className="badge muted" style={{ marginLeft: '0.5rem' }}>{b.payment_status}</span>
                      )}
                      <span className="muted" style={{ marginLeft: '0.5rem' }}>booked {fmt(b.created_at)}</span>
                    </div>
                  </div>
                  {!cancelled && (
                    <button className="danger" onClick={() => cancel(id)}>Cancel</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
