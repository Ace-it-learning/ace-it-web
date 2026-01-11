import React from 'react';
import { AvatarProvider } from './context/AvatarContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AvatarProvider>
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </AvatarProvider>
  );
}

export default App;
