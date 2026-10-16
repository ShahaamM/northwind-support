import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

/** Application shell: the header, the navigation, and wherever the router puts the page. */
export function App() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('agent');
    navigate('/login', { replace: true });
  };

  return (
    <div className="app">
      <header className="app__header">
        <Link className="app__brand" to="/tickets">
          Northwind Support
        </Link>

        <nav className="app__nav" aria-label="Main">
          <NavLink to="/tickets">Tickets</NavLink>
          <NavLink to="/customers">Customers</NavLink>
        </nav>

        <button
          onClick={handleLogout}
          className="app__logout-btn"
          style={{ marginLeft: 'auto' }}
        >
          Sign Out
        </button>
      </header>

      <main className="app__main">
        <Outlet />
      </main>
    </div>
  );
}
