// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { BookService } from '../services/api.service';
// import { useAuth } from './AuthContext';

// // Create the context
// const BookContext = createContext();

// // Create a provider component
// export const BookProvider = ({ children }) => {
//   const { isAuthenticated, user } = useAuth(); // Get user object

//   const [allBooks, setAllBooks] = useState([]);
//   const [availableBooks, setAvailableBooks] = useState([]);
//   const [myBooks, setMyBooks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Wrap fetchBooks in useCallback to prevent unnecessary re-runs
//   const fetchBooks = useCallback(async (isInitialLoad = false) => {
//     // Only set loading true on initial load or explicit refresh
//     if (isInitialLoad) {
//         setLoading(true);
//     }
//     setError(null); // Clear previous errors on fetch
//     console.log("BookContext: Starting fetchBooks...");

//     try {
//       // Fetch all books - essential for total count and browse list
//       const allBooksResponse = await BookService.getAllBooks();
//       const fetchedAllBooks = allBooksResponse.data.results || allBooksResponse.data || [];
//       setAllBooks(fetchedAllBooks);
//       console.log("BookContext: Fetched All Books:", fetchedAllBooks);

//       // Filter available books from the fetched allBooks list
//       const fetchedAvailableBooks = fetchedAllBooks.filter(book => book.status === 'available');
//       setAvailableBooks(fetchedAvailableBooks);
//       console.log("BookContext: Derived Available Books:", fetchedAvailableBooks);

//       // Fetch my books only if authenticated
//       if (isAuthenticated() && user) { // Check user existence
//         try {
//           const myBooksResponse = await BookService.getMyBooks();
//           const fetchedMyBooks = myBooksResponse.data || [];
//           setMyBooks(fetchedMyBooks);
//           console.log("BookContext: Fetched My Books:", fetchedMyBooks);
//         } catch (err) {
//           // Don't fail the whole fetch if only 'my books' fails
//           console.error('BookContext: Error fetching my books:', err);
//           setMyBooks([]); // Reset myBooks on error
//         }
//       } else {
//         setMyBooks([]); // Clear myBooks if not authenticated
//       }

//     } catch (err) {
//       setError('Failed to fetch books. Please try again later.');
//       console.error("BookContext: fetchBooks Error:", err);
//       // Optionally reset states on major fetch error
//       // setAllBooks([]);
//       // setAvailableBooks([]);
//       // setMyBooks([]);
//     } finally {
//       // Only set loading false on initial load
//       if (isInitialLoad) {
//           setLoading(false);
//       }
//       console.log("BookContext: Finished fetchBooks.");
//     }
//   }, [isAuthenticated, user]); // Add user as dependency

//   // Load books when the component mounts and when auth state changes
//   useEffect(() => {
//     console.log("BookContext: Auth state changed, isAuthenticated:", isAuthenticated());
//     if (isAuthenticated()) {
//       fetchBooks(true); // Pass true for initial load flag
//     } else {
//       // Reset state when logged out
//       setAllBooks([]);
//       setAvailableBooks([]);
//       setMyBooks([]);
//       setError(null);
//       setLoading(false); // Ensure loading is false when logged out
//       console.log("BookContext: User logged out, resetting state.");
//     }
//   }, [isAuthenticated, fetchBooks]); // fetchBooks is now stable due to useCallback

//   // Add a new book - Revised
//   const addBook = async (bookData) => {
//     setError(null); // Clear previous error
//     console.log("BookContext: Attempting addBook with data:", bookData);
//     try {
//       const response = await BookService.createBook(bookData);
//       const newBook = response.data;
//       console.log("BookContext: addBook successful, API response:", newBook);

//       if (!newBook || !newBook.id) {
//           throw new Error("Invalid book data received from server after creation.");
//       }

//       // Use functional updates to ensure we have the latest state
//       setAllBooks(prevAllBooks => {
//           console.log("BookContext: Updating allBooks state. Prev length:", prevAllBooks.length);
//           // Prevent adding duplicates if called rapidly (edge case)
//           if (prevAllBooks.some(book => book.id === newBook.id)) {
//               return prevAllBooks;
//           }
//           return [...prevAllBooks, newBook];
//       });

