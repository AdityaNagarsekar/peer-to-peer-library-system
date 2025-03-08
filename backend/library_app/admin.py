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