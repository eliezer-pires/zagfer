import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import Login from './pages/Login';
import Tools from './pages/Tools';
import Checkout from './pages/Checkout';
import Return from './pages/Return';
import Users from './pages/Users';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { currentUser } = useApp();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Admin Route Wrapper
const AdminRoute = ({ children }: { children?: React.ReactNode }) => {
  const { currentUser } = useApp();
  // Se o usuário não tiver permissão de admin, redireciona para a home
  if (currentUser && currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/tools" element={
        <ProtectedRoute>
          <Layout><Tools /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/checkout" element={
        <ProtectedRoute>
          <Layout><Checkout /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/return" element={
        <ProtectedRoute>
          <Layout><Return /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute>
          <AdminRoute>
            <Layout><Users /></Layout>
          </AdminRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/history" element={
        <ProtectedRoute>
          <Layout><History /></Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
}