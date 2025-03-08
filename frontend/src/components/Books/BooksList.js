import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Badge, Alert, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BookService } from '../../services/api.service';
import { FaSearch, FaBook } from 'react-icons/fa';

const BooksList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(8);
  
  useEffect(() => {
    // Fetch books when the component mounts
    fetchBooks();
  }, []);
  
  useEffect(() => {
    // Apply filters when books, searchTerm, or filters change
    applyFilters();
  }, [books, searchTerm, categoryFilter, availabilityFilter]);
  
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await BookService.getAllBooks();
      setBooks(response.data.results || response.data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.results
        ? response.data.results.map(book => book.category).filter(Boolean)
        : response.data.map(book => book.category).filter(Boolean))];
      
      setCategories(uniqueCategories);
    } catch (err) {
      setError('Failed to fetch books. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...books];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(search) || 
        book.author.toLowerCase().includes(search) ||
        (book.category && book.category.toLowerCase().includes(search))
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(book => book.category === categoryFilter);
    }
    
    // Apply availability filter
    if (availabilityFilter) {
      filtered = filtered.filter(book => book.status === availabilityFilter);
    }
    
    setFilteredBooks(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Get current books for pagination
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Generate pagination items
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const paginationItems = [];
  
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item key={number} active={number === currentPage} onClick={() => paginate(number)}>
        {number}
      </Pagination.Item>,
    );
  }
  
  // Get status badge variant
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
  
  return (
    <Container>
      <h2 className="mb-4">Browse Books</h2>
      
      {/* Search and Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup className="mb-3">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by title, author, or category"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Select 
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                >
                  <option value="">All Availability</option>
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="unavailable">Unavailable</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          {currentBooks.length === 0 ? (
            <Alert variant="info">
              No books found. Try adjusting your search filters or check back later.
            </Alert>
          ) : (
            <>
              <Row>
                {currentBooks.map((book) => (
                  <Col md={3} key={book.id} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Badge bg={getStatusBadgeVariant(book.status)}>
                            {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                          </Badge>
                          {book.category && (
                            <Badge bg="info">{book.category}</Badge>
                          )}
                        </div>
                        
                        <Card.Title>{book.title}</Card.Title>
                        <Card.Subtitle className="mb-3 text-muted">by {book.author}</Card.Subtitle>
                        
                        <Card.Text>
                          <small className="text-muted">Owner: {book.owner_name}</small>
                        </Card.Text>
                        
                        {book.isbn && (
                          <Card.Text>
                            <small className="text-muted">ISBN: {book.isbn}</small>
                          </Card.Text>
                        )}
                      </Card.Body>
                      <Card.Footer>
                        <Link to={`/books/${book.id}`} className="btn btn-primary btn-sm w-100">
                          View Details
                        </Link>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
              
              {/* Pagination */}
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                  <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                  {paginationItems}
                  <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                  <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
              </div>
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default BooksList;