import os
import django
import random
from datetime import datetime, timedelta
import json

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from library_app.models import Book, Rental, Review, Payment

User = get_user_model()

def create_seed_data():
    """
    Create seed data for the library management system
    """
    print("Creating seed data for testing...")
    
    # Delete existing data (uncomment if needed)
    # User.objects.all().delete()
    # Book.objects.all().delete()
    # Rental.objects.all().delete()
    # Review.objects.all().delete()
    # Payment.objects.all().delete()
    
    # Create users with different roles
    print("Creating users...")
    users = []
    
    # Admin user (already created in setup.py)
    try:
        admin = User.objects.get(username='admin')
        users.append(admin)
    except User.DoesNotExist:
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123',
            first_name='Admin',
            last_name='User',
            role='admin',
            status='active',
            phone_number='123-456-7890',
            room_number='A-101',
            hostel_number='H1'
        )
        users.append(admin)
    
    # Book Owner users
    owner_data = [
        {
            'username': 'owner1',
            'email': 'owner1@example.com',
            'password': 'password123',
            'first_name': 'John',
            'last_name': 'Doe',
            'role': 'owner',
            'status': 'active',
            'phone_number': '111-222-3333',
            'room_number': 'B-201',
            'hostel_number': 'H2'
        },
        {
            'username': 'owner2',
            'email': 'owner2@example.com',
            'password': 'password123',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'role': 'owner',
            'status': 'active',
            'phone_number': '222-333-4444',
            'room_number': 'C-301',
            'hostel_number': 'H3'
        }
    ]
    
    for data in owner_data:
        try:
            user = User.objects.get(username=data['username'])
            users.append(user)
        except User.DoesNotExist:
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                role=data['role'],
                status=data['status'],
                phone_number=data['phone_number'],
                room_number=data['room_number'],
                hostel_number=data['hostel_number']
            )
            users.append(user)
    
    # Renter users
    renter_data = [
        {
            'username': 'renter1',
            'email': 'renter1@example.com',
            'password': 'password123',
            'first_name': 'Alice',
            'last_name': 'Johnson',
            'role': 'renter',
            'status': 'active',
            'phone_number': '333-444-5555',
            'room_number': 'D-401',
            'hostel_number': 'H4'
        },
        {
            'username': 'renter2',
            'email': 'renter2@example.com',
            'password': 'password123',
            'first_name': 'Bob',
            'last_name': 'Brown',
            'role': 'renter',
            'status': 'active',
            'phone_number': '444-555-6666',
            'room_number': 'E-501',
            'hostel_number': 'H5'
        },
        {
            'username': 'renter3',
            'email': 'renter3@example.com',
            'password': 'password123',
            'first_name': 'Charlie',
            'last_name': 'Davis',
            'role': 'renter',
            'status': 'active',
            'phone_number': '555-666-7777',
            'room_number': 'F-601',
            'hostel_number': 'H6'
        }
    ]
    
    for data in renter_data:
        try:
            user = User.objects.get(username=data['username'])
            users.append(user)
        except User.DoesNotExist:
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                role=data['role'],
                status=data['status'],
                phone_number=data['phone_number'],
                room_number=data['room_number'],
                hostel_number=data['hostel_number']
            )
            users.append(user)
    
    # Create books
    print("Creating books...")
    books_data = [
        {
            'title': 'The Great Gatsby',
            'author': 'F. Scott Fitzgerald',
            'isbn': '9780743273565',
            'category': 'Fiction',
            'status': 'available',
            'owner': 'owner1'
        },
        {
            'title': 'To Kill a Mockingbird',
            'author': 'Harper Lee',
            'isbn': '9780061120084',
            'category': 'Fiction',
            'status': 'available',
            'owner': 'owner1'
        },
        {
            'title': '1984',
            'author': 'George Orwell',
            'isbn': '9780451524935',
            'category': 'Fiction',
            'status': 'available',
            'owner': 'owner1'
        },
        {
            'title': 'Pride and Prejudice',
            'author': 'Jane Austen',
            'isbn': '9780141439518',
            'category': 'Fiction',
            'status': 'available',
            'owner': 'owner2'
        },
        {
            'title': 'The Catcher in the Rye',
            'author': 'J.D. Salinger',
            'isbn': '9780316769488',
            'category': 'Fiction',
            'status': 'available',
            'owner': 'owner2'
        },
        {
            'title': 'The Hobbit',
            'author': 'J.R.R. Tolkien',
            'isbn': '9780547928227',
            'category': 'Fantasy',
            'status': 'available',
            'owner': 'owner2'
        },
        {
            'title': 'Brave New World',
            'author': 'Aldous Huxley',
            'isbn': '9780060850524',
            'category': 'Science Fiction',
            'status': 'available',
            'owner': 'owner1'
        },
        {
            'title': 'The Lord of the Rings',
            'author': 'J.R.R. Tolkien',
            'isbn': '9780618640157',
            'category': 'Fantasy',
            'status': 'available',
            'owner': 'owner1'
        },
        {
            'title': 'Animal Farm',
            'author': 'George Orwell',
            'isbn': '9780451526342',
            'category': 'Fiction',
            'status': 'available',
            'owner': 'owner2'
        },
        {
            'title': 'The Alchemist',
            'author': 'Paulo Coelho',
            'isbn': '9780061122415',
            'category': 'Fiction',
            'status': 'available',
            'owner': 'owner2'
        },
        {
            'title': 'Python Crash Course',
            'author': 'Eric Matthes',
            'isbn': '9781593276034',
            'category': 'Computer Science',
            'status': 'available',
            'owner': 'owner1'
        },
        {
            'title': 'Clean Code',
            'author': 'Robert C. Martin',
            'isbn': '9780132350884',
            'category': 'Computer Science',
            'status': 'available',
            'owner': 'owner1'
        }
    ]
    
    books = []
    owner_map = {user.username: user for user in users if user.role == 'owner'}
    
    for data in books_data:
        owner = owner_map.get(data['owner'])
        if owner:
            try:
                book = Book.objects.get(title=data['title'], author=data['author'])
                books.append(book)
            except Book.DoesNotExist:
                book = Book.objects.create(
                    title=data['title'],
                    author=data['author'],
                    isbn=data['isbn'],
                    category=data['category'],
                    status=data['status'],
                    owner=owner
                )
                books.append(book)
    
    # Create rentals
    print("Creating rentals...")
    renters = [user for user in users if user.role == 'renter']
    
    # Generate rental data
    today = datetime.now().date()
    
    rental_data = [
        {
            'book': 'The Great Gatsby',
            'renter': 'renter1',
            'start_date': today - timedelta(days=30),
            'end_date': today - timedelta(days=15),
            'status': 'completed'
        },
        {
            'book': 'To Kill a Mockingbird',
            'renter': 'renter1',
            'start_date': today - timedelta(days=20),
            'end_date': today - timedelta(days=5),
            'status': 'completed'
        },
        {
            'book': '1984',
            'renter': 'renter2',
            'start_date': today - timedelta(days=10),
            'end_date': today + timedelta(days=5),
            'status': 'approved'
        },
        {
            'book': 'Pride and Prejudice',
            'renter': 'renter2',
            'start_date': today - timedelta(days=5),
            'end_date': today + timedelta(days=10),
            'status': 'approved'
        },
        {
            'book': 'The Catcher in the Rye',
            'renter': 'renter3',
            'start_date': today + timedelta(days=5),
            'end_date': today + timedelta(days=20),
            'status': 'pending'
        },
        {
            'book': 'The Hobbit',
            'renter': 'renter3',
            'start_date': today + timedelta(days=10),
            'end_date': today + timedelta(days=25),
            'status': 'pending'
        },
        {
            'book': 'Clean Code',
            'renter': 'renter1',
            'start_date': today + timedelta(days=3),
            'end_date': today + timedelta(days=17),
            'status': 'pending'
        }
    ]
    
    book_map = {book.title: book for book in books}
    renter_map = {user.username: user for user in renters}
    
    for data in rental_data:
        book = book_map.get(data['book'])
        renter = renter_map.get(data['renter'])
        
        if book and renter:
            # Update book status based on rental status
            if data['status'] == 'approved':
                book.status = 'rented'
                book.save()
            
            # Create rental
            try:
                rental = Rental.objects.get(
                    book=book,
                    renter=renter,
                    start_date=data['start_date'],
                    end_date=data['end_date']
                )
            except Rental.DoesNotExist:
                rental = Rental.objects.create(
                    book=book,
                    renter=renter,
                    start_date=data['start_date'],
                    end_date=data['end_date'],
                    status=data['status']
                )
                
                # Create payment for completed rentals
                if data['status'] == 'completed':
                    Payment.objects.create(
                        rental=rental,
                        amount=5.00,
                        status='completed',
                        transaction_id=f"TR-{random.randint(10000, 99999)}"
                    )
    
    # Create reviews
    print("Creating reviews...")
    
    # Get completed rentals
    completed_rentals = Rental.objects.filter(status='completed')
    
    for rental in completed_rentals:
        # Check if review already exists
        if not Review.objects.filter(book=rental.book, user=rental.renter).exists():
            # Generate random rating
            rating = random.randint(3, 5)
            
            # Generate comment based on rating
            if rating == 5:
                comment = f"Excellent book! I thoroughly enjoyed {rental.book.title}."
            elif rating == 4:
                comment = f"Very good read. {rental.book.title} was quite interesting."
            else:
                comment = f"Decent book, but not my favorite. {rental.book.title} was okay."
            
            Review.objects.create(
                book=rental.book,
                user=rental.renter,
                rating=rating,
                comment=comment
            )
    
    print("Seed data creation complete!")

if __name__ == '__main__':
    create_seed_data()