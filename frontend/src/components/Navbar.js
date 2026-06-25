import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../hooks/useUser';
import BookDemoModal from './BookDemoModal';

function Logo() {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm font-heading">A</span>
      </div>
      <span className="font-bold text-lg font-heading text-gray-900">
        Aqad<span className="text-teal-500">Chain</span>
      </span>
    </Link>
  );
}

export function PublicNavbar({ dark = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const { loginWithRedirect } = useAuth0();

  const bg = dark ? 'bg-transparent' : 'bg-white border-b border-gray-200';
  const textColor = dark ? 'text-white/60 hover:text-white' : 'hover:text-gray-900 transition-colors';
  const activeColor = dark ? 'text-teal-400' : 'text-teal-600';

  return (
    <header className={`${bg} sticky top-0 z-40`} style={dark ? { backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' } : {}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />

        <nav className={`hidden md:flex items-center space-x-8 text-sm font-medium ${dark ? 'text-white/50' : 'text-gray-600'}`}>
          <NavLink to="/marketplace" className={({ isActive }) => isActive ? activeColor : textColor}>Marketplace</NavLink>
          <NavLink to="/how-it-works" className={({ isActive }) => isActive ? activeColor : textColor}>How It Works</NavLink>
          <NavLink to="/pricing" className={({ isActive }) => isActive ? activeColor : textColor}>Pricing</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? activeColor : textColor}>About</NavLink>
          <NavLink to="/faq" className={({ isActive }) => isActive ? activeColor : textColor}>FAQ</NavLink>
        </nav>

        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={() => setDemoOpen(true)}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-btn transition-all"
            style={dark
              ? { background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.35)' }
              : { background: '#FDF6E3', color: '#92702A', border: '1px solid #F0E0B0' }}
          >
            📅 Book a Demo
          </button>
          <button onClick={() => loginWithRedirect()} className={`text-sm font-medium transition-colors ${dark ? 'text-white/50 hover:text-white' : 'text-gray-700 hover:text-teal-600'}`}>Log in</button>
          <button onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
            className="text-sm px-4 py-2 rounded-btn font-semibold transition-all"
            style={dark ? { background: 'rgba(13,110,99,0.3)', color: '#4ade80', border: '1px solid rgba(13,110,99,0.4)' } : undefined}
          >{dark ? 'Get Started →' : 'Get Started Free'}</button>
        </div>

        <button className={`md:hidden p-2 ${dark ? 'text-white/60' : 'text-gray-600'}`} onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <NavLink to="/marketplace" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Marketplace</NavLink>
          <NavLink to="/how-it-works" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>How It Works</NavLink>
          <NavLink to="/pricing" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Pricing</NavLink>
          <NavLink to="/about" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>About</NavLink>
          <NavLink to="/faq" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>FAQ</NavLink>
          <div className="pt-2 border-t border-gray-100 flex flex-col space-y-2">
            <button onClick={() => { setMenuOpen(false); setDemoOpen(true); }} className="btn-secondary w-full">📅 Book a Demo</button>
            <button onClick={() => loginWithRedirect()} className="btn-secondary w-full">Log in</button>
            <button onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })} className="btn-primary w-full">Get Started Free</button>
          </div>
        </div>
      )}

      <BookDemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </header>
  );
}

export function AuthNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const { logout } = useAuth0();
  const { dbUser } = useUser();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Logo />
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'text-teal-600' : 'hover:text-gray-900'}>Dashboard</NavLink>
            <NavLink to="/contracts" className={({ isActive }) => isActive ? 'text-teal-600' : 'hover:text-gray-900'}>Contracts</NavLink>
            <NavLink to="/marketplace" className={({ isActive }) => isActive ? 'text-teal-600' : 'hover:text-gray-900'}>Marketplace</NavLink>
            <NavLink to="/marketplace/mine" className={({ isActive }) => isActive ? 'text-teal-600' : 'hover:text-gray-900'}>My Listings</NavLink>
            <NavLink to="/messages" className={({ isActive }) => isActive ? 'text-teal-600' : 'hover:text-gray-900'}>Messages</NavLink>
            {dbUser?.role === 'ADMIN' && (
              <NavLink to="/admin" className={({ isActive }) => isActive ? 'text-teal-600' : 'hover:text-gray-900'}>Admin</NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setDemoOpen(true)}
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-btn"
            style={{ background: '#FDF6E3', color: '#92702A', border: '1px solid #F0E0B0' }}
          >
            📅 Book a Demo
          </button>
          <button onClick={() => navigate('/contracts/new/type')} className="btn-primary hidden md:flex text-sm px-4 py-2">
            + New Contract
          </button>
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-bold">
                {dbUser?.full_name?.[0]?.toUpperCase() || '?'}
              </div>
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-10 w-52 bg-white border border-gray-200 rounded-card shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{dbUser?.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{dbUser?.email}</p>
                </div>
                <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>Settings</Link>
                <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <BookDemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </header>
  );
}
