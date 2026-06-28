import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { TaskForm } from './pages/TaskForm';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Team } from './pages/Team';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public Auth / Landing Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure Application Routes (Wrapped in Layout Shell) */}
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/tasks"
            element={
              <Layout>
                <Tasks />
              </Layout>
            }
          />
          <Route
            path="/pending"
            element={
              <Layout>
                <Tasks filterStatus="pending" />
              </Layout>
            }
          />
          <Route
            path="/completed"
            element={
              <Layout>
                <Tasks filterStatus="completed" />
              </Layout>
            }
          />
          <Route
            path="/overdue"
            element={
              <Layout>
                <Tasks filterStatus="overdue" />
              </Layout>
            }
          />
          <Route
            path="/add-task"
            element={
              <Layout>
                <TaskForm />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout>
                <Settings />
              </Layout>
            }
          />
          <Route
            path="/team"
            element={
              <Layout>
                <Team />
              </Layout>
            }
          />

          {/* Fallback Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
