import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { BookService } from '../../services/api.service';
import { useAuth } from '../../contexts/AuthContext';

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    status: 'available'
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([
    'Fiction', 'Non-Fiction', 'Science', 'Engineering', 'Mathematics', 
    'Computer Science', 'Literature', 'History', 'Philosophy',
    'Self-Help', 'Business', 'Biography', 'Other'
  ]);
  
  useEffect(() => {
    // If in edit mode, fetch the book details
    if (isEditMode) {
      fetchBookDetails();
    }
  }, [id]);
  
  const fetchBookDetails = async () => {
    try {
      setFetchLoading(true);
      setError('');
      
      const response = await BookService.getBook(id);
      
      // Populate form with book data
      setFormData({
        title: response.data.title || '',
        author: response.data.author || '',
        isbn: response.data.isbn || '',
        category: response.data.category || '',
        status: response.data.status || 'available'
      });
    } catch (err) {
      setError('Failed to load book details. Please try again.');
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validateForm = () => {
    if (!formData.title) {
      setError('Title is required');
      return false;
    }
    
    if (!formData.author) {
      setError('Author is required');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (isEditMode) {
        // Update existing book
        await BookService.updateBook(id, formData);
      } else {
        // Create new book
        await BookService.createBook(formData);
      }
      
      // Redirect to books list or book detail
      navigate(isEditMode ? `/books/${id}` : '/my-books');
    } catch (err) {
      if (err.response?.data) {
        // Format validation errors
        const errors = err.response.data;
        const errorMessages = Object.keys(errors).map(key => {
          return `${key}: ${errors[key].join(' ')}`;
        });
        setError(errorMessages.join('\n'));
      } else {
        setError(`Failed to ${isEditMode ? 'update' : 'create'} book. Please try again.`);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchLoading) {
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
            <Card.Header as="h4" className="text-center">
              {isEditMode ? 'Edit Book' : 'Add New Book'}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title*</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Author*</Form.Label>
                      <Form.Control
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>ISBN</Form.Label>
                      <Form.Control
                        type="text"
                        name="isbn"
                        value={formData.isbn}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Optional: International Standard Book Number
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                {isEditMode && (hasRole('admin') || hasRole('owner')) && (
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="available">Available</option>
                      <option value="rented">Rented</option>
                      <option value="unavailable">Unavailable</option>
                    </Form.Select>
                  </Form.Group>
                )}
                
                <div className="d-flex justify-content-between mt-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate(isEditMode ? `/books/${id}` : '/my-books')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (isEditMode ? 'Update Book' : 'Add Book')}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BookForm;