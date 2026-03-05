import React from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './componentes/Navbar';
import AppRoutes from './Routes';
import CookieBanner from './componentes/CookieBanner';

function App() {
  return (
    <AuthProvider>
      <div className="main-layout">
        <Navbar />
        <main className="content-area">
          <AppRoutes />
        </main>
        <CookieBanner />
      </div>
    </AuthProvider>
  );
}

export default App;