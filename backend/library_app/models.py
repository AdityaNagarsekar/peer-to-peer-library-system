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