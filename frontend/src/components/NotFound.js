import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaBook, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container className="py-5 my-5 text-center">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="mb-4">
            <div className="display-1 fw-bold text-primary">404</div>
            <h1 className="mb-4">Page Not Found</h1>
            <p className="lead">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="mb-5">
            <p>
              You might want to check the URL, go back to the homepage, 
              or browse our library.
            </p>
          </div>
          
          <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
            <Button as={Link} to="/" variant="primary">
              <FaHome className="me-2" />
              Go to Homepage
            </Button>
            <Button as={Link} to="/books" variant="outline-primary">
              <FaBook className="me-2" />
              Browse Books
            </Button>
            <Button as={Link} to="/dashboard" variant="outline-secondary">
              <FaSearch className="me-2" />
              Go to Dashboard
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;