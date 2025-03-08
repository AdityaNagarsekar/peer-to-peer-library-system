from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg
from django.shortcuts import get_object_or_404
from .models import User, Book, Rental, Review, Payment
from .serializers import (
    UserSerializer, 
    BookSerializer, 
    RentalSerializer, 
    ReviewSerializer, 
    PaymentSerializer
)
from .permissions import IsAdmin, IsOwnerOrReadOnly, IsRenterOrOwnerOrAdmin, IsReviewerOrReadOnly

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """
        - Allow anyone to register (create)
        - Only admin can see list of all users or delete/modify users
        - Users can see their own profile
        """
        if self.action == 'create':
            return [permissions.AllowAny()]
        elif self.action in ['list', 'destroy'] or (self.action in ['update', 'partial_update'] and self.kwargs.get('pk') != 'me'):
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """
        Get or update the current user's profile
        """
        user = request.user
        
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        
        # Update methods
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = self.get_serializer(user, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

class BookViewSet(viewsets.ModelViewSet):
    """
    API endpoint for books
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    
    def get_permissions(self):
        """
        - Anyone can view books
        - Only authenticated users can create books
        - Only book owner or admin can update/delete books
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        elif self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Set the book owner to the current user when creating a book"""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """Get all reviews for a specific book"""
        book = self.get_object()
        reviews = Review.objects.filter(book=book)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_books(self, request):
        """Get all books owned by the current user"""
        books = Book.objects.filter(owner=request.user)
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get all available books"""
        books = Book.objects.filter(status='available')
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)

class RentalViewSet(viewsets.ModelViewSet):
    """
    API endpoint for rentals
    """
    queryset = Rental.objects.all()
    serializer_class = RentalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """
        - Only authenticated users can view/create rentals
        - Only the renter, book owner, or admin can update/delete a rental
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsRenterOrOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Set the renter to current user when creating a rental"""
        serializer.save(renter=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_rentals(self, request):
        """Get all rentals where the current user is the renter"""
        rentals = Rental.objects.filter(renter=request.user)
        serializer = self.get_serializer(rentals, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_book_rentals(self, request):
        """Get all rentals for books owned by the current user"""
        rentals = Rental.objects.filter(book__owner=request.user)
        serializer = self.get_serializer(rentals, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a rental request (book owner only)"""
        rental = self.get_object()
        
        # Check if the current user is the book owner
        if rental.book.owner != request.user and request.user.role != 'admin':
            return Response(
                {"detail": "You are not the owner of this book"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if the rental is in pending status
        if rental.status != 'pending':
            return Response(
                {"detail": "This rental request is not in pending status"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update rental and book status
        rental.status = 'approved'
        rental.save()
        
        book = rental.book
        book.status = 'rented'
        book.save()
        
        serializer = self.get_serializer(rental)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark a rental as complete (book returned)"""
        rental = self.get_object()
        
        # Check if the current user is the book owner, renter, or admin
        if (rental.book.owner != request.user and 
            rental.renter != request.user and 
            request.user.role != 'admin'):
            return Response(
                {"detail": "You are not authorized to complete this rental"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if the rental is in approved status
        if rental.status != 'approved':
            return Response(
                {"detail": "This rental is not in approved status"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update rental and book status
        rental.status = 'completed'
        rental.save()
        
        book = rental.book
        book.status = 'available'
        book.save()
        
        serializer = self.get_serializer(rental)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a rental request"""
        rental = self.get_object()
        
        # Check if the current user is the renter, book owner, or admin
        if (rental.renter != request.user and 
            rental.book.owner != request.user and 
            request.user.role != 'admin'):
            return Response(
                {"detail": "You are not authorized to cancel this rental"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if the rental is in pending or approved status
        if rental.status not in ['pending', 'approved']:
            return Response(
                {"detail": "This rental cannot be canceled in its current status"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # If the rental was approved, update the book status back to available
        if rental.status == 'approved':
            book = rental.book
            book.status = 'available'
            book.save()
        
        # Update rental status
        rental.status = 'canceled'
        rental.save()
        
        serializer = self.get_serializer(rental)
        return Response(serializer.data)

class ReviewViewSet(viewsets.ModelViewSet):
    """
    API endpoint for reviews
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    
    def get_permissions(self):
        """
        - Anyone can view reviews
        - Only authenticated users can create reviews
        - Only the reviewer or admin can update/delete a review
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsReviewerOrReadOnly()]
        elif self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Set the user to current user when creating a review"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        """Get all reviews created by the current user"""
        reviews = Review.objects.filter(user=request.user)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

class PaymentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for payments
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """
        - Only admin can view all payments
        - Users can only see payments related to their rentals
        """
        if self.action == 'list':
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Filter payments based on user role"""
        user = self.request.user
        
        # Admin can see all payments
        if user.role == 'admin':
            return Payment.objects.all()
        
        # Other users can only see payments related to their rentals
        return Payment.objects.filter(
            rental__renter=user
        ) | Payment.objects.filter(
            rental__book__owner=user
        )
    
    @action(detail=False, methods=['get'])
    def my_payments(self, request):
        """Get all payments related to the current user's rentals"""
        payments = Payment.objects.filter(rental__renter=request.user)
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)