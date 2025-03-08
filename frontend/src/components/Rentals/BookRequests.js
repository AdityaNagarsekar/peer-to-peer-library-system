import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Badge, Tabs, Tab, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaBook, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { RentalService } from '../../services/api.service';

const BookRequests = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Approval modal
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rentalToApprove, setRentalToApprove] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);
  
  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rentalToReject, setRentalToReject] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  
  useEffect(() => {
    fetchBookRentals();
  }, []);
  
  const fetchBookRentals = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await RentalService.getMyBookRentals();
      setRentals(response.data);
    } catch (err) {
      setError('Failed to fetch rental requests. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const openApproveModal = (rental) => {
    setRentalToApprove(rental);
    setShowApproveModal(true);
  };
  
  const openRejectModal = (rental) => {
    setRentalToReject(rental);
    setShowRejectModal(true);
  };
  
  const handleApproveRental = async () => {
    if (!rentalToApprove) return;
    
    try {
      setApproveLoading(true);
      
      await RentalService.approveRental(rentalToApprove.id);
      
      // Update the rental status in the list
      setRentals(rentals.map(rental => 
        rental.id === rentalToApprove.id ? { ...rental, status: 'approved' } : rental
      ));
      
      setShowApproveModal(false);
    } catch (err) {
      setError('Failed to approve rental. Please try again.');
      console.error(err);
    } finally {
      setApproveLoading(false);
    }
  };
  
  const handleRejectRental = async () => {
    if (!rentalToReject) return;
    
    try {
      setRejectLoading(true);
      
      await RentalService.cancelRental(rentalToReject.id);
      
      // Update the rental status in the list
      setRentals(rentals.map(rental => 
        rental.id === rentalToReject.id ? { ...rental, status: 'canceled' } : rental
      ));
      
      setShowRejectModal(false);
    } catch (err) {
      setError('Failed to reject rental. Please try again.');
      console.error(err);
    } finally {
      setRejectLoading(false);
    }
  };
  
  const handleCompleteRental = async (rental) => {
    try {
      await RentalService.completeRental(rental.id);
      
      // Update the rental status in the list
      setRentals(rentals.map(r => 
        r.id === rental.id ? { ...r, status: 'completed' } : r
      ));
    } catch (err) {
      setError('Failed to mark rental as complete. Please try again.');
      console.error(err);
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
  
  // Filter rentals by status
  const pendingRentals = rentals.filter(rental => rental.status === 'pending');
  const activeRentals = rentals.filter(rental => rental.status === 'approved');
  const completedRentals = rentals.filter(rental => rental.status === 'completed' || rental.status === 'canceled');
  
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  const renderRentalsList = (rentalsList, showApproveReject = false, showComplete = false) => {
    return rentalsList.length === 0 ? (
      <Alert variant="info">No rental requests found.</Alert>
    ) : (
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Book</th>
              <th>Renter</th>
              <th>Period</th>
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
                <td>
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="me-2" />
                    {new Date(rental.start_date).toLocaleDateString()} to {new Date(rental.end_date).toLocaleDateString()}
                  </div>
                </td>
                <td>{getStatusBadge(rental.status)}</td>
                <td>
                  <div className="d-flex gap-2">
                    {showApproveReject && (
                      <>
                        <Button 
                          variant="success"
                          size="sm"
                          onClick={() => openApproveModal(rental)}
                          title="Approve Request"
                        >
                          <FaCheckCircle className="me-1" />
                          Approve
                        </Button>
                        
                        <Button 
                          variant="danger"
                          size="sm"
                          onClick={() => openRejectModal(rental)}
                          title="Reject Request"
                        >
                          <FaTimesCircle className="me-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {showComplete && (
                      <Button 
                        variant="primary"
                        size="sm"
                        onClick={() => handleCompleteRental(rental)}
                        title="Mark as Returned"
                      >
                        <FaCheckCircle className="me-1" />
                        Mark Returned
                      </Button>
                    )}
                    
                    <Button 
                      as={Link}
                      to={`/rentals/${rental.id}`}
                      variant="info"
                      size="sm"
                      title="View Details"
                    >
                      Details
                    </Button>
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
      <h2 className="mb-4">Book Rental Requests</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tabs defaultActiveKey="pending" className="mb-4">
        <Tab eventKey="pending" title={`Pending Requests (${pendingRentals.length})`}>
          {renderRentalsList(pendingRentals, true, false)}
        </Tab>
        <Tab eventKey="active" title={`Active Rentals (${activeRentals.length})`}>
          {renderRentalsList(activeRentals, false, true)}
        </Tab>
        <Tab eventKey="history" title="Rental History">
          {renderRentalsList(completedRentals, false, false)}
        </Tab>
      </Tabs>
      
      {/* Approve Rental Modal */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Approve Rental Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are about to approve the request from <strong>{rentalToApprove?.renter_name}</strong> to rent your book 
            <strong> "{rentalToApprove?.book_title}"</strong>.
          </p>
          <p>
            The rental period is from <strong>{rentalToApprove && new Date(rentalToApprove.start_date).toLocaleDateString()}</strong> to <strong>{rentalToApprove && new Date(rentalToApprove.end_date).toLocaleDateString()}</strong>.
          </p>
          <Alert variant="info">
            Approving this request will mark your book as "Rented" and it won't be available for other rental requests during this period.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleApproveRental}
            disabled={approveLoading}
          >
            {approveLoading ? 'Approving...' : 'Approve Request'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Reject Rental Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Rental Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are about to reject the request from <strong>{rentalToReject?.renter_name}</strong> to rent your book 
            <strong> "{rentalToReject?.book_title}"</strong>.
          </p>
          <Alert variant="warning">
            This action cannot be undone. The renter will need to submit a new request if they still want to rent this book.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleRejectRental}
            disabled={rejectLoading}
          >
            {rejectLoading ? 'Rejecting...' : 'Reject Request'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookRequests;