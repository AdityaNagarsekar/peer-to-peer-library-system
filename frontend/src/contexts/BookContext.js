import React, { createContext, useContext, useState, useEffect } from 'react';
import { BookService } from '../services/api.service';
import { useAuth } from './AuthContext';

// Create the context
const BookContext = createContext();

// Create a provider component
export const BookProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  const [allBooks, setAllBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load books when the component mounts and when auth state changes
  useEffect(() => {
    if (isAuthenticated()) {
      fetchBooks();
    } else {
      // Reset state when logged out
      setAllBooks([]);
      setAvailableBooks([]);
      setMyBooks([]);
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Fetch all book data
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all books
      const allBooksResponse = await BookService.getAllBooks();
      setAllBooks(allBooksResponse.data.results || allBooksResponse.data);
      
      // Fetch available books
      const availableBooksResponse = await BookService.getAvailableBooks();
      setAvailableBooks(availableBooksResponse.data);
      
      // Fetch my books (if authenticated)
      if (isAuthenticated()) {
        try {
          const myBooksResponse = await BookService.getMyBooks();
          setMyBooks(myBooksResponse.data);
        } catch (err) {
          console.error('Error fetching my books:', err);
        }
      }
    } catch (err) {
      setError('Failed to fetch books. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Add a new book
  const addBook = async (bookData) => {
    try {
      setError(null);
      const response = await BookService.createBook(bookData);
      
      // Update local state
      setAllBooks([...allBooks, response.data]);
      setMyBooks([...myBooks, response.data]);
      
      if (response.data.status === 'available') {
        setAvailableBooks([...availableBooks, response.data]);
      }
      
      return response.data;
    } catch (err) {
      setError('Failed to add book. Please try again.');
      console.error(err);
      throw err;
    }
  };
  
  // Update a book
  const updateBook = async (id, bookData) => {
    try {
      setError(null);
      const response = await BookService.updateBook(id, bookData);
      
      // Update local state
      setAllBooks(allBooks.map(book => book.id === id ? response.data : book));
      setMyBooks(myBooks.map(book => book.id === id ? response.data : book));
      
      // Handle status changes
      if (response.data.status === 'available') {
        if (!availableBooks.some(book => book.id === id)) {
          setAvailableBooks([...availableBooks, response.data]);
        } else {
          setAvailableBooks(availableBooks.map(book => book.id === id ? response.data : book));
        }
      } else {
        setAvailableBooks(availableBooks.filter(book => book.id !== id));
      }
      
      return response.data;
    } catch (err) {
      setError('Failed to update book. Please try again.');
      console.error(err);
      throw err;
    }
  };
  
  // Delete a book
  const deleteBook = async (id) => {
    try {
      setError(null);
      await BookService.deleteBook(id);
      
      // Update local state
      setAllBooks(allBooks.filter(book => book.id !== id));
      setMyBooks(myBooks.filter(book => book.id !== id));
      setAvailableBooks(availableBooks.filter(book => book.id !== id));
      
      return true;
    } catch (err) {
      setError('Failed to delete book. Please try again.');
      console.error(err);
      throw err;
    }
  };
  
  // Get a book by ID
  const getBook = async (id) => {
    try {
      setError(null);
      
      // First check if we already have this book in state
      let book = allBooks.find(book => book.id === parseInt(id));
      
      if (book) {
        return book;
      }
      
      // If not found, fetch from API
      const response = await BookService.getBook(id);
      return response.data;
    } catch (err) {
      setError('Failed to get book details. Please try again.');
      console.error(err);
      throw err;
    }
  };
  
  // Context value
  const value = {
    allBooks,
    availableBooks,
    myBooks,
    loading,
    error,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    getBook
  };
  
  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};

// Custom hook to use the book context
export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};