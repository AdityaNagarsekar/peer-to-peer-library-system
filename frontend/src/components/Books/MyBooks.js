import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Badge, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import { BookService } from '../../services/api.service';
import { useAuth } from '../../contexts/AuthContext';

const MyBooks = () => {
  const { hasRole } = useAuth();
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Delete book modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [bookToUpdate, setBookToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  
  useEffect(() => {
    fetchMyBooks();
  }, []);
  
  const fetchMyBooks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await BookService.getMyBooks();
      setBooks(response.data);
    } catch (err) {
      setError('Failed to fetch your books. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const openDeleteModal = (book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };
  
  const openStatusModal = (book) => {
    setBookToUpdate(book);
    setNewStatus(book.status);
    setShowStatusModal(true);
  };
  
  const handleDeleteBook = async () => {
    if (!bookToDelete) return;
    
    try {
      setDeleteLoading(true);
      
      await BookService.deleteBook(bookToDelete.id);
      
      // Remove the deleted book from the list
      setBooks(books.filter(book => book.id !== bookToDelete.id));
      
      setShowDeleteModal(false);
    } catch (err) {
      setError('Failed to delete book. Please try again.');
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleUpdateStatus = async () => {
    if (!bookToUpdate) return;
    
    try {
      setUpdateLoading(true);
      
      await BookService.updateBook(bookToUpdate.id, { status: newStatus });
      
      // Update the book in the list
      setBooks(books.map(book => 
        book.id === bookToUpdate.id ? { ...book, status: newStatus } : book
      ));
      
      setShowStatusModal(false);
    } catch (err) {
      setError('Failed to update book status. Please try again.');
      console.error(err);
    } finally {
      setUpdateLoading(false);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Books</h2>
        <Button as={Link} to="/add-book" variant="primary">
          <FaPlus className="me-2" />
          Add New Book
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {books.length === 0 ? (
        <Alert variant="info">
          You don't have any books in your collection yet. Add your first book to get started.
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>
                    <Link to={`/books/${book.id}`}>{book.title}</Link>
                  </td>
                  <td>{book.author}</td>
                  <td>{book.category || '-'}</td>
                  <td>{getStatusBadge(book.status)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button 
                        as={Link}
                        to={`/books/${book.id}/edit`}
                        variant="primary"
                        size="sm"
                        title="Edit Book"
                      >
                        <FaEdit />
                      </Button>
                      
                      <Button 
                        variant="info"
                        size="sm"
                        onClick={() => openStatusModal(book)}
                        title="Change Status"
                      >
                        Status
                      </Button>
                      
                      {(hasRole('owner') || hasRole('admin')) && (
                        <Button 
                          variant="danger"
                          size="sm"
                          onClick={() => openDeleteModal(book)}
                          title="Delete Book"
                        >
                          <FaTrashAlt />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <FaExclamationTriangle className="text-warning" size={48} />
          </div>
          <p>
            Are you sure you want to delete the book "{bookToDelete?.title}"? 
            This action cannot be undone.
          </p>
          <p>
            <strong>Note:</strong> If there are active rentals for this book, those will be affected.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteBook}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Book'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Book Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Update the status for book "{bookToUpdate?.title}":
          </p>
          <Form.Group>
            <Form.Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="mb-3"
            >
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="unavailable">Unavailable</option>
            </Form.Select>
          </Form.Group>
          <Alert variant="info">
            <strong>Note:</strong>
            <ul className="mb-0">
              <li>Setting a book to "Available" will make it visible for rental requests.</li>
              <li>Setting a book to "Unavailable" will hide it from rental requests.</li>
              <li>The "Rented" status is usually managed automatically by the system when a rental is approved.</li>
            </ul>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateStatus}
            disabled={updateLoading}
          >
            {updateLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyBooks;