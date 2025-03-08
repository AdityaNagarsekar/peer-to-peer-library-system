#!/bin/bash

# Setup script for the Peer-to-Peer Library Management System
# This script will create the Django project structure and set up the database

# Color codes for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Peer-to-Peer Library Management System...${NC}"

# Create backend directory if it doesn't exist
mkdir -p backend
cd backend

# Create virtual environment
echo -e "${YELLOW}Creating virtual environment...${NC}"
python -m venv venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo -e "${YELLOW}Activating virtual environment (Windows)...${NC}"
    source venv/Scripts/activate
else
    echo -e "${YELLOW}Activating virtual environment (Unix)...${NC}"
    source venv/bin/activate
fi

# Install required packages
echo -e "${YELLOW}Installing required packages...${NC}"
pip install Django==4.2.7 djangorestframework==3.14.0 djangorestframework-simplejwt==5.3.0 django-cors-headers==4.3.0 psycopg2-binary==2.9.9 python-dotenv==1.0.0 Pillow==10.1.0

# Create Django project
echo -e "${YELLOW}Creating Django project...${NC}"
django-admin startproject library_project .

# Create Django app
echo -e "${YELLOW}Creating Django app...${NC}"
python manage.py startapp library_app

# Copy models.py to the app
echo -e "${YELLOW}Setting up Django models...${NC}"
cat > library_app/models.py << 'EOL'
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    """
    Custom user model for the library management system.
    Extends Django's built-in AbstractUser to add additional fields.
    """
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('owner', 'Book Owner'),
        ('renter', 'Renter'),
        ('viewer', 'Viewer'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    )
    
    # Additional fields from ER diagram
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    room_number = models.CharField(max_length=20, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    hostel_number = models.CharField(max_length=20, blank=True, null=True)
    
    def __str__(self):
        return self.username

class Book(models.Model):
    """
    Model for books in the library system.
    Books can be owned by users and borrowed by others.
    """
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('rented', 'Rented'),
        ('unavailable', 'Unavailable'),
    )
    
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=100)
    isbn = models.CharField(max_length=20, blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_books')
    category = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    
    def __str__(self):
        return self.title

class Rental(models.Model):
    """
    Model for book rentals.
    Represents the borrowing relationship between users and books.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    )
    
    renter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rentals')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='rentals')
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    def __str__(self):
        return f"{self.renter.username} - {self.book.title}"

class Review(models.Model):
    """
    Model for book reviews.
    Users can review books with a rating and comment.
    """
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)
    
    class Meta:
        # Ensure each user can only review a book once
        unique_together = ('book', 'user')
    
    def __str__(self):
        return f"{self.user.username}'s review of {self.book.title}"

class Payment(models.Model):
    """
    Model for payments related to book rentals.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    rental = models.OneToOneField(Rental, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return f"Payment for {self.rental}"
EOL

# Copy serializers.py to the app
echo -e "${YELLOW}Setting up Django serializers...${NC}"
cat > library_app/serializers.py << 'EOL'
from rest_framework import serializers
from .models import User, Book, Rental, Review, Payment

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'role', 'status', 'room_number', 'phone_number', 'hostel_number']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        """
        Override create method to properly handle user creation with password hashing
        """
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class BookSerializer(serializers.ModelSerializer):
    """Serializer for the Book model"""
    owner_name = serializers.ReadOnlyField(source='owner.username')
    
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'isbn', 'owner', 'owner_name', 'category', 'status']

class RentalSerializer(serializers.ModelSerializer):
    """Serializer for the Rental model"""
    renter_name = serializers.ReadOnlyField(source='renter.username')
    book_title = serializers.ReadOnlyField(source='book.title')
    
    class Meta:
        model = Rental
        fields = ['id', 'renter', 'renter_name', 'book', 'book_title', 'start_date', 'end_date', 'status']

class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for the Review model"""
    user_name = serializers.ReadOnlyField(source='user.username')
    book_title = serializers.ReadOnlyField(source='book.title')
    
    class Meta:
        model = Review
        fields = ['id', 'book', 'book_title', 'user', 'user_name', 'rating', 'comment']
        
    def validate(self, data):
        """
        Check that the user has not already reviewed this book
        """
        user = data.get('user')
        book = data.get('book')
        
        # When creating a new review (not updating)
        if not self.instance:
            if Review.objects.filter(user=user, book=book).exists():
                raise serializers.ValidationError("You have already reviewed this book.")
        
        return data

class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for the Payment model"""
    rental_details = serializers.ReadOnlyField(source='rental.__str__')
    
    class Meta:
        model = Payment
        fields = ['id', 'rental', 'rental_details', 'amount', 'status', 'transaction_id']
EOL

# Copy settings.py to the project
echo -e "${YELLOW}Setting up Django settings...${NC}"
cat > library_project/settings.py << 'EOL'
import os
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-replace-this-with-your-own-secret-key'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Local apps
    'library_app',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'library_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'library_project.wsgi.application'

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

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

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Custom user model
AUTH_USER_MODEL = 'library_app.User'

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}

# JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
EOL

# Copy permissions.py to the app
echo -e "${YELLOW}Setting up Django permissions...${NC}"
cat > library_app/permissions.py << 'EOL'
from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access a view or object.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a book to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner or admin
        return obj.owner == request.user or request.user.role == 'admin'

class IsRenterOrOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow the renter, book owner, or admin to modify a rental.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only renter, book owner, or admin can modify
        return (obj.renter == request.user or 
                obj.book.owner == request.user or 
                request.user.role == 'admin')

class IsReviewerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow the reviewer to edit their review.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the reviewer or admin
        return obj.user == request.user or request.user.role == 'admin'
EOL

# Copy URLconf to the app
echo -e "${YELLOW}Setting up Django URLs...${NC}"
cat > library_app/urls.py << 'EOL'
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'books', views.BookViewSet)
router.register(r'rentals', views.RentalViewSet)
router.register(r'reviews', views.ReviewViewSet)
router.register(r'payments', views.PaymentViewSet)

# The API URLs are determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
]
EOL

# Copy URLconf to the project
cat > library_project/urls.py << 'EOL'
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views as token_views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('library_app.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
EOL

# Copy admin.py to the app
echo -e "${YELLOW}Setting up Django admin...${NC}"
cat > library_app/admin.py << 'EOL'
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Book, Rental, Review, Payment

class CustomUserAdmin(UserAdmin):
    """Admin configuration for the custom User model"""
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'status')
    list_filter = ('role', 'status', 'is_staff', 'is_superuser')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Library info', {'fields': ('role', 'status', 'room_number', 'phone_number', 'hostel_number')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)

class BookAdmin(admin.ModelAdmin):
    """Admin configuration for the Book model"""
    list_display = ('title', 'author', 'owner', 'status', 'category')
    list_filter = ('status', 'category')
    search_fields = ('title', 'author', 'owner__username', 'isbn')
    raw_id_fields = ('owner',)

class RentalAdmin(admin.ModelAdmin):
    """Admin configuration for the Rental model"""
    list_display = ('renter', 'book', 'start_date', 'end_date', 'status')
    list_filter = ('status', 'start_date', 'end_date')
    search_fields = ('renter__username', 'book__title')
    raw_id_fields = ('renter', 'book')

class ReviewAdmin(admin.ModelAdmin):
    """Admin configuration for the Review model"""
    list_display = ('user', 'book', 'rating')
    list_filter = ('rating',)
    search_fields = ('user__username', 'book__title', 'comment')
    raw_id_fields = ('user', 'book')

class PaymentAdmin(admin.ModelAdmin):
    """Admin configuration for the Payment model"""
    list_display = ('rental', 'amount', 'status', 'transaction_id')
    list_filter = ('status',)
    search_fields = ('rental__renter__username', 'rental__book__title', 'transaction_id')
    raw_id_fields = ('rental',)

# Register all models with their admin configurations
admin.site.register(User, CustomUserAdmin)
admin.site.register(Book, BookAdmin)
admin.site.register(Rental, RentalAdmin)
admin.site.register(Review, ReviewAdmin)
admin.site.register(Payment, PaymentAdmin)
EOL

# Create database
echo -e "${YELLOW}Setting up PostgreSQL database...${NC}"
echo "Make sure PostgreSQL is running and you have a postgres user with password 'postgres'"
echo "Creating database library_system..."

# Try to create the database
if command -v psql &> /dev/null; then
    if psql -U postgres -c "CREATE DATABASE library_system;" &> /dev/null; then
        echo -e "${GREEN}Database created successfully.${NC}"
    else
        echo -e "${RED}Failed to create database. You may need to create it manually.${NC}"
        echo "Run: CREATE DATABASE library_system; in PostgreSQL"
    fi
else
    echo -e "${RED}PostgreSQL command line tools not found. You need to create the database manually.${NC}"
    echo "Run: CREATE DATABASE library_system; in PostgreSQL"
fi

# Make migrations
echo -e "${YELLOW}Making migrations...${NC}"
python manage.py makemigrations library_app

# Apply migrations
echo -e "${YELLOW}Applying migrations...${NC}"
python manage.py migrate

# Create superuser
echo -e "${YELLOW}Creating admin superuser...${NC}"
echo "from library_app.models import User; User.objects.create_superuser('admin', 'admin@example.com', 'admin123', role='admin', status='active')" | python manage.py shell

# Deactivate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    deactivate
else
    deactivate
fi

# Setup frontend
cd ..
echo -e "${YELLOW}Setting up frontend...${NC}"
mkdir -p frontend
cd frontend

# Create package.json
echo -e "${YELLOW}Creating package.json...${NC}"
cat > package.json << 'EOL'
{
  "name": "library-management-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.6.2",
    "bootstrap": "^5.3.2",
    "react": "^18.2.0",
    "react-bootstrap": "^2.9.1",
    "react-dom": "^18.2.0",
    "react-icons": "^4.12.0",
    "react-router-dom": "^6.19.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOL

# Create README.md at project root
cd ..
echo -e "${YELLOW}Creating README.md...${NC}"

cat > README.md << 'EOL'
# Peer-to-Peer Library Management System

A comprehensive library management system that allows users to share books with peers, manage rentals, and keep track of their personal library.

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Activate the virtual environment:
   ```
   # On Windows
   venv\Scripts\activate
   
   # On Unix/MacOS
   source venv/bin/activate
   ```

3. Start the Django development server:
   ```
   python manage.py runserver
   ```

The API will be available at http://localhost:8000/api/

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

The application will be available at http://localhost:3000/

## Default Admin Account

Username: admin
Password: admin123

## Learn More

For more details about the project, refer to the documentation in the respective directories.
EOL

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Navigate to the backend directory, activate the virtual environment, and run the server:"
echo "   cd backend"
echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "   python manage.py runserver"
echo ""
echo "2. In a new terminal, navigate to the frontend directory, install dependencies, and start the React app:"
echo "   cd frontend"
echo "   npm install"
echo "   npm start"
echo ""
echo "Admin username: admin"
echo "Admin password: admin123"