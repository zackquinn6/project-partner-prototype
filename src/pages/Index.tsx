import { useState } from "react";
import Navigation from "@/components/Navigation";
import Home from "@/components/Home";
import AdminView from "@/components/AdminView";
import UserView from "@/components/UserView";

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'user'>('home');

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
