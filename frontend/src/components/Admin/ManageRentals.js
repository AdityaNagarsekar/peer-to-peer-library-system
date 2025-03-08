import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Badge, Form, InputGroup, Tabs, Tab, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaFilter, 
  FaBook, 
  FaUser, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaTimesCircle 
} from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ManageRentals = () => {
  const { user } = useAuth();
  const API_URL = 'http://localhost:8000/api';
  
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filteredRentals, setFilteredRentals] = useState([]);
  
  // Action states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  useEffect(() => {
    fetchRentals();
  }, []);
  
  useEffect(() => {
    // Apply filters when rentals, searchTerm, or filters change
    applyFilters();
  }, [rentals, searchTerm, statusFilter, dateFilter]);
  
  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('You need to be logged in with admin privileges');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/rentals/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setRentals(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch rentals. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...rentals];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(rental => 
        rental.book_title?.toLowerCase().includes(search) || 
        rental.renter_name?.toLowerCase().includes(search)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(rental => rental.status === statusFilter);
    }
    
    // Apply date filter (recent, older, etc.)
    if (dateFilter) {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      
      if (dateFilter === 'recent') {
        filtered = filtered.filter(rental => new Date(rental.start_date) >= thirtyDaysAgo);
      } else if (dateFilter === 'older') {
        filtered = filtered.filter(rental => new Date(rental.start_date) < thirtyDaysAgo);
      } else if (dateFilter === 'active') {
        const today = new Date();
        filtered = filtered.filter(rental => 
          new Date(rental.start_date) <= today && new Date(rental.end_date) >= today
        );
      } else if (dateFilter === 'upcoming') {
        const today = new Date();
        filtered = filtered.filter(rental => new Date(rental.start_date) > today);
      } else if (dateFilter === 'expired') {
        const today = new Date();
        filtered = filtered.filter(rental => new Date(rental.end_date) < today);
      }
    }
    
    setFilteredRentals(filtered);
  };
  
  const handleApproveRental = async () => {
    if (!selectedRental) return;
    
    try {
      setActionLoading(true);
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('You need to be logged in with admin privileges');
        return;
      }
      
      await axios.post(
        `${API_URL}/rentals/${selectedRental.id}/approve/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update the rental in the list
      setRentals(rentals.map(rental => 
        rental.id === selectedRental.id ? { ...rental, status: 'approved' } : rental
      ));
      
      setShowApproveModal(false);
    } catch (err) {
      setError('Failed to approve rental. Please try again.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleCancelRental = async () => {
    if (!selectedRental) return;
    
    try {
      setActionLoading(true);
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('You need to be logged in with admin privileges');
        return;
      }
      
      await axios.post(
        `${API_URL}/rentals/${selectedRental.id}/cancel/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update the rental in the list
      setRentals(rentals.map(rental => 
        rental.id === selectedRental.id ? { ...rental, status: 'canceled' } : rental
      ));
      
      setShowCancelModal(false);
    } catch (err) {
      setError('Failed to cancel rental. Please try again.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleCompleteRental = async () => {
    if (!selectedRental) return;
    
    try {
      setActionLoading(true);
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('You need to be logged in with admin privileges');
        return;
      }
      
      await axios.post(
        `${API_URL}/rentals/${selectedRental.id}/complete/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update the rental in the list
      setRentals(rentals.map(rental => 
        rental.id === selectedRental.id ? { ...rental, status: 'completed' } : rental
      ));
      
      setShowCompleteModal(false);
    } catch (err) {
      setError('Failed to complete rental. Please try again.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="info">Pending</Badge>;
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'completed':
        return <Badge bg="primary">Completed</Badge>;
      case 'canceled':
        return <Badge bg="danger">Canceled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  // Split rentals into categories for tabs
  const pendingRentals = filteredRentals.filter(rental => rental.status === 'pending');
  const activeRentals = filteredRentals.filter(rental => rental.status === 'approved');
  const completedRentals = filteredRentals.filter(rental => rental.status === 'completed');
  const canceledRentals = filteredRentals.filter(rental => rental.status === 'canceled');
  
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  const renderRentalsTable = (rentalsList) => {
    return rentalsList.length === 0 ? (
      <Alert variant="info">
        No rentals found matching your filters.
      </Alert>
    ) : (
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Book</th>
              <th>Renter</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rentalsList.map((rental) => (
              <tr key={rental.id}>
                <td>
                  <Link to={`/books/${rental.book}`} className="d-flex align-items-center">
                    <FaBook className="me-2" />
                    {rental.book_title}
                  </Link>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <FaUser className="me-2" />
                    {rental.renter_name}
                  </div>
                </td>
                <td>{new Date(rental.start_date).toLocaleDateString()}</td>
                <td>{new Date(rental.end_date).toLocaleDateString()}</td>
                <td>{getStatusBadge(rental.status)}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button 
                      as={Link}
                      to={`/rentals/${rental.id}`}
                      variant="info"
                      size="sm"
                      title="View Details"
                    >
                      <FaInfoCircle />
                    </Button>
                    
                    {rental.status === 'pending' && (
                      <>
                        <Button 
                          variant="success"
                          size="sm"
                          onClick={() => {
                            setSelectedRental(rental);
                            setShowApproveModal(true);
                          }}
                          title="Approve Rental"
                        >
                          <FaCheckCircle />
                        </Button>
                        
                        <Button 
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setSelectedRental(rental);
                            setShowCancelModal(true);
                          }}
                          title="Cancel Rental"
                        >
                          <FaTimesCircle />
                        </Button>
                      </>
                    )}
                    
                    {rental.status === 'approved' && (
                      <Button 
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedRental(rental);
                          setShowCompleteModal(true);
                        }}
                        title="Mark as Complete"
                      >
                        <FaCheckCircle />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };
  
  return (
    <Container className="my-4">
      <h2 className="mb-4">Manage Rentals</h2>
      
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
                placeholder="Search by book title or renter name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          
          <div className="d-flex gap-2">
            <Form.Select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
            </Form.Select>
            
            <Form.Select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="">All Dates</option>
              <option value="active">Currently Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
              <option value="recent">Last 30 Days</option>
              <option value="older">Older than 30 Days</option>
            </Form.Select>
          </div>
        </div>
      </div>
      
      {/* Rentals Tabs */}
      <Tabs defaultActiveKey="all" className="mb-3">
        <Tab eventKey="all" title={`All Rentals (${filteredRentals.length})`}>
          {renderRentalsTable(filteredRentals)}
        </Tab>
        <Tab eventKey="pending" title={`Pending (${pendingRentals.length})`}>
          {renderRentalsTable(pendingRentals)}
        </Tab>
        <Tab eventKey="active" title={`Active (${activeRentals.length})`}>
          {renderRentalsTable(activeRentals)}
        </Tab>
        <Tab eventKey="completed" title={`Completed (${completedRentals.length})`}>
          {renderRentalsTable(completedRentals)}
        </Tab>
        <Tab eventKey="canceled" title={`Canceled (${canceledRentals.length})`}>
          {renderRentalsTable(canceledRentals)}
        </Tab>
      </Tabs>
      
      {/* Approve Modal */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Approve Rental</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to approve the rental request for 
            <strong> "{selectedRental?.book_title}"</strong> by <strong>{selectedRental?.renter_name}</strong>?
          </p>
          <p>
            The book will be marked as rented and won't be available for other users.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleApproveRental}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Approve Rental'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Cancel Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Rental</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to cancel the rental for 
            <strong> "{selectedRental?.book_title}"</strong> by <strong>{selectedRental?.renter_name}</strong>?
          </p>
          <p>
            This action cannot be undone. The renter will need to submit a new request.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Go Back
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelRental}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Cancel Rental'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Complete Modal */}
      <Modal show={showCompleteModal} onHide={() => setShowCompleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Complete Rental</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you confirming that <strong>"{selectedRental?.book_title}"</strong> has been returned by <strong>{selectedRental?.renter_name}</strong>?
          </p>
          <p>
            The book will be marked as available again and the rental will be completed.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCompleteRental}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Complete Rental'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageRentals;