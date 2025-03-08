// frontend/src/App.js - Should look like this:
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BookProvider } from './contexts/BookContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Layout Components
import Layout from './components/Layout/Layout';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Auth/Profile';

// Book Components
import BooksList from './components/Books/BooksList';
import BookDetail from './components/Books/BookDetail';
import BookForm from './components/Books/BookForm';
import MyBooks from './components/Books/MyBooks';

// Rental Components
import MyRentals from './components/Rentals/MyRentals';
import BookRequests from './components/Rentals/BookRequests';
import RentalDetail from './components/Rentals/RentalDetail';

// Dashboard
import Dashboard from './components/Dashboard/Dashboard';

// Admin Components
import ManageUsers from './components/Admin/ManageUsers';
import ManageRentals from './components/Admin/ManageRentals';

// Other Components
import Home from './components/Home';
import NotFound from './components/NotFound';

// Protected route wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();
  
  // Show loading state if auth is still being checked
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Check if the user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  // If a specific role is required, check if the user has it
  if (requiredRole && !hasRole(requiredRole) && !hasRole('admin')) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BookProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/books" element={<BooksList />} />
              <Route path="/books/:id" element={<BookDetail />} />
              
              {/* Protected Routes - Any authenticated user */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Protected Routes - Book Owner */}
              <Route path="/add-book" element={
                <ProtectedRoute requiredRole="owner">
                  <BookForm />
                </ProtectedRoute>
              } />
              
              <Route path="/books/:id/edit" element={
                <ProtectedRoute requiredRole="owner">
                  <BookForm />
                </ProtectedRoute>
              } />
              
              <Route path="/my-books" element={
                <ProtectedRoute requiredRole="owner">
                  <MyBooks />
                </ProtectedRoute>
              } />
              
              <Route path="/book-requests" element={
                <ProtectedRoute requiredRole="owner">
                  <BookRequests />
                </ProtectedRoute>
              } />
              
              {/* Protected Routes - Renter */}
              <Route path="/my-rentals" element={
                <ProtectedRoute requiredRole="renter">
                  <MyRentals />
                </ProtectedRoute>
              } />
              
              <Route path="/rentals/:id" element={
                <ProtectedRoute>
                  <RentalDetail />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/manage-users" element={
                <ProtectedRoute requiredRole="admin">
                  <ManageUsers />
                </ProtectedRoute>
              } />
              
              <Route path="/manage-rentals" element={
                <ProtectedRoute requiredRole="admin">
                  <ManageRentals />
                </ProtectedRoute>
              } />
              
              {/* Not Found Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </BookProvider>
    </AuthProvider>
  );
}

export default App;