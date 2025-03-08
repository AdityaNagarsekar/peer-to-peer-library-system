import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, ListGroup, Modal } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaBook, 
  FaUser, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaTimesCircle,
  FaArrowLeft
} from 'react-icons/fa';
import { RentalService, PaymentService } from '../../services/api.service';
import { useAuth } from '../../contexts/AuthContext';

const RentalDetail = () => {
  const { id } = useParams();
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  
  const [rental, setRental] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Action modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Action loading states
  const [actionLoading, setActionLoading] = useState(false);
  
  useEffect(() => {
    fetchRentalDetails();
  }, [id]);
  
  const fetchRentalDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch rental details
      const rentalResponse = await RentalService.getRental(id);
      setRental(rentalResponse.data);
      
      // Try to fetch payment details if exists
      try {
        const paymentsResponse = await PaymentService.getAllPayments();
        const relatedPayment = paymentsResponse.data.find(
          p => p.rental === parseInt(id)
        );
        
        if (relatedPayment) {
          setPayment(relatedPayment);
        }
      } catch (err) {
        console.error('Error fetching payment details:', err);
      }
    } catch (err) {
      setError('Failed to load rental details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveRental = async () => {
    try {
      setActionLoading(true);
      
      await RentalService.approveRental(id);
      
      // Refresh rental details
      fetchRentalDetails();
      setShowApproveModal(false);
    } catch (err) {
      setError('Failed to approve rental. Please try again.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleCancelRental = async () => {
    try {
      setActionLoading(true);
      
      await RentalService.cancelRental(id);
      
      // Refresh rental details
      fetchRentalDetails();
      setShowCancelModal(false);
    } catch (err) {
      setError('Failed to cancel rental. Please try again.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleCompleteRental = async () => {
    try {
      setActionLoading(true);
      
      await RentalService.completeRental(id);
      
      // Refresh rental details
      fetchRentalDetails();
      setShowCompleteModal(false);
    } catch (err) {
      setError('Failed to complete rental. Please try again.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleMakePayment = async () => {
    try {
      setActionLoading(true);
      
      // Create a payment for the rental
      await PaymentService.createPayment({
        rental: parseInt(id),
        amount: 5.00, // Sample amount
        status: 'completed'
      });
      
      // Refresh rental details
      fetchRentalDetails();
      setShowPaymentModal(false);
    } catch (err) {
      setError('Failed to process payment. Please try again.');
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
  
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      case 'failed':
        return <Badge bg="danger">Failed</Badge>;
      case 'refunded':
        return <Badge bg="info">Refunded</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  // Check if user is the renter
  const isRenter = user && rental && user.id === rental.renter;
  
  // Check if user is the book owner
  const isBookOwner = user && rental && user.id === rental.book_owner;
  
  // Determine if user can perform specific actions
  const canApprove = (isBookOwner || hasRole('admin')) && rental && rental.status === 'pending';
  const canCancel = ((isRenter || isBookOwner || hasRole('admin')) && 
                    rental && ['pending', 'approved'].includes(rental.status));
  const canComplete = (isBookOwner || hasRole('admin')) && rental && rental.status === 'approved';
  const canPay = isRenter && rental && rental.status === 'approved' && (!payment || payment.status !== 'completed');
  
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="my-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" />
          Go Back
        </Button>
      </Container>
    );
  }
  
  if (!rental) {
    return (
      <Container className="my-4">
        <Alert variant="warning">Rental not found.</Alert>
        <Button variant="primary" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" />
          Go Back
        </Button>
      </Container>
    );
  }
  
  return (
    <Container className="my-4">
      <div className="mb-4">
        <Button variant="outline-primary" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" />
          Back
        </Button>
      </div>
      
      <h2 className="mb-4">Rental Details</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Rental Information</h5>
                {getStatusBadge(rental.status)}
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <div className="mb-3">
                    <div className="text-muted mb-1">Book</div>
                    <div className="d-flex align-items-center">
                      <FaBook className="me-2 text-primary" />
                      <Link to={`/books/${rental.book}`} className="text-decoration-none">
                        <strong>{rental.book_title}</strong>
                      </Link>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-muted mb-1">Rental Period</div>
                    <div className="d-flex align-items-center">
                      <FaCalendarAlt className="me-2 text-success" />
                      {new Date(rental.start_date).toLocaleDateString()} to {new Date(rental.end_date).toLocaleDateString()}
                    </div>
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className="mb-3">
                    <div className="text-muted mb-1">Renter</div>
                    <div className="d-flex align-items-center">
                      <FaUser className="me-2 text-info" />
                      <strong>{rental.renter_name}</strong>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-muted mb-1">Book Owner</div>
                    <div className="d-flex align-items-center">
                      <FaUser className="me-2 text-warning" />
                      <strong>{rental.owner_name || 'Unknown'}</strong>
                    </div>
                  </div>
                </Col>
              </Row>
              
              {/* Rental Timeline/History */}
              <h6 className="mb-3">Rental Timeline</h6>
              <ListGroup variant="flush" className="mb-3">
                <ListGroup.Item className="d-flex justify-content-between align-items-start">
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">Rental Requested</div>
                    Initial request submitted
                  </div>
                  <Badge bg="secondary" pill>
                    {new Date(rental.created_at || rental.start_date).toLocaleDateString()}
                  </Badge>
                </ListGroup.Item>
                
                {rental.status !== 'pending' && (
                  <ListGroup.Item className="d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">
                        {rental.status === 'canceled' ? 'Rental Canceled' : 'Rental Approved'}
                      </div>
                      {rental.status === 'canceled' ? 'Request was canceled' : 'Owner approved the request'}
                    </div>
                    <Badge bg={rental.status === 'canceled' ? 'danger' : 'success'} pill>
                      {/* This would ideally come from the backend */}
                      {new Date(rental.updated_at || rental.start_date).toLocaleDateString()}
                    </Badge>
                  </ListGroup.Item>
                )}
                
                {rental.status === 'completed' && (
                  <ListGroup.Item className="d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">Rental Completed</div>
                      Book was returned to owner
                    </div>
                    <Badge bg="primary" pill>
                      {/* This would ideally come from the backend */}
                      {new Date(rental.completed_at || rental.end_date).toLocaleDateString()}
                    </Badge>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
          
          {/* Payment Section */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Payment Information</h5>
            </Card.Header>
            <Card.Body>
              {payment ? (
                <div>
                  <Row className="mb-3">
                    <Col md={6}>
                      <div className="text-muted mb-1">Amount</div>
                      <div className="d-flex align-items-center">
                        <FaMoneyBillWave className="me-2 text-success" />
                        <strong>${payment.amount.toFixed(2)}</strong>
                      </div>
                    </Col>
                    
                    <Col md={6}>
                      <div className="text-muted mb-1">Payment Status</div>
                      <div>
                        {getPaymentStatusBadge(payment.status)}
                      </div>
                    </Col>
                  </Row>
                  
                  {payment.transaction_id && (
                    <div>
                      <div className="text-muted mb-1">Transaction ID</div>
                      <div>
                        <code>{payment.transaction_id}</code>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Alert variant="info">
                    {rental.status === 'approved' ? (
                      <>
                        No payment has been made for this rental yet.
                        {canPay && (
                          <div className="mt-2">
                            <Button 
                              variant="success" 
                              onClick={() => setShowPaymentModal(true)}
                              size="sm"
                            >
                              <FaMoneyBillWave className="me-1" />
                              Make Payment
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      rental.status === 'pending' ? (
                        'Payment will be available after the rental is approved.'
                      ) : (
                        'No payment information available for this rental.'
                      )
                    )}
                  </Alert>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          {/* Actions Card */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                {canApprove && (
                  <Button 
                    variant="success" 
                    onClick={() => setShowApproveModal(true)}
                  >
                    <FaCheckCircle className="me-1" />
                    Approve Rental
                  </Button>
                )}
                
                {canCancel && (
                  <Button 
                    variant="danger" 
                    onClick={() => setShowCancelModal(true)}
                  >
                    <FaTimesCircle className="me-1" />
                    {isRenter ? 'Cancel My Request' : 'Reject Request'}
                  </Button>
                )}
                
                {canComplete && (
                  <Button 
                    variant="primary" 
                    onClick={() => setShowCompleteModal(true)}
                  >
                    <FaCheckCircle className="me-1" />
                    Mark as Returned
                  </Button>
                )}
                
                {canPay && (
                  <Button 
                    variant="success" 
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <FaMoneyBillWave className="me-1" />
                    Make Payment
                  </Button>
                )}
                
                <Button 
                  as={Link}
                  to={`/books/${rental.book}`}
                  variant="outline-primary"
                >
                  <FaBook className="me-1" />
                  View Book Details
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          {/* Additional Information Card */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Rental Notes</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="secondary">
                {rental.status === 'pending' && (
                  <>
                    <h6>Pending Approval</h6>
                    <p>
                      This rental request is waiting for the book owner's approval.
                      The book will be reserved once approved.
                    </p>
                  </>
                )}
                
                {rental.status === 'approved' && (
                  <>
                    <h6>Rental Active</h6>
                    <p>
                      This rental has been approved. The book should be exchanged
                      according to the agreed terms. The owner will mark the book
                      as returned once it's back.
                    </p>
                  </>
                )}
                
                {rental.status === 'completed' && (
                  <>
                    <h6>Rental Completed</h6>
                    <p>
                      This rental has been completed. The book has been returned
                      to the owner. Thank you for using our platform!
                    </p>
                  </>
                )}
                
                {rental.status === 'canceled' && (
                  <>
                    <h6>Rental Canceled</h6>
                    <p>
                      This rental request was canceled and is no longer active.
                    </p>
                  </>
                )}
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Approve Modal */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Approve Rental Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to approve this rental request for 
            <strong> "{rental.book_title}"</strong>?
          </p>
          <p>
            The book will be marked as rented and won't be available for other requests
            during this period.
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
            {actionLoading ? 'Processing...' : 'Approve Request'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Cancel Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isRenter ? 'Cancel Rental Request' : 'Reject Rental Request'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to {isRenter ? 'cancel' : 'reject'} this rental for 
            <strong> "{rental.book_title}"</strong>?
          </p>
          <p>
            {isRenter
              ? 'Your request will be canceled and you will need to submit a new request if you change your mind.'
              : 'The request will be rejected and the renter will need to submit a new request if they still want to rent this book.'}
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
            {actionLoading ? 'Processing...' : (isRenter ? 'Cancel Request' : 'Reject Request')}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Complete Modal */}
      <Modal show={showCompleteModal} onHide={() => setShowCompleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Mark Rental as Complete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you confirming that <strong>"{rental.book_title}"</strong> has been returned?
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
            {actionLoading ? 'Processing...' : 'Confirm Return'}
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
            <strong> "{rental.book_title}"</strong>.
          </p>
          <div className="mb-3">
            <strong>Book:</strong> {rental.book_title}
          </div>
          <div className="mb-3">
            <strong>Rental Period:</strong> {`${new Date(rental.start_date).toLocaleDateString()} to ${new Date(rental.end_date).toLocaleDateString()}`}
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
            onClick={handleMakePayment}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Complete Payment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RentalDetail;