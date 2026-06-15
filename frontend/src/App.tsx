import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Sessions from './pages/Sessions';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import TutorDashboard from './pages/TutorDashboard';
import Marketplace from './pages/Marketplace';
import Support from './pages/Support';
import MainLayout from './layout/MainLayout';

function App() {
  console.log("App starting...");
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            } 
          />
          <Route 
            path="/sessions" 
            element={
              <MainLayout>
                <Sessions />
              </MainLayout>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <MainLayout>
                <Profile />
              </MainLayout>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            } 
          />
          <Route 
            path="/tutor" 
            element={
              <MainLayout>
                <TutorDashboard />
              </MainLayout>
            } 
          />
          <Route 
            path="/marketplace" 
            element={
              <MainLayout>
                <Marketplace />
              </MainLayout>
            } 
          />
          <Route 
            path="/support" 
            element={
              <MainLayout>
                <Support />
              </MainLayout>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
