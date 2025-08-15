import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from "@/components/Navigation";
import Home from "@/components/Home";
import { AdminView } from "@/components/AdminView";
import UserView from "@/components/UserView";
import AdminPasswordGate from "@/components/AdminPasswordGate";
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'user'>('home');
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [resetUserView, setResetUserView] = useState(false);

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    
    // Check if we're returning from project catalog with a view state
    if (location.state?.view) {
      setCurrentView(location.state.view);
    }
  }, [user, loading, navigate, location.state]);

  const handleAdminAccess = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setShowAdminGate(true);
    }
  };

  const handleAdminAuthenticated = () => {
    setIsAdminAuthenticated(true);
    setShowAdminGate(false);
    setCurrentView('admin');
  };

  const handleAdminCancel = () => {
    setShowAdminGate(false);
  };

  const handleProjectsView = () => {
    setResetUserView(true);
    setTimeout(() => setResetUserView(false), 100); // Reset after a brief moment
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (showAdminGate) {
    return <AdminPasswordGate onAuthenticated={handleAdminAuthenticated} onCancel={handleAdminCancel} />;
  }

  const renderView = () => {
    console.log('Index renderView - currentView:', currentView);
    switch (currentView) {
      case 'admin':
        return <AdminView />;
      case 'user':
        return <UserView resetToListing={resetUserView} onProjectSelected={() => setCurrentView('user')} projectRunId={location.state?.projectRunId} />;
      default:
        return <Home onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation currentView={currentView} onViewChange={setCurrentView} onAdminAccess={handleAdminAccess} onProjectsView={handleProjectsView} />
      {renderView()}
    </div>
  );
};

export default Index;
