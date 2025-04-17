from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Address


class AddressInline(admin.TabularInline):
    model = Address
    extra = 0


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number', 'date_of_birth', 'profile_picture')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Social Auth', {'fields': ('google_id', 'facebook_id')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at')
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'is_active', 'is_staff'),
        }),
    )
    
    inlines = [AddressInline]


class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'address_type', 'is_default', 'city', 'country', 'created_at')
    list_filter = ('address_type', 'is_default', 'country')
    search_fields = ('user__email', 'full_name', 'city', 'country')
    ordering = ('user', '-is_default')


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Address, AddressAdmin)
