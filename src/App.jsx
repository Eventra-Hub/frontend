import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';
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
  const loc = useLocation();
  if (!auth) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}

function RoleOnly({ role, children }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (auth.role !== role) return <Navigate to="/events" replace />;
  return children;
}

function initial(user) {
  return (user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase();
}

function TopNav() {
  const { auth, logout } = useAuth();
  const nav = useNavigate();
  const isOrganizer = auth?.role === 'organizer';
  return (
    <header className="topnav">
      <div className="brand">
        <span className="brand-dot" /> Eventura
      </div>
      <nav>
        {auth && <NavLink to="/events">Events</NavLink>}
        {auth && !isOrganizer && <NavLink to="/bookings">My Bookings</NavLink>}
        {auth && <NavLink to="/notifications">Notifications</NavLink>}
        {auth && isOrganizer && <NavLink to="/events/new">Create</NavLink>}
      </nav>
      <span className="spacer" />
      {auth ? (
        <div className="user">
          <Link to="/profile" className="user" style={{ color: '#fff' }}>
            <span className="avatar">{initial(auth)}</span>
          </Link>
          <span className="badge muted" style={{ textTransform: 'capitalize' }}>{auth.role || 'user'}</span>
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
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={
          <main>
            <Routes>
              <Route path="/" element={<Private><Navigate to="/events" replace /></Private>} />
              <Route path="/events" element={<Private><Events /></Private>} />
              <Route path="/events/new" element={<RoleOnly role="organizer"><EventCreate /></RoleOnly>} />
              <Route path="/events/:id" element={<Private><EventDetail /></Private>} />
              <Route path="/bookings" element={<RoleOnly role="attendee"><MyBookings /></RoleOnly>} />
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