//       setMyBooks(prevMyBooks => {
//           console.log("BookContext: Updating myBooks state. Prev length:", prevMyBooks.length);
//           if (prevMyBooks.some(book => book.id === newBook.id)) {
//               return prevMyBooks;
//           }
//           return [...prevMyBooks, newBook];
//       });

//       if (newBook.status === 'available') {
//         setAvailableBooks(prevAvailableBooks => {
//             console.log("BookContext: Updating availableBooks state. Prev length:", prevAvailableBooks.length);
//              if (prevAvailableBooks.some(book => book.id === newBook.id)) {
//                 return prevAvailableBooks;
//             }
//             return [...prevAvailableBooks, newBook];
//         });
//       } else {
//           console.log("BookContext: New book status is not 'available', not adding to availableBooks.");
//       }

//       console.log("BookContext: State updates queued after addBook.");
//       return newBook; // Return the newly created book data

//     } catch (err) {
//       const errorMsg = err.response?.data?.detail || err.message || 'Failed to add book.';
//       setError(errorMsg);
//       console.error("BookContext: addBook Error:", err.response?.data || err);
//       throw err; // Re-throw for the form to handle
//     }
//   };

//   // Update a book - Revised
//   const updateBook = async (id, bookData) => {
//     setError(null);
//     console.log(`BookContext: Attempting updateBook for ID ${id} with data:`, bookData);
//     try {
//       const response = await BookService.updateBook(id, bookData);
//       const updatedBook = response.data;
//       console.log("BookContext: updateBook successful, API response:", updatedBook);

//       if (!updatedBook || !updatedBook.id) {
//           throw new Error("Invalid book data received from server after update.");
//       }

//       // Update all lists using map
//       setAllBooks(prev => prev.map(book => book.id === updatedBook.id ? updatedBook : book));
//       setMyBooks(prev => prev.map(book => book.id === updatedBook.id ? updatedBook : book));

//       // Update availableBooks more carefully based on status change
//       setAvailableBooks(prev => {
//           const bookExists = prev.some(book => book.id === updatedBook.id);
//           if (updatedBook.status === 'available') {
//               if (bookExists) {
//                   // Update existing entry
//                   return prev.map(book => book.id === updatedBook.id ? updatedBook : book);
//               } else {
//                   // Add new entry (if status changed to available)
//                   return [...prev, updatedBook];
//               }
//           } else {
//               // Remove if status is no longer available
//               return prev.filter(book => book.id !== updatedBook.id);
//           }
//       });

//       console.log("BookContext: State updates queued after updateBook.");
//       return updatedBook;

//     } catch (err) {
//        const errorMsg = err.response?.data?.detail || err.message || 'Failed to update book.';
//        setError(errorMsg);
//        console.error("BookContext: updateBook Error:", err.response?.data || err);
//       throw err;
//     }
//   };

//   // Delete a book - Revised
//   const deleteBook = async (id) => {
//     setError(null);
//     console.log(`BookContext: Attempting deleteBook for ID ${id}`);
//     try {
//       await BookService.deleteBook(id);
//       console.log(`BookContext: deleteBook successful for ID ${id}`);

//       // Remove from all lists using filter
//       setAllBooks(prev => prev.filter(book => book.id !== id));
//       setMyBooks(prev => prev.filter(book => book.id !== id));
//       setAvailableBooks(prev => prev.filter(book => book.id !== id));

//       console.log("BookContext: State updates queued after deleteBook.");
//       return true; // Indicate success

//     } catch (err) {
//        const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete book.';
//        setError(errorMsg);
//        console.error("BookContext: deleteBook Error:", err.response?.data || err);
//       throw err;
//     }
//   };

//   // Get a book by ID (Mostly for fetching details if not already loaded)
//   const getBook = useCallback(async (id) => {
//     setError(null);
//     const bookId = parseInt(id); // Ensure ID is integer

//     // First check if we already have this book in state
//     const existingBook = allBooks.find(book => book.id === bookId);
//     if (existingBook) {
//       console.log(`BookContext: Found book ID ${bookId} in existing state.`);
//       return existingBook;
//     }

