import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './paginas/publicas/Home';
import Login from './paginas/auth/Login';


const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;