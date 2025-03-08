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