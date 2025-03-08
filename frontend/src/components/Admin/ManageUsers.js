import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Badge, Modal, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { FaUserEdit, FaUserTimes, FaUserCog, FaSearch, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ManageUsers = () => {
  const { user } = useAuth();
  const API_URL = 'http://localhost:8000/api';
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Edit user modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    status: '',
    phone_number: '',
    room_number: '',
    hostel_number: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    // Apply filters when users, searchTerm, or filters change
    applyFilters();
  }, [users, searchTerm, roleFilter, statusFilter]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('You need to be logged in with admin privileges');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUsers(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(search) || 
        user.email.toLowerCase().includes(search) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(search)
      );
    }
    
    // Apply role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(filtered);
  };
  
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role: user.role || '',
      status: user.status || '',
      phone_number: user.phone_number || '',
      room_number: user.room_number || '',
      hostel_number: user.hostel_number || ''
    });
    setShowEditModal(true);
  };
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };
  
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    try {
      setEditLoading(true);
      setEditError('');
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setEditError('You need to be logged in with admin privileges');
        return;
      }
      
      const response = await axios.patch(
        `${API_URL}/users/${selectedUser.id}/`, 
        editFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update the user in the list
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, ...response.data } : u
      ));
      
      setShowEditModal(false);
    } catch (err) {
      setEditError('Failed to update user. Please try again.');
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };
  
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge bg="danger">Admin</Badge>;
      case 'owner':
        return <Badge bg="primary">Book Owner</Badge>;
      case 'renter':
        return <Badge bg="success">Renter</Badge>;
      case 'viewer':
        return <Badge bg="secondary">Viewer</Badge>;
      default:
        return <Badge bg="info">{role}</Badge>;
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'inactive':
        return <Badge bg="secondary">Inactive</Badge>;
      case 'suspended':
        return <Badge bg="danger">Suspended</Badge>;
      default:
        return <Badge bg="info">{status}</Badge>;
    }
  };
  
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  return (
    <Container className="my-4">
      <h2 className="mb-4">Manage Users</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Filters */}
      <div className="mb-4">
        <div className="d-flex flex-column flex-md-row gap-3">
          <div className="flex-grow-1">
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by username, email, or name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          
          <div className="d-flex gap-2">
            <Form.Select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="owner">Book Owner</option>
              <option value="renter">Renter</option>
              <option value="viewer">Viewer</option>
            </Form.Select>
            
            <Form.Select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </Form.Select>
          </div>
        </div>
      </div>
      
      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <Alert variant="info">
          No users found matching your filters.
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.first_name} {user.last_name}</td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>{user.phone_number || '-'}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="primary"
                        size="sm"
                        onClick={() => openEditModal(user)}
                        title="Edit User"
                      >
                        <FaUserEdit />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      
      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit User: {selectedUser?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editError && <Alert variant="danger">{editError}</Alert>}
          
          <Form onSubmit={handleUpdateUser}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="first_name">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={editFormData.first_name}
                    onChange={handleEditChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="last_name">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={editFormData.last_name}
                    onChange={handleEditChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editFormData.email}
                onChange={handleEditChange}
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="role">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditChange}
                  >
                    <option value="admin">Admin</option>
                    <option value="owner">Book Owner</option>
                    <option value="renter">Renter</option>
                    <option value="viewer">Viewer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="status">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3" controlId="phone_number">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                name="phone_number"
                value={editFormData.phone_number}
                onChange={handleEditChange}
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="room_number">
                  <Form.Label>Room Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="room_number"
                    value={editFormData.room_number}
                    onChange={handleEditChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="hostel_number">
                  <Form.Label>Hostel Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="hostel_number"
                    value={editFormData.hostel_number}
                    onChange={handleEditChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={editLoading}
              >
                {editLoading ? 'Saving...' : 'Update User'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ManageUsers;