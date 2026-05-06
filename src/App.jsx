import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { isMock } from './api.js';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Events from './pages/Events.jsx';
import EventDetail from './pages/EventDetail.jsx';
import EventCreate from './pages/EventCreate.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';

function Private({ children }) {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/login" replace />;
}

function initial(user) {
  return (user?.name?.[0] || user?.id?.[0] || 'U').toUpperCase();
}

function TopNav() {
  const { auth, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="topnav">
      <div className="brand">
        <span className="brand-dot" /> Eventura
      </div>
      <nav>
        <NavLink to="/events">Events</NavLink>
        {auth && <NavLink to="/bookings">My Bookings</NavLink>}
        {auth && <NavLink to="/notifications">Notifications</NavLink>}
        {auth && <NavLink to="/events/new">Create</NavLink>}
      </nav>
      <span className="spacer" />
      {auth ? (
        <div className="user">
          <Link to="/profile" className="user" style={{ color: '#fff' }}>
            <span className="avatar">{initial(auth)}</span>
          </Link>
          <button className="secondary" onClick={() => { logout(); nav('/login'); }}>Logout</button>
        </div>
      ) : (
        <nav>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/signup">Sign up</NavLink>
        </nav>
      )}
    </header>
  );
}

export default function App() {
  return (
    <>
      <TopNav />
      {isMock && <div className="mock-banner">Demo mode — using mock data. Set <code>VITE_USE_MOCK=false</code> to call real services.</div>}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/events" replace />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/new" element={<Private><EventCreate /></Private>} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/bookings" element={<Private><MyBookings /></Private>} />
              <Route path="/notifications" element={<Private><Notifications /></Private>} />
              <Route path="/profile" element={<Private><Profile /></Private>} />
              <Route path="*" element={<p>Not found.</p>} />
            </Routes>
          </main>
        } />
      </Routes>
    </>
  );
}
