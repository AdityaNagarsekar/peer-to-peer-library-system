import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-4">
      <Container>
        <Row>
          <Col md={6} className="mb-3 mb-md-0">
            <h5>Peer-to-Peer Library System</h5>
            <p className="mb-0">Share your books with fellow students and borrow books from others.</p>
          </Col>
          <Col md={3} className="mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-white">Home</a></li>
              <li><a href="/books" className="text-white">Browse Books</a></li>
              <li><a href="/about" className="text-white">About Us</a></li>
              <li><a href="/contact" className="text-white">Contact</a></li>
            </ul>
          </Col>
          <Col md={3}>
            <h5>Contact</h5>
            <ul className="list-unstyled">
              <li>Email: library@example.com</li>
              <li>Phone: +123 456 7890</li>
            </ul>
          </Col>
        </Row>
        <hr className="my-3" />
        <div className="text-center">
          <p className="mb-0">&copy; {new Date().getFullYear()} Peer-to-Peer Library System. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;