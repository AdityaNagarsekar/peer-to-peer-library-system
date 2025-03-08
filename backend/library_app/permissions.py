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