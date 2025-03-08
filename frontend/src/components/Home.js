import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBook, FaExchangeAlt, FaStar, FaUserFriends, FaSearch } from 'react-icons/fa';
import { BookService } from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Fetch some available books to feature on the homepage
    const fetchFeaturedBooks = async () => {
      try {
        setLoading(true);
        const response = await BookService.getAvailableBooks();
        setFeaturedBooks(response.data.slice(0, 6)); // Get up to 6 books
      } catch (err) {
        setError('Failed to fetch featured books.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedBooks();
  }, []);
  
  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-3">Peer-to-Peer Library</h1>
              <p className="lead mb-4">
                Share your books with fellow students and borrow books from others.
                Join our community of readers and expand your literary horizons.
              </p>
              
              <div className="d-flex gap-3">
                {isAuthenticated() ? (
                  <Button as={Link} to="/dashboard" variant="light" size="lg">
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button as={Link} to="/register" variant="light" size="lg">
                      Sign Up
                    </Button>
                    <Button as={Link} to="/login" variant="outline-light" size="lg">
                      Log In
                    </Button>
                  </>
                )}
              </div>
            </Col>
            <Col lg={6}>
              <div className="d-flex justify-content-center">
                <img 
                  src="/api/placeholder/600/400" 
                  alt="Library illustration" 
                  className="img-fluid rounded shadow" 
                  style={{ maxHeight: '400px' }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      
      {/* How It Works Section */}
      <Container className="my-5">
        <h2 className="text-center mb-5">How It Works</h2>
        
        <Row>
          <Col md={3} className="mb-4">
            <Card className="h-100 border-0 shadow-sm text-center">
              <Card.Body>
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '70px', height: '70px' }}>
                  <FaUserFriends size={30} />
                </div>
                <Card.Title>Sign Up</Card.Title>
                <Card.Text>
                  Create an account to start sharing and borrowing books.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} className="mb-4">
            <Card className="h-100 border-0 shadow-sm text-center">
              <Card.Body>
                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '70px', height: '70px' }}>
                  <FaBook size={30} />
                </div>
                <Card.Title>Add Books</Card.Title>
                <Card.Text>
                  Add books from your collection that you want to share.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} className="mb-4">
            <Card className="h-100 border-0 shadow-sm text-center">
              <Card.Body>
                <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '70px', height: '70px' }}>
                  <FaSearch size={30} />
                </div>
                <Card.Title>Browse Books</Card.Title>
                <Card.Text>
                  Search and browse books available from other users.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} className="mb-4">
            <Card className="h-100 border-0 shadow-sm text-center">
              <Card.Body>
                <div className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '70px', height: '70px' }}>
                  <FaExchangeAlt size={30} />
                </div>
                <Card.Title>Request & Share</Card.Title>
                <Card.Text>
                  Request books to borrow and approve requests for your books.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <div className="text-center mt-4">
          <Button as={Link} to="/register" variant="primary" size="lg">
            Get Started
          </Button>
        </div>
      </Container>
      
      {/* Featured Books Section */}
      <div className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-5">Featured Books</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center">Loading featured books...</div>
          ) : featuredBooks.length > 0 ? (
            <Row>
              {featuredBooks.map((book) => (
                <Col md={4} key={book.id} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <Card.Title>{book.title}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">by {book.author}</Card.Subtitle>
                      
                      {book.category && (
                        <div className="mb-2">
                          <span className="badge bg-info">{book.category}</span>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div>
                          <small className="text-muted">Owner: {book.owner_name}</small>
                        </div>
                        <Button as={Link} to={`/books/${book.id}`} variant="outline-primary" size="sm">
                          View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              No books available right now. Check back later or be the first to add books!
            </Alert>
          )}
          
          <div className="text-center mt-4">
            <Button as={Link} to="/books" variant="outline-primary" size="lg">
              Browse All Books
            </Button>
          </div>
        </Container>
      </div>
      
      {/* Testimonials Section */}
      <Container className="my-5">
        <h2 className="text-center mb-5">What Our Users Say</h2>
        
        <Carousel className="text-center bg-white p-4 shadow-sm rounded">
          <Carousel.Item>
            <div className="d-flex justify-content-center mb-3">
              <div className="text-warning d-flex">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
              </div>
            </div>
            <blockquote className="blockquote">
              <p className="mb-0">
                "This platform has transformed how I access books for my studies. I've saved money and found rare academic texts that weren't available in our university library."
              </p>
              <footer className="blockquote-footer mt-2">
                Sarah J., Engineering Student
              </footer>
            </blockquote>
          </Carousel.Item>
          
          <Carousel.Item>
            <div className="d-flex justify-content-center mb-3">
              <div className="text-warning d-flex">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
              </div>
            </div>
            <blockquote className="blockquote">
              <p className="mb-0">
                "I had so many books collecting dust on my shelf. Now they're being read by others while I get to explore new titles. The peer-to-peer model just makes sense!"
              </p>
              <footer className="blockquote-footer mt-2">
                Alex M., Literature Major
              </footer>
            </blockquote>
          </Carousel.Item>
          
          <Carousel.Item>
            <div className="d-flex justify-content-center mb-3">
              <div className="text-warning d-flex">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
              </div>
            </div>
            <blockquote className="blockquote">
              <p className="mb-0">
                "The community built around this library system is amazing. I've connected with other students who share my interests and discovered books I never would have found otherwise."
              </p>
              <footer className="blockquote-footer mt-2">
                David K., Computer Science Student
              </footer>
            </blockquote>
          </Carousel.Item>
        </Carousel>
      </Container>
      
      {/* Join Now Section */}
      <div className="bg-primary text-white py-5">
        <Container className="text-center">
          <h2 className="mb-4">Ready to Join Our Community?</h2>
          <p className="lead mb-4">
            Start sharing and borrowing books with fellow students today!
          </p>
          
          <div className="d-flex justify-content-center gap-3">
            {isAuthenticated() ? (
              <Button as={Link} to="/dashboard" variant="light" size="lg">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button as={Link} to="/register" variant="light" size="lg">
                  Sign Up Now
                </Button>
                <Button as={Link} to="/login" variant="outline-light" size="lg">
                  Log In
                </Button>
              </>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Home;