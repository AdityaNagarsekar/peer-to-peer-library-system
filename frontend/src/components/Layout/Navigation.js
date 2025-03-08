import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">P2P Library</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/books">Browse Books</Nav.Link>
            
            {isAuthenticated() && (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                
                {/* Book Owner Links */}
                {hasRole('owner') || hasRole('admin') ? (
                  <NavDropdown title="My Books" id="books-dropdown">
                    <NavDropdown.Item as={Link} to="/my-books">Manage Books</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/add-book">Add Book</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/book-requests">Book Requests</NavDropdown.Item>
                  </NavDropdown>
                ) : null}
                
                {/* Renter Links */}
                {hasRole('renter') || hasRole('admin') ? (
                  <NavDropdown title="My Rentals" id="rentals-dropdown">
                    <NavDropdown.Item as={Link} to="/my-rentals">Active Rentals</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/rental-history">Rental History</NavDropdown.Item>
                  </NavDropdown>
                ) : null}
                
                {/* Admin Links */}
                {hasRole('admin') && (
                  <NavDropdown title="Admin" id="admin-dropdown">
                    <NavDropdown.Item as={Link} to="/manage-users">Manage Users</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/manage-rentals">All Rentals</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/reports">Reports</NavDropdown.Item>
                  </NavDropdown>
                )}
              </>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated() ? (
              <NavDropdown title={user.username} id="user-dropdown">
                <NavDropdown.Item as={Link} to="/profile">My Profile</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;