import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AvatarProvider } from './context/AvatarContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';

function App() {
  return (
    <AuthProvider>
      <AvatarProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AvatarProvider>
    </AuthProvider>
  );
}

export default App;
