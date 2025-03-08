# create_users.py
import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library_project.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

def create_users():
    # Define user types and their roles
    user_types = [
        {'username': 'admin', 'role': 'admin'},
        {'username': 'owner', 'role': 'owner'},
        {'username': 'renter', 'role': 'renter'},
        {'username': 'viewer', 'role': 'viewer'}
    ]
    
    # Common password for all users
    password = '1234567890'
    
    # Create each user
    for user_type in user_types:
        username = user_type['username']
        role = user_type['role']
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            print(f"User '{username}' already exists. Updating password and role.")
            user.set_password(password)
            user.role = role
            user.save()
        else:
            # For admin, use create_superuser
            if role == 'admin':
                User.objects.create_superuser(
                    username=username,
                    email=f'{username}@example.com',
                    password=password,
                    role=role,
                    status='active'
                )
            else:
                User.objects.create_user(
                    username=username,
                    email=f'{username}@example.com',
                    password=password,
                    role=role,
                    status='active'
                )
            print(f"Created {role} user with username '{username}' and password '{password}'")

if __name__ == '__main__':
    create_users()
    print("All users created successfully.")