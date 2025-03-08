import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaUserEdit } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    room_number: '',
    hostel_number: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    // Populate form with user data when available
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        room_number: user.room_number || '',
        hostel_number: user.hostel_number || ''
      });
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await updateProfile(formData);
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
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
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">My Profile</h4>
              {!isEditing && (
                <Button 
                  variant="outline-primary" 
                  onClick={() => setIsEditing(true)}
                  size="sm"
                >
                  <FaUserEdit className="me-1" />
                  Edit Profile
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Row className="mb-4">
                <Col md={3} className="text-center mb-3 mb-md-0">
                  <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto" style={{ width: '100px', height: '100px' }}>
                    <FaUser size={50} className="text-secondary" />
                  </div>
                </Col>
                <Col md={9}>
                  <h5>{user.first_name} {user.last_name}</h5>
                  <div className="text-muted mb-2">{user.username}</div>
                  <div className="mb-2">
                    <span className="badge bg-primary">{user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}</span>
                    <span className="badge bg-secondary ms-2">{user.status}</span>
                  </div>
                  <div>{user.email}</div>
                </Col>
              </Row>
              
              <hr className="my-4" />
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Room Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="room_number"
                        value={formData.room_number}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Hostel Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="hostel_number"
                        value={formData.hostel_number}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                {isEditing && (
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form to original values
                        if (user) {
                          setFormData({
                            first_name: user.first_name || '',
                            last_name: user.last_name || '',
                            email: user.email || '',
                            phone_number: user.phone_number || '',
                            room_number: user.room_number || '',
                            hostel_number: user.hostel_number || ''
                          });
                        }
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;