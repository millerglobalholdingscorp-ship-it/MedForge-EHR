import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import PatientPortal from './components/PatientPortal';
import PortalSignInPage from './components/PortalSignInPage';
import PortalSignUpPage from './components/PortalSignUpPage';

function ProtectedPortal() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" /></div>;
  if (!isSignedIn) return <Navigate to="/portal/sign-in" replace />;
  return <PatientPortal />;
}

function ProtectedDashboard() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="/portal" element={<ProtectedPortal />} />
        <Route path="/portal/sign-in" element={<PortalSignInPage />} />
        <Route path="/portal/sign-up" element={<PortalSignUpPage />} />
      </Route>
    </Routes>
  );
}
