import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AssistantWidget from '../assistant/AssistantWidget';

const Layout = ({ children }) => {
  const location = useLocation();
  // Hide the floating assistant on admin routes to avoid overlapping admin tooling.
  const hideAssistant = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      {!hideAssistant && <AssistantWidget />}
    </div>
  );
};

export default Layout;
