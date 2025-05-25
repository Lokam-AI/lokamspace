import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage/LandingPage';
import AgentsListPage from '../pages/Agents/AgentsListPage';
import SambaPage from '../pages/Agents/Samba/SambaPage';
import SignIn from '../pages/Authentication/SignIn';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/agents" element={<AgentsListPage />} />
      <Route path="/agents/samba" element={<SambaPage />} />
    </Routes>
  );
};

export default AppRoutes;