//     // If not found, fetch from API
//     console.log(`BookContext: Book ID ${bookId} not in state, fetching from API.`);
//     try {
//       const response = await BookService.getBook(bookId);
//       console.log(`BookContext: Fetched book ID ${bookId} successfully.`);
//       // Optionally add it to the state? This might be complex if pagination is used.
//       // For now, just return it. The component requesting it will handle it.
//       return response.data;
//     } catch (err) {
//       const errorMsg = `Failed to get details for book ID ${bookId}.`;
//        setError(errorMsg);
//        console.error("BookContext: getBook Error:", err.response?.data || err);
//       throw err;
//     }
//   }, [allBooks]); // Depend on allBooks to check existing state

//   // Effect to log state changes for debugging
//   useEffect(() => {
//       console.log('BookContext STATE CHANGE DETECTED - allBooks:', allBooks.length, 'availableBooks:', availableBooks.length, 'myBooks:', myBooks.length);
//   }, [allBooks, availableBooks, myBooks]);


//   // Context value
//   const value = {
//     allBooks,
//     availableBooks,
//     myBooks,
//     loading,
//     error,
//     fetchBooks: () => fetchBooks(false), // Provide a way to refresh without setting loading=true
//     addBook,
//     updateBook,
//     deleteBook,
//     getBook
//   };

//   return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
// };

// // Custom hook to use the book context
// export const useBooks = () => {
//   const context = useContext(BookContext);
//   if (!context) {
//     throw new Error('useBooks must be used within a BookProvider');
//   }
//   return context;
// };

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BookService } from '../services/api.service';
import { useAuth } from './AuthContext';

// Create the context
const BookContext = createContext();

// --- MINIMAL CHANGE 1: Add Helper to get Auth Token ---
// Ensure this key matches where you store your token upon login
const AUTH_TOKEN_KEY = 'access_token';

const getAuthToken = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  // Optional: Add a warning if token is missing during development
  // if (!token) {
  //   console.warn(`getAuthToken: Token not found in localStorage using key '${AUTH_TOKEN_KEY}'`);
  // }
  return token;
};

