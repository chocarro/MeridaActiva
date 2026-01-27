import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './paginas/Home';
import Login from './paginas/Login';


const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;