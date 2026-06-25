import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

// Public pages
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';

// Auth
import AuthCallback from './pages/AuthCallback';
import Login from './pages/Login';

// Onboarding
import Onboarding from './pages/Onboarding';

// Authenticated pages
import Dashboard from './pages/Dashboard';
import ContractsList from './pages/ContractsList';
import ContractDetail from './pages/ContractDetail';
import ContractNew from './pages/contract-new/ContractNew';
import Settings from './pages/Settings';
import SellListing from './pages/SellListing';
import MyListings from './pages/MyListings';
import Favorites from './pages/Favorites';
import Messages from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';

// Error pages
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// Guards
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Spinner from './components/Spinner';

export default function App() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/sell" element={<PrivateRoute><SellListing /></PrivateRoute>} />
        <Route path="/marketplace/mine" element={<PrivateRoute><MyListings /></PrivateRoute>} />
        <Route path="/marketplace/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
        <Route path="/marketplace/:id" element={<ListingDetail />} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Onboarding (auth required, onboarding not required) */}
        <Route path="/onboarding" element={<PrivateRoute requireOnboarding={false}><Onboarding /></PrivateRoute>} />

        {/* Authenticated */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/contracts" element={<PrivateRoute><ContractsList /></PrivateRoute>} />
        <Route path="/contracts/:id" element={<PrivateRoute><ContractDetail /></PrivateRoute>} />
        <Route path="/contracts/new/*" element={<PrivateRoute><ContractNew /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* Fallback */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
