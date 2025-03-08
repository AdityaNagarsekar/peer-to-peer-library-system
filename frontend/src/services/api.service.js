import axios from 'axios';

// Create an axios instance with default config
const API = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to refresh the token if it expires
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried the request yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });
        
        // Save the new tokens
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        // Retry the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return API(originalRequest);
      } catch (err) {
        // Refresh token is expired or invalid, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication services
const AuthService = {
  login: async (username, password) => {
    const response = await API.post('/token/', { username, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    return response.data;
  },
  
  register: async (userData) => {
    return API.post('/users/', userData);
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: async () => {
    return API.get('/users/me/');
  },
  
  updateProfile: async (userData) => {
    return API.put('/users/me/', userData);
  },
};

// Book services
const BookService = {
  getAllBooks: async (params) => {
    return API.get('/books/', { params });
  },
  
  getBook: async (id) => {
    return API.get(`/books/${id}/`);
  },
  
  createBook: async (bookData) => {
    return API.post('/books/', bookData);
  },
  
  updateBook: async (id, bookData) => {
    return API.put(`/books/${id}/`, bookData);
  },
  
  deleteBook: async (id) => {
    return API.delete(`/books/${id}/`);
  },
  
  getMyBooks: async () => {
    return API.get('/books/my_books/');
  },
  
  getAvailableBooks: async () => {
    return API.get('/books/available/');
  },
  
  getBookReviews: async (id) => {
    return API.get(`/books/${id}/reviews/`);
  },
};

// Rental services
const RentalService = {
  getAllRentals: async () => {
    return API.get('/rentals/');
  },
  
  getRental: async (id) => {
    return API.get(`/rentals/${id}/`);
  },
  
  createRental: async (rentalData) => {
    return API.post('/rentals/', rentalData);
  },
  
  updateRental: async (id, rentalData) => {
    return API.put(`/rentals/${id}/`, rentalData);
  },
  
  deleteRental: async (id) => {
    return API.delete(`/rentals/${id}/`);
  },
  
  getMyRentals: async () => {
    return API.get('/rentals/my_rentals/');
  },
  
  getMyBookRentals: async () => {
    return API.get('/rentals/my_book_rentals/');
  },
  
  approveRental: async (id) => {
    return API.post(`/rentals/${id}/approve/`);
  },
  
  completeRental: async (id) => {
    return API.post(`/rentals/${id}/complete/`);
  },
  
  cancelRental: async (id) => {
    return API.post(`/rentals/${id}/cancel/`);
  },
};

// Review services
const ReviewService = {
  getAllReviews: async () => {
    return API.get('/reviews/');
  },
  
  getReview: async (id) => {
    return API.get(`/reviews/${id}/`);
  },
  
  createReview: async (reviewData) => {
    return API.post('/reviews/', reviewData);
  },
  
  updateReview: async (id, reviewData) => {
    return API.put(`/reviews/${id}/`, reviewData);
  },
  
  deleteReview: async (id) => {
    return API.delete(`/reviews/${id}/`);
  },
  
  getMyReviews: async () => {
    return API.get('/reviews/my_reviews/');
  },
};

// Payment services
const PaymentService = {
  getAllPayments: async () => {
    return API.get('/payments/');
  },
  
  getPayment: async (id) => {
    return API.get(`/payments/${id}/`);
  },
  
  createPayment: async (paymentData) => {
    return API.post('/payments/', paymentData);
  },
  
  updatePayment: async (id, paymentData) => {
    return API.put(`/payments/${id}/`, paymentData);
  },
  
  getMyPayments: async () => {
    return API.get('/payments/my_payments/');
  },
};

export {
  AuthService,
  BookService,
  RentalService,
  ReviewService,
  PaymentService,
};