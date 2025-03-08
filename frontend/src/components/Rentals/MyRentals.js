import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Badge, Tabs, Tab, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { RentalService, PaymentService } from '../../services/api.service';
import { useAuth } from '../../contexts/AuthContext';

const MyRentals = () => {
  const { user } = useAuth();
  
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rentalToCancel, setRentalToCancel] = useState(null);
  const [cancelLoading, setcancelLoading] = useState(false);
  
  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [rentalToPayFor, setRentalToPayFor] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  useEffect(() => {
    fetchMyRentals();
  }, []);
  
  const fetchMyRentals = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await RentalService.getMyRentals();
      setRentals(response.data);
    } catch (err) {
      setError('Failed to fetch your rentals. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const openCancelModal = (rental) => {
    setRentalToCancel(rental);
    setShowCancelModal(true);
  };
  
  const openPaymentModal = (rental) => {
    setRentalToPayFor(rental);
    setShowPaymentModal(true);
  };
  
  const handleCancelRental = async () => {
    if (!rentalToCancel) return;
    
    try {
      setcancelLoading(true);
      
      await RentalService.cancelRental(rentalToCancel.id);
      
      // Update the rental status in the list
      setRentals(rentals.map(rental => 
        rental.id === rentalToCancel.id ? { ...rental, status: 'canceled' } : rental
      ));
      
      setShowCancelModal(false);
    } catch (err) {
      setError('Failed to cancel rental. Please try again.');
      console.error(err);
    } finally {
      setcancelLoading(false);
    }
  };
  
  const handleCompletePayment = async () => {
    if (!rentalToPayFor) return;
    
    try {
      setPaymentLoading(true);
      
      // Create a payment for the rental
      await PaymentService.createPayment({
        rental: rentalToPayFor.id,
        amount: 5.00, // Sample amount
        status: 'completed'
      });
      
      // Refresh rentals after payment
      fetchMyRentals();
      
      setShowPaymentModal(false);
    } catch (err) {
      setError('Failed to process payment. Please try again.');
      console.error(err);
    } finally {
      setPaymentLoading(false);
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
  
  const renderRentalsList = (rentalsList, showActions = true) => {
    return rentalsList.length === 0 ? (
      <Alert variant="info">No rentals found.</Alert>
    ) : (
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Book</th>
              <th>Owner</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rentalsList.map((rental) => (
              <tr key={rental.id}>
                <td>
                  <Link to={`/books/${rental.book}`}>{rental.book_title}</Link>
                </td>
                <td>{rental.owner_name || '-'}</td>
                <td>{new Date(rental.start_date).toLocaleDateString()}</td>
                <td>{new Date(rental.end_date).toLocaleDateString()}</td>
                <td>{getStatusBadge(rental.status)}</td>
                {showActions && (
                  <td>
                    <div className="d-flex gap-2">
                      {rental.status === 'pending' && (
                        <Button 
                          variant="danger"
                          size="sm"
                          onClick={() => openCancelModal(rental)}
                          title="Cancel Request"
                        >
                          <FaTimesCircle className="me-1" />
                          Cancel
                        </Button>
                      )}
                      
                      {rental.status === 'approved' && (
                        <>
                          <Button 
                            variant="success"
                            size="sm"
                            onClick={() => openPaymentModal(rental)}
                            title="Make Payment"
                          >
                            <FaCheckCircle className="me-1" />
                            Pay
                          </Button>
                        </>
                      )}
                      
                      <Button 
                        as={Link}
                        to={`/rentals/${rental.id}`}
                        variant="info"
                        size="sm"
                        title="View Details"
                      >
                        <FaInfoCircle className="me-1" />
                        Details
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };
  
  return (
    <Container className="my-4">
      <h2 className="mb-4">My Rentals</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tabs defaultActiveKey="active" className="mb-4">
        <Tab eventKey="pending" title={`Pending Requests (${pendingRentals.length})`}>
          {renderRentalsList(pendingRentals)}
        </Tab>
        <Tab eventKey="active" title={`Active Rentals (${activeRentals.length})`}>
          {renderRentalsList(activeRentals)}
        </Tab>
        <Tab eventKey="history" title="Rental History">
          {renderRentalsList(completedRentals, false)}
        </Tab>
      </Tabs>
      
      {/* Cancel Rental Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Rental Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to cancel your request to rent 
            "{rentalToCancel?.book_title}"?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Keep Request
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelRental}
            disabled={cancelLoading}
          >
            {cancelLoading ? 'Canceling...' : 'Cancel Request'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Make Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are about to make a payment for renting 
            "{rentalToPayFor?.book_title}".
          </p>
          <div className="mb-3">
            <strong>Book:</strong> {rentalToPayFor?.book_title}
          </div>
          <div className="mb-3">
            <strong>Rental Period:</strong> {rentalToPayFor && `${new Date(rentalToPayFor.start_date).toLocaleDateString()} to ${new Date(rentalToPayFor.end_date).toLocaleDateString()}`}
          </div>
          <div className="mb-3">
            <strong>Amount:</strong> $5.00 (Sample)
          </div>
          <Alert variant="info">
            This is a simulated payment for demonstration purposes only.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCompletePayment}
            disabled={paymentLoading}
          >
            {paymentLoading ? 'Processing...' : 'Complete Payment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyRentals;