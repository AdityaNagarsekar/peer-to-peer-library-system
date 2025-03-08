import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaBook, 
  FaExchangeAlt, 
  FaStar, 
  FaUser, 
  FaPlus, 
  FaBell, 
  FaCheckCircle, 
  FaTimesCircle 
} from 'react-icons/fa';
import { BookService, RentalService, ReviewService } from '../../services/api.service';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    myBooks: [],
    myRentals: [],
    pendingRequests: [],
    recentReviews: [],
    stats: {
      totalBooks: 0,
      booksAvailable: 0,
      booksRented: 0,
      activeRentals: 0,
      pendingRentals: 0
    }
  });
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Create an object to hold all dashboard data
      const data = {
        myBooks: [],
        myRentals: [],
        pendingRequests: [],
        recentReviews: [],
        stats: {
          totalBooks: 0,
          booksAvailable: 0,
          booksRented: 0,
          activeRentals: 0,
          pendingRentals: 0
        }
      };
      
      // Fetch available books (for everyone)
      const availableBooksResponse = await BookService.getAvailableBooks();
      data.stats.booksAvailable = availableBooksResponse.data.length;
      
      // Fetch all books (for counts)
      const allBooksResponse = await BookService.getAllBooks();
      data.stats.totalBooks = allBooksResponse.data.results ? allBooksResponse.data.results.length : allBooksResponse.data.length;
      
      // For book owners, fetch their books
      if (hasRole('owner') || hasRole('admin')) {
        const myBooksResponse = await BookService.getMyBooks();
        data.myBooks = myBooksResponse.data.slice(0, 5); // Get only the first 5
        
        // Fetch requests for the owner's books
        const pendingRequestsResponse = await RentalService.getMyBookRentals();
        data.pendingRequests = pendingRequestsResponse.data
          .filter(rental => rental.status === 'pending')
          .slice(0, 5);
        
        data.stats.booksRented = myBooksResponse.data.filter(book => book.status === 'rented').length;
      }
      
      // For renters, fetch their rentals
      if (hasRole('renter') || hasRole('admin')) {
        const myRentalsResponse = await RentalService.getMyRentals();
        data.myRentals = myRentalsResponse.data.slice(0, 5);
        
        data.stats.activeRentals = myRentalsResponse.data.filter(rental => rental.status === 'approved').length;
        data.stats.pendingRentals = myRentalsResponse.data.filter(rental => rental.status === 'pending').length;
      }
      
      // Get recent reviews
      try {
        const myReviewsResponse = await ReviewService.getMyReviews();
        data.recentReviews = myReviewsResponse.data.slice(0, 3);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
      
      setDashboardData(data);
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge bg="success">Available</Badge>;
      case 'rented':
        return <Badge bg="warning">Rented</Badge>;
      case 'unavailable':
        return <Badge bg="danger">Unavailable</Badge>;
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
      <h2 className="mb-4">Dashboard</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Welcome Card */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={9}>
              <h4>Welcome, {user?.first_name || user?.username}!</h4>
              <p>
                Welcome to the Peer-to-Peer Library System. Here you can manage your books,
                rental requests, and keep track of your library activities.
              </p>
            </Col>
            <Col md={3} className="d-flex align-items-center justify-content-center">
              <div className="text-center">
                <FaUser size={40} className="text-primary mb-2" />
                <div>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'User'}</div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Stats Cards */}
      <h4 className="mb-3">Statistics</h4>
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">{dashboardData.stats.totalBooks}</h5>
                  <div className="text-muted">Total Books</div>
                </div>
                <FaBook className="text-primary" size={30} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">{dashboardData.stats.booksAvailable}</h5>
                  <div className="text-muted">Books Available</div>
                </div>
                <FaCheckCircle className="text-success" size={30} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        {(hasRole('owner') || hasRole('admin')) && (
          <Col md={3} sm={6} className="mb-3">
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">{dashboardData.stats.booksRented}</h5>
                    <div className="text-muted">Your Books Rented</div>
                  </div>
                  <FaExchangeAlt className="text-warning" size={30} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
        
        {(hasRole('renter') || hasRole('admin')) && (
          <Col md={3} sm={6} className="mb-3">
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">{dashboardData.stats.activeRentals}</h5>
                    <div className="text-muted">Active Rentals</div>
                  </div>
                  <FaBook className="text-info" size={30} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
      
      {/* Pending Requests Section (for Book Owners) */}
      {(hasRole('owner') || hasRole('admin')) && dashboardData.pendingRequests.length > 0 && (
        <>
          <h4 className="mb-3 d-flex align-items-center">
            <FaBell className="text-warning me-2" />
            Pending Rental Requests
            <Badge bg="info" className="ms-2">{dashboardData.pendingRequests.length}</Badge>
          </h4>
          <Card className="mb-4">
            <Card.Body>
              {dashboardData.pendingRequests.map((rental) => (
                <div key={rental.id} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                  <div>
                    <div className="fw-bold">{rental.book_title}</div>
                    <div className="text-muted">
                      Requested by {rental.renter_name} for {new Date(rental.start_date).toLocaleDateString()} to {new Date(rental.end_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Link to="/book-requests" className="btn btn-primary btn-sm">View</Link>
                  </div>
                </div>
              ))}
              
              <div className="d-flex justify-content-end mt-3">
                <Link to="/book-requests" className="btn btn-outline-primary">View All Requests</Link>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
      
      <Row>
        {/* My Books Section (for Book Owners) */}
        {(hasRole('owner') || hasRole('admin')) && (
          <Col md={6} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">My Books</h4>
              <Link to="/add-book" className="btn btn-outline-primary btn-sm">
                <FaPlus className="me-1" />
                Add Book
              </Link>
            </div>
            <Card>
              <Card.Body>
                {dashboardData.myBooks.length === 0 ? (
                  <Alert variant="info">
                    You haven't added any books yet. Start sharing your collection now!
                  </Alert>
                ) : (
                  <>
                    {dashboardData.myBooks.map((book) => (
                      <div key={book.id} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                        <div>
                          <div className="fw-bold">{book.title}</div>
                          <div className="text-muted">by {book.author}</div>
                        </div>
                        <div className="d-flex align-items-center">
                          {getStatusBadge(book.status)}
                          <Link to={`/books/${book.id}`} className="btn btn-link">View</Link>
                        </div>
                      </div>
                    ))}
                    
                    <div className="d-flex justify-content-end mt-3">
                      <Link to="/my-books" className="btn btn-outline-primary">View All Books</Link>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
        
        {/* My Rentals Section (for Renters) */}
        {(hasRole('renter') || hasRole('admin')) && (
          <Col md={6} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">My Rentals</h4>
              <Link to="/books" className="btn btn-outline-primary btn-sm">
                <FaPlus className="me-1" />
                Find Books
              </Link>
            </div>
            <Card>
              <Card.Body>
                {dashboardData.myRentals.length === 0 ? (
                  <Alert variant="info">
                    You don't have any active rentals. Browse our library to find books to rent!
                  </Alert>
                ) : (
                  <>
                    {dashboardData.myRentals.map((rental) => (
                      <div key={rental.id} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                        <div>
                          <div className="fw-bold">{rental.book_title}</div>
                          <div className="text-muted">
                            {new Date(rental.start_date).toLocaleDateString()} to {new Date(rental.end_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          {getStatusBadge(rental.status)}
                          <Link to={`/rentals/${rental.id}`} className="btn btn-link">View</Link>
                        </div>
                      </div>
                    ))}
                    
                    <div className="d-flex justify-content-end mt-3">
                      <Link to="/my-rentals" className="btn btn-outline-primary">View All Rentals</Link>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
      
      {/* Recent Activities Section */}
      <h4 className="mb-3">Quick Actions</h4>
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <FaBook className="mb-3 text-primary" size={30} />
              <h5>Browse Books</h5>
              <p>Explore our collection of available books.</p>
              <Link to="/books" className="btn btn-primary">Browse Library</Link>
            </Card.Body>
          </Card>
        </Col>
        
        {(hasRole('owner') || hasRole('admin')) && (
          <Col md={3} sm={6} className="mb-3">
            <Card className="h-100 text-center">
              <Card.Body>
                <FaPlus className="mb-3 text-success" size={30} />
                <h5>Add Book</h5>
                <p>Share a book from your collection.</p>
                <Link to="/add-book" className="btn btn-success">Add New Book</Link>
              </Card.Body>
            </Card>
          </Col>
        )}
        
        {(hasRole('owner') || hasRole('admin')) && (
          <Col md={3} sm={6} className="mb-3">
            <Card className="h-100 text-center">
              <Card.Body>
                <FaBell className="mb-3 text-warning" size={30} />
                <h5>Rental Requests</h5>
                <p>Manage requests for your books.</p>
                <Link to="/book-requests" className="btn btn-warning">View Requests</Link>
              </Card.Body>
            </Card>
          </Col>
        )}
        
        {(hasRole('renter') || hasRole('admin')) && (
          <Col md={3} sm={6} className="mb-3">
            <Card className="h-100 text-center">
              <Card.Body>
                <FaExchangeAlt className="mb-3 text-info" size={30} />
                <h5>My Rentals</h5>
                <p>View and manage your book rentals.</p>
                <Link to="/my-rentals" className="btn btn-info">My Rentals</Link>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Dashboard;