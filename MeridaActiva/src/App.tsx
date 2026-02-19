import React from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './componentes/Navbar';
import AppRoutes from './Routes';

function App() {
  return (
    <AuthProvider>
      <div className="main-layout">
        <Navbar />
        <main className="content-area">
          <AppRoutes />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;