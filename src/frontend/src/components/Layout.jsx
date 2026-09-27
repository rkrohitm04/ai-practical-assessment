import { Link, NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          Ticket Desk
        </Link>
        <nav className="main-nav" aria-label="Main">
          <NavLink to="/" end>
            All tickets
          </NavLink>
          <NavLink to="/tickets/new">New ticket</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