// Create a provider component
export const BookProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const [allBooks, setAllBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  // Keep loading true initially for the first load fetch
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- MINIMAL CHANGE 2: Modify fetchBooks to handle pagination ---
  const fetchBooks = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true); // Set loading only on initial load
    }
    setError(null);
    console.log("BookContext: Starting fetchBooks (fetching all pages)...");

    let fetchedAllBooksAccumulator = []; // To store books from all pages
    let nextPageUrl = null;

    try {
      // --- Step 1: Initial Fetch (Get the first page) ---
      // Assumes BookService.getAllBooks() handles auth for the first call correctly
      const initialResponse = await BookService.getAllBooks();
      let data = initialResponse.data;

      if (!data) throw new Error("Initial book fetch returned no data.");

      // Add results from the first page & get next URL
      fetchedAllBooksAccumulator = fetchedAllBooksAccumulator.concat(data.results || (Array.isArray(data) ? data : []));
      nextPageUrl = data.next;
      console.log(`BookContext: Fetched page 1. Books so far: ${fetchedAllBooksAccumulator.length}. Next URL: ${nextPageUrl || 'None'}`);

      // --- Step 2: Loop while there's a next page URL ---
      while (nextPageUrl) {
        console.log(`BookContext: Fetching next page: ${nextPageUrl}`);
        const authToken = getAuthToken(); // Get token for this request

        // Check for token before fetching subsequent pages
        if (!authToken) {
          throw new Error(`Authentication token not found while trying to fetch page: ${nextPageUrl}`);
        }

        // Use direct fetch for subsequent pages, adding Authorization header
        const headers = {
          'Content-Type': 'application/json',
          // Adjust 'Bearer ' prefix if your API expects something different (e.g., 'Token ')
          'Authorization': `Bearer ${authToken}`
        };

        const nextResponse = await fetch(nextPageUrl, { headers });

        if (!nextResponse.ok) {
          let errorBody = await nextResponse.text();
          try { errorBody = JSON.parse(errorBody); } catch (e) { /* Ignore if not JSON */ }
           // Handle specific auth error or general HTTP error
          if (nextResponse.status === 401 || nextResponse.status === 403) {
             throw new Error(`Authorization error (${nextResponse.status}) fetching page: ${nextPageUrl}. Check token or login status.`);
          } else {
             throw new Error(`Failed to fetch ${nextPageUrl}: ${nextResponse.status} ${nextResponse.statusText}`);
          }
        }

        data = await nextResponse.json();
        if (data && data.results) {
            fetchedAllBooksAccumulator = fetchedAllBooksAccumulator.concat(data.results);
        }
        nextPageUrl = data.next; // Update for the next iteration
        console.log(`BookContext: Fetched a page. Books so far: ${fetchedAllBooksAccumulator.length}. Next URL: ${nextPageUrl || 'None'}`);
      }

      // --- Step 3: Set final state AFTER fetching all pages ---
      console.log("BookContext: Finished fetching all pages. Total books:", fetchedAllBooksAccumulator.length);
      setAllBooks(fetchedAllBooksAccumulator);

      // Derive available books from the complete list
      const fetchedAvailableBooks = fetchedAllBooksAccumulator.filter(book => book.status === 'available');
      setAvailableBooks(fetchedAvailableBooks);
      console.log("BookContext: Derived Available Books from all books:", fetchedAvailableBooks.length);

      // --- Step 4: Fetch 'my books' (logic remains the same) ---
      if (isAuthenticated() && user) {
        try {
          const myBooksResponse = await BookService.getMyBooks(); // Assumes this handles auth
          const fetchedMyBooks = myBooksResponse.data || [];
          setMyBooks(fetchedMyBooks);
          console.log("BookContext: Fetched My Books:", fetchedMyBooks.length);
        } catch (err) {
          console.error('BookContext: Error fetching my books:', err.response?.data || err);
          setMyBooks([]); // Reset only myBooks on specific error
        }
      } else {
        setMyBooks([]);
      }

    } catch (err) {
      // Catch errors from initial fetch, loop, or myBooks fetch
      setError(`Operation failed: ${err.message}. Please try again or refresh.`);
      console.error("BookContext: fetchBooks Error:", err);
      // Optional: Reset all state on major error
      // setAllBooks([]);
      // setAvailableBooks([]);
      // setMyBooks([]);
    } finally {
      // Set loading false only after the entire process (all pages + myBooks) completes
      if (isInitialLoad) {
        setLoading(false);
      }
      console.log("BookContext: Finished fetchBooks execution.");
    }
  }, [isAuthenticated, user]); // Keep dependencies

  // --- MINIMAL CHANGE 3: Add token check in useEffect for robustness ---
  useEffect(() => {
    const isAuth = isAuthenticated();
    console.log("BookContext Effect: Auth state changed, isAuthenticated:", isAuth);

    if (isAuth) {
      // Check if token exists *before* calling fetchBooks
      const currentToken = getAuthToken();
      if (!currentToken) {
        console.error("BookContext Effect: Authenticated but token missing. Aborting fetch.");
        setError("Authentication token missing. Please log in again.");
        // Reset state if token is missing despite being 'authenticated'
        setAllBooks([]);
        setAvailableBooks([]);
        setMyBooks([]);
        setLoading(false); // Stop loading indicator
      } else {
        fetchBooks(true); // Fetch books only if authenticated AND token exists
      }
    } else {
      // Reset state when logged out
      setAllBooks([]);
      setAvailableBooks([]);
      setMyBooks([]);
      setError(null);
      setLoading(false);
      console.log("BookContext Effect: User not authenticated or logged out, resetting state.");
    }
  }, [isAuthenticated, fetchBooks]); // Dependencies remain the same


  // --- NO CHANGES BELOW THIS LINE ---
  // (addBook, updateBook, deleteBook, getBook, state logging useEffect, value, return)
  // Assume these methods use BookService calls that handle authentication internally

   // Add a new book - Revised
  const addBook = async (bookData) => {
    setError(null);
    console.log("BookContext: Attempting addBook with data:", bookData);
    try {
      const response = await BookService.createBook(bookData);
      const newBook = response.data;
      console.log("BookContext: addBook successful, API response:", newBook);

      if (!newBook || !newBook.id) {
          throw new Error("Invalid book data received from server after creation.");
      }

      setAllBooks(prev => prev.some(b => b.id === newBook.id) ? prev : [...prev, newBook]);
      setMyBooks(prev => prev.some(b => b.id === newBook.id) ? prev : [...prev, newBook]);
      if (newBook.status === 'available') {
        setAvailableBooks(prev => prev.some(b => b.id === newBook.id) ? prev : [...prev, newBook]);
      }

      console.log("BookContext: State updates queued after addBook.");
      return newBook;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to add book.';
      setError(errorMsg);
      console.error("BookContext: addBook Error:", err.response?.data || err);
      throw err;
    }
  };

  // Update a book - Revised
  const updateBook = async (id, bookData) => {
    setError(null);
    console.log(`BookContext: Attempting updateBook for ID ${id} with data:`, bookData);
    try {
      const response = await BookService.updateBook(id, bookData);
      const updatedBook = response.data;
      console.log("BookContext: updateBook successful, API response:", updatedBook);

      if (!updatedBook || !updatedBook.id) {
          throw new Error("Invalid book data received from server after update.");
      }

      setAllBooks(prev => prev.map(book => book.id === updatedBook.id ? updatedBook : book));
      setMyBooks(prev => prev.map(book => book.id === updatedBook.id ? updatedBook : book));
      setAvailableBooks(prev => {
          const exists = prev.some(book => book.id === updatedBook.id);
          if (updatedBook.status === 'available') {
              return exists ? prev.map(b => b.id === updatedBook.id ? updatedBook : b) : [...prev, updatedBook];
          } else {
              return prev.filter(book => book.id !== updatedBook.id);
          }
      });

      console.log("BookContext: State updates queued after updateBook.");
      return updatedBook;
    } catch (err) {
       const errorMsg = err.response?.data?.detail || err.message || 'Failed to update book.';
       setError(errorMsg);
       console.error("BookContext: updateBook Error:", err.response?.data || err);
       throw err;
    }
  };

  // Delete a book - Revised
  const deleteBook = async (id) => {
    setError(null);
    const numId = Number(id); // Convert id to number for reliable comparison
    console.log(`BookContext: Attempting deleteBook for ID ${numId}`);
    try {
      await BookService.deleteBook(numId);
      console.log(`BookContext: deleteBook successful for ID ${numId}`);

      setAllBooks(prev => prev.filter(book => book.id !== numId));
      setMyBooks(prev => prev.filter(book => book.id !== numId));
      setAvailableBooks(prev => prev.filter(book => book.id !== numId));

      console.log("BookContext: State updates queued after deleteBook.");
      return true;

    } catch (err) {
       const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete book.';
       setError(errorMsg);
       console.error("BookContext: deleteBook Error:", err.response?.data || err);
       throw err;
    }
  };

  // Get a book by ID
  const getBook = useCallback(async (id) => {
    setError(null);
    const bookId = parseInt(id, 10);

    const existingBook = allBooks.find(book => book.id === bookId);
    if (existingBook) {
      console.log(`BookContext: Found book ID ${bookId} in existing state.`);
      return existingBook;
    }

    console.log(`BookContext: Book ID ${bookId} not in state, fetching from API.`);
    try {
      const response = await BookService.getBook(bookId);
      console.log(`BookContext: Fetched book ID ${bookId} successfully.`);
      // Don't add to state here as it complicates things if user navigates away
      return response.data;
    } catch (err) {
      const errorMsg = `Failed to get details for book ID ${bookId}.`;
       setError(errorMsg);
       console.error("BookContext: getBook Error:", err.response?.data || err);
      throw err;
    }
  }, [allBooks]);

  // Effect to log state changes for debugging
  useEffect(() => {
      console.log('BookContext STATE CHANGE DETECTED - allBooks:', allBooks.length, 'availableBooks:', availableBooks.length, 'myBooks:', myBooks.length);
  }, [allBooks, availableBooks, myBooks]);


  // Context value
  const value = {
    allBooks,
    availableBooks,
    myBooks,
    loading,
    error,
    fetchBooks: () => fetchBooks(false), // Refresh without setting loading=true
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
