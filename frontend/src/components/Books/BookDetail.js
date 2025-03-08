import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Button, 
  Spinner, 
  Alert, 
  Tabs, 
  Tab, 
  Form, 
  Modal 
} from 'react-bootstrap';
import { FaStar, FaRegStar, FaEdit, FaTrashAlt, FaBookReader } from 'react-icons/fa';
import { BookService, RentalService, ReviewService } from '../../services/api.service';
import { useAuth } from '../../contexts/AuthContext';

const BookDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userReview, setUserReview] = useState(null);
  
  // Rental state
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rentalLoading, setRentalLoading] = useState(false);
  const [rentalError, setRentalError] = useState('');
  
  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [isEditingReview, setIsEditingReview] = useState(false);
  
  useEffect(() => {
    fetchBookDetails();
  }, [id]);
  
  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch book details
      const bookResponse = await BookService.getBook(id);
      setBook(bookResponse.data);
      
      // Fetch book reviews
      const reviewsResponse = await BookService.getBookReviews(id);
      setReviews(reviewsResponse.data);
      
      // Check if user has already reviewed this book
      if (isAuthenticated() && user) {
        const userReviewFound = reviewsResponse.data.find(review => review.user === user.id);
        if (userReviewFound) {
          setUserReview(userReviewFound);
          setRating(userReviewFound.rating);
          setComment(userReviewFound.comment || '');
        }
      }
    } catch (err) {
      setError('Failed to load book details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRequestRental = async (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      setRentalError('Please select both start and end dates.');
      return;
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    if (start < today) {
      setRentalError('Start date cannot be in the past.');
      return;
    }
    
    if (end <= start) {
      setRentalError('End date must be after start date.');
      return;
    }
    
    try {
      setRentalLoading(true);
      setRentalError('');
      
      await RentalService.createRental({
        book: book.id,
        start_date: startDate,
        end_date: endDate
      });
      
      setShowRentalModal(false);
      // Show success message or refresh data
      fetchBookDetails();
    } catch (err) {
      setRentalError(err.response?.data?.detail || 'Failed to request rental. Please try again.');
    } finally {
      setRentalLoading(false);
    }
  };
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 5) {
      setReviewError('Rating must be between 1 and 5.');
      return;
    }
    
    try {
      setReviewLoading(true);
      setReviewError('');
      
      if (isEditingReview && userReview) {
        // Update existing review
        await ReviewService.updateReview(userReview.id, {
          rating,
          comment
        });
      } else {
        // Create new review
        await ReviewService.createReview({
          book: book.id,
          rating,
          comment
        });
      }
      
      setShowReviewModal(false);
      // Refresh reviews
      fetchBookDetails();
    } catch (err) {
      setReviewError(err.response?.data?.detail || 'Failed to submit review. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };
  
  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }
    
    try {
      await ReviewService.deleteReview(userReview.id);
      setUserReview(null);
      // Refresh reviews
      fetchBookDetails();
    } catch (err) {
      alert('Failed to delete review. Please try again.');
    }
  };
  
  const openReviewModal = (isEditing = false) => {
    setIsEditingReview(isEditing);
    if (isEditing && userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment || '');
    } else {
      setRating(5);
      setComment('');
    }
    setShowReviewModal(true);
  };
  
  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'available':
        return 'success';
      case 'rented':
        return 'warning';
      case 'unavailable':
        return 'danger';
      default:
        return 'secondary';
    }
  };
  
  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings yet';
  
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
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
        <Button as={Link} to="/books" variant="secondary">Back to Books</Button>
      </Container>
    );
  }
  
  if (!book) {
    return (
      <Container className="my-5">
        <Alert variant="warning">Book not found</Alert>
        <Button as={Link} to="/books" variant="secondary">Back to Books</Button>
      </Container>
    );
  }
  
  return (
    <Container className="my-4">
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <Badge bg={getStatusBadgeVariant(book.status)} className="mb-2">
                  {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                </Badge>
                {book.category && (
                  <Badge bg="info">{book.category}</Badge>
                )}
              </div>
              
              <Card.Title as="h2">{book.title}</Card.Title>
              <Card.Subtitle className="mb-3 text-muted">by {book.author}</Card.Subtitle>
              
              <div className="mb-3">
                <strong>Owner:</strong> {book.owner_name}
              </div>
              
              {book.isbn && (
                <div className="mb-3">
                  <strong>ISBN:</strong> {book.isbn}
                </div>
              )}
              
              <div className="mb-3">
                <strong>Rating:</strong> {averageRating} 
                <small className="text-muted"> ({reviews.length} reviews)</small>
              </div>
              
              {/* Action Buttons */}
              <div className="d-grid gap-2 mt-4">
                {isAuthenticated() && book.status === 'available' && book.owner !== user?.id && (
                  <Button 
                    variant="primary" 
                    onClick={() => setShowRentalModal(true)}
                    disabled={!hasRole('renter') && !hasRole('admin')}
                  >
                    <FaBookReader className="me-2" />
                    Request Rental
                  </Button>
                )}
                
                {isAuthenticated() && (
                  userReview ? (
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-primary" 
                        className="flex-grow-1"
                        onClick={() => openReviewModal(true)}
                      >
                        <FaEdit className="me-1" />
                        Edit Review
                      </Button>
                      <Button 
                        variant="outline-danger"
                        onClick={handleDeleteReview}
                      >
                        <FaTrashAlt />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline-primary" 
                      onClick={() => openReviewModal(false)}
                    >
                      <FaStar className="me-2" />
                      Add Review
                    </Button>
                  )
                )}
                
                {isAuthenticated() && (book.owner === user?.id || hasRole('admin')) && (
                  <Button 
                    as={Link} 
                    to={`/books/${book.id}/edit`} 
                    variant="secondary"
                  >
                    <FaEdit className="me-2" />
                    Edit Book
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Tabs defaultActiveKey="reviews" className="mb-4">
            <Tab eventKey="reviews" title="Reviews">
              {reviews.length === 0 ? (
                <Alert variant="info">No reviews yet. Be the first to review this book!</Alert>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} className="mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="mb-2">
                            {[...Array(5)].map((_, index) => (
                              <span key={index}>
                                {index < review.rating ? (
                                  <FaStar className="text-warning" />
                                ) : (
                                  <FaRegStar className="text-muted" />
                                )}
                              </span>
                            ))}
                            <span className="ms-2 text-muted">
                              {review.rating}/5
                            </span>
                          </div>
                          <div className="fw-bold">{review.user_name}</div>
                        </div>
                      </div>
                      
                      {review.comment && (
                        <p className="mt-3 mb-0">{review.comment}</p>
                      )}
                    </Card.Body>
                  </Card>
                ))
              )}
            </Tab>
          </Tabs>
        </Col>
      </Row>
      
      {/* Rental Request Modal */}
      <Modal show={showRentalModal} onHide={() => setShowRentalModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Rental for "{book.title}"</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {rentalError && <Alert variant="danger">{rentalError}</Alert>}
          
          <Form onSubmit={handleRequestRental}>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </Form.Group>
            
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" disabled={rentalLoading}>
                {rentalLoading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditingReview ? 'Edit Your Review' : 'Add Review'} for "{book.title}"
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewError && <Alert variant="danger">{reviewError}</Alert>}
          
          <Form onSubmit={handleSubmitReview}>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <div className="d-flex align-items-center">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <span 
                      key={index}
                      className="me-2 fs-3"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setRating(ratingValue)}
                    >
                      {ratingValue <= rating ? (
                        <FaStar className="text-warning" />
                      ) : (
                        <FaRegStar className="text-muted" />
                      )}
                    </span>
                  );
                })}
                <span className="ms-2">{rating}/5</span>
              </div>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Comment (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Form.Group>
            
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" disabled={reviewLoading}>
                {reviewLoading ? 'Submitting...' : (isEditingReview ? 'Update Review' : 'Submit Review')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default BookDetail;