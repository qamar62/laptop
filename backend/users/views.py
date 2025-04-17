from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import Address
from .serializers import (
    UserSerializer, UserCreateSerializer, AddressSerializer,
    PasswordChangeSerializer
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user management."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Regular users can only see their own profile
        user = self.request.user
        if user.role in ['admin', 'store_manager']:
            return User.objects.all()
        return User.objects.filter(id=user.id)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def get_permissions(self):
        # Allow anyone to register
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        user = self.get_object()
        serializer = PasswordChangeSerializer(data=request.data)
        
        if serializer.is_valid():
            # Check old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {"old_password": ["Wrong password."]}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class AddressViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user addresses."""
    
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def shipping(self, request):
        """Get all shipping addresses for the current user."""
        addresses = Address.objects.filter(user=request.user, address_type='shipping')
        serializer = self.get_serializer(addresses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def billing(self, request):
        """Get all billing addresses for the current user."""
        addresses = Address.objects.filter(user=request.user, address_type='billing')
        serializer = self.get_serializer(addresses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def default_shipping(self, request):
        """Get default shipping address for the current user."""
        try:
            address = Address.objects.get(user=request.user, address_type='shipping', is_default=True)
            serializer = self.get_serializer(address)
            return Response(serializer.data)
        except Address.DoesNotExist:
            return Response({"message": "No default shipping address found"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def default_billing(self, request):
        """Get default billing address for the current user."""
        try:
            address = Address.objects.get(user=request.user, address_type='billing', is_default=True)
            serializer = self.get_serializer(address)
            return Response(serializer.data)
        except Address.DoesNotExist:
            return Response({"message": "No default billing address found"}, status=status.HTTP_404_NOT_FOUND)
