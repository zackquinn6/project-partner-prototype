import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Home from "@/components/Home";
import { AdminView } from "@/components/AdminView";
import UserView from "@/components/UserView";

const Index = () => {
  const location = useLocation();
  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'user'>('home');

  useEffect(() => {
    // Check if we're returning from project catalog with a view state
    if (location.state?.view) {
      setCurrentView(location.state.view);
    }
  }, [location.state]);

  const renderView = () => {
    switch (currentView) {
      case 'admin':
        return <AdminView />;
      case 'user':
        return <UserView />;
      default:
        return <Home onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      {renderView()}
    </div>
  );
};

export default Index;
