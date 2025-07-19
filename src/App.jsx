import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

function App() {
  console.log('App component rendering...'); // Debug log
  
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
