import React from 'react';
import AppRoutes from './Routes';
// Aquí importarás tu componente Navbar desde la carpeta componentes más adelante
// import Navbar from './componentes/Navbar';

const App: React.FC = () => {
  return (
    <div className="app-container">
      {/* <Navbar /> */}
      <main className="container mt-4">
        <AppRoutes />
      </main>
      <footer className="text-center py-4 mt-5 border-top">
        <p>&copy; 2025 MeridaActiva - Lucía Garrido Chocarro</p> [cite: 9, 21]
      </footer>
    </div>
  );
};

export default App;