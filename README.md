# Peer-to-Peer Library Management System

A comprehensive library management system that allows users to share books with peers, manage rentals, and keep track of their personal library. This application supports multiple user roles, including administrators, book owners, renters, and general viewers.

![Library Management System](https://via.placeholder.com/800x400?text=Peer+to+Peer+Library+Management+System)

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Database Setup](#database-setup)
  - [Load Sample Data](#load-sample-data)
- [Usage](#usage)
  - [User Roles](#user-roles)
  - [Default Accounts](#default-accounts)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Management**
  - Registration and authentication
  - Role-based permissions (Admin, Book Owner, Renter, Viewer)
  - User profiles with personal information

- **Book Management**
  - Add, edit, and delete books
  - View book details and availability
  - Search and filter books by various criteria
  - Book categories and metadata

- **Rental System**
  - Request to rent books
  - Approve or reject rental requests
  - Track rental periods
  - Return process

- **Review System**
  - Rate and review books
  - View book ratings and reviews

- **Dashboard**
  - Overview of personal library statistics
  - Quick access to common actions
  - Activity summaries

## Technology Stack

### Backend
- **Django**: Python web framework
- **Django REST Framework**: API development
- **PostgreSQL**: Database
- **JSON Web Tokens (JWT)**: Authentication

### Frontend
- **React**: JavaScript library for building user interfaces
- **React Router**: Navigation and routing
- **React Bootstrap**: UI components
- **Axios**: HTTP client for API requests

## Getting Started

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- PostgreSQL

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/library-management-system.git
   cd library-management-system
   ```

2. Create and activate a virtual environment:
   ```bash
   # On Windows
   python -m venv backend/venv
   backend\venv\Scripts\activate

   # On macOS/Linux
   python -m venv backend/venv
   source backend/venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Configure the database in `library_project/settings.py`:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'library_system',
           'USER': 'postgres',
           'PASSWORD': 'postgres',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

5. Create the database:
   ```bash
   # Using PostgreSQL command line
   createdb library_system
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE library_system;
   \q
   ```

6. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. Create a superuser:
   ```bash
   python manage.py createsuperuser
   # Follow the prompts to create an admin user
   ```

8. Start the development server:
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000/`.

### Database Setup

The migration process will create the necessary tables, but you'll need to create the PostgreSQL database first:

```bash
# Using PostgreSQL command line
createdb library_system

# Or using psql
psql -U postgres
CREATE DATABASE library_system;
\q
```

### Load Sample Data

To load sample data for testing, run the seed script:

```bash
cd backend
python seed_data.py
```

This will create sample users, books, rentals, reviews, and payments.

## Usage

### User Roles

- **Admin**
  - View and edit all user accounts
  - Create, update, delete any book entry
  - Resolve disputes, manage rentals globally
  - Access to system-wide reports and analytics

- **Book Owner**
  - Create, edit, and remove own books
  - Approve or reject rental requests
  - Manage pricing, availability, and book details

- **Renter**
  - Search and view available books
  - Request rentals for books
  - Complete rentals and return books

- **Viewer**
  - Limited browsing of public listings
  - No transaction privileges
  - Prompted to register/login for further actions

### Default Accounts

After running the seed script, you can log in with these accounts:

- **Admin**
  - Username: `admin`
  - Password: `admin123`

- **Book Owners**
  - Username: `owner1`
  - Password: `password123`
  
  - Username: `owner2`
  - Password: `password123`

- **Renters**
  - Username: `renter1`
  - Password: `password123`
  
  - Username: `renter2`
  - Password: `password123`
  
  - Username: `renter3`
  - Password: `password123`

## API Documentation

The API provides the following endpoints:

- `/api/users/`: User management
- `/api/books/`: Book management
- `/api/rentals/`: Rental management
- `/api/reviews/`: Review management
- `/api/payments/`: Payment management

Authentication endpoints:
- `/api/token/`: Obtain JWT token
- `/api/token/refresh/`: Refresh JWT token

Each endpoint supports standard CRUD operations and includes additional endpoints for specific functionalities.

## Project Structure

```
library_system/
│
├── backend/                  # Django backend
│   ├── library_project/      # Main Django project
│   │   ├── __init__.py
│   │   ├── settings.py       # Project settings
│   │   ├── urls.py           # Main URL routing
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── library_app/          # Main application
│   │   ├── migrations/       # Database migrations
│   │   ├── __init__.py
│   │   ├── admin.py          # Admin site configuration
│   │   ├── models.py         # Database models
│   │   ├── serializers.py    # API serializers
│   │   ├── views.py          # API views
│   │   ├── urls.py           # API endpoints
│   │   └── permissions.py    # Custom permissions
│   │
│   ├── manage.py             # Django management script
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React frontend
│   ├── public/               # Static files
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/                  # React source code
│   │   ├── components/       # React components
│   │   │   ├── Auth/         # Authentication components
│   │   │   ├── Books/        # Book-related components
│   │   │   ├── Rentals/      # Rental-related components
│   │   │   ├── Reviews/      # Review-related components
│   │   │   ├── Dashboard/    # Dashboard components
│   │   │   ├── Layout/       # Layout components
│   │   │   └── Common/       # Common UI components
│   │   │
│   │   ├── services/         # API services
│   │   ├── contexts/         # React contexts
│   │   ├── utils/            # Utility functions
│   │   ├── App.js            # Main App component
│   │   ├── index.js          # Entry point
│   │   └── App.css           # Global styles
│   │
│   ├── package.json          # NPM dependencies
│   └── package-lock.json
│
└── README.md                 # Project documentation
```

## Screenshots

Coming soon!

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.