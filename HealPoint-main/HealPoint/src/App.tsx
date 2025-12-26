import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import AllDoctors from './components/AllDoctors';
import About from './components/About';
import Contact from './components/Contact';
import AdminPanel from './components/AdminPanel';
import CreateAccount from './components/CreateAccount';
import Appointment from './components/Appointment';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import DoctorProfile from './components/DoctorProfile';
import DoctorList from './components/DoctorList';
import UserProfile from './components/UserProfile';
import MyBookAppointments from './components/MyBookAppointments';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/all-doctors" element={<AllDoctors />} />
              <Route path="/doctor/:doctorId" element={<DoctorProfile />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route
                path="/admin-panel"
                element={
                  <AdminProtectedRoute>
                    <AdminPanel />
                  </AdminProtectedRoute>
                }
              />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/appointment"
                element={
                  <ProtectedRoute>
                    <Appointment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/userprofile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/myappointment"
                element={
                  <ProtectedRoute>
                    <MyBookAppointments />
                  </ProtectedRoute>
                }
              />
              <Route path="/doctors" element={<DoctorList />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
