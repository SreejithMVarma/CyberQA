import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Questions from './pages/Questions';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Navbar />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/questions" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/questions" /> : <Register />} />
          <Route path="/questions" element={user ? <Questions /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
        </Routes>
      </motion.div>
    </Router>
  );
}

export default App;