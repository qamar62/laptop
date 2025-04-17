from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from products.models import Product, ProductVariant
from .models import Cart, CartItem, SavedForLater
from .serializers import (
    CartSerializer, CartItemSerializer, AddToCartSerializer,
    UpdateCartItemSerializer, SavedForLaterSerializer
)


class CartViewSet(viewsets.GenericViewSet):
    """ViewSet for managing shopping cart."""
    
    serializer_class = CartSerializer
    
    def get_permissions(self):
        # Allow guest carts
        return [permissions.AllowAny()]
    
    def get_cart(self, request):
        """Get or create a cart for the current user or session."""
        if request.user.is_authenticated:
            # Get or create cart for authenticated user
            cart, created = Cart.objects.get_or_create(user=request.user)
            
            # If user has a session cart, merge it with their user cart
            session_id = request.session.session_key
            if session_id:
                try:
                    session_cart = Cart.objects.get(session_id=session_id, user=None)
                    cart.merge_with(session_cart)
                except Cart.DoesNotExist:
                    pass
            
            return cart
        else:
            # Get or create cart for guest user
            if not request.session.session_key:
                request.session.create()
            
            session_id = request.session.session_key
            cart, created = Cart.objects.get_or_create(session_id=session_id, user=None)
            return cart
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get the current cart."""
        cart = self.get_cart(request)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add an item to the cart."""
        serializer = AddToCartSerializer(data=request.data)
        if serializer.is_valid():
            cart = self.get_cart(request)
            product_id = serializer.validated_data.get('product_id')
            variant_id = serializer.validated_data.get('variant_id')
            quantity = serializer.validated_data.get('quantity', 1)
            
            # Get product or variant
            product = None
            variant = None
            
            if product_id:
                product = get_object_or_404(Product, id=product_id, is_active=True)
            elif variant_id:
                variant = get_object_or_404(ProductVariant, id=variant_id, is_active=True)
            
            # Check if item already exists in cart
            existing_item = None
            if product:
                existing_item = CartItem.objects.filter(cart=cart, product=product, variant=None, saved_for_later=False).first()
            elif variant:
                existing_item = CartItem.objects.filter(cart=cart, variant=variant, saved_for_later=False).first()
            
            if existing_item:
                # Update quantity if item already exists
                existing_item.quantity += quantity
                existing_item.save()
                serializer = CartItemSerializer(existing_item)
                return Response(serializer.data)
            else:
                # Create new cart item
                cart_item = CartItem.objects.create(
                    cart=cart,
                    product=product,
                    variant=variant,
                    quantity=quantity
                )
                serializer = CartItemSerializer(cart_item)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='update-item/(?P<item_id>[^/.]+)')
    def update_item(self, request, item_id=None):
        """Update the quantity of a cart item."""
        cart = self.get_cart(request)
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart, saved_for_later=False)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UpdateCartItemSerializer(data=request.data)
        if serializer.is_valid():
            cart_item.quantity = serializer.validated_data['quantity']
            cart_item.save()
            return Response(CartItemSerializer(cart_item).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['delete'], url_path='remove-item/(?P<item_id>[^/.]+)')
    def remove_item(self, request, item_id=None):
        """Remove an item from the cart."""
        cart = self.get_cart(request)
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'], url_path='save-for-later/(?P<item_id>[^/.]+)')
    def save_for_later(self, request, item_id=None):
        """Save a cart item for later."""
        cart = self.get_cart(request)
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart, saved_for_later=False)
            cart_item.saved_for_later = True
            cart_item.save()
            return Response(CartItemSerializer(cart_item).data)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'], url_path='move-to-cart/(?P<item_id>[^/.]+)')
    def move_to_cart(self, request, item_id=None):
        """Move a saved item back to the cart."""
        cart = self.get_cart(request)
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart, saved_for_later=True)
            cart_item.saved_for_later = False
            cart_item.save()
            return Response(CartItemSerializer(cart_item).data)
        except CartItem.DoesNotExist:
            return Response({"error": "Saved item not found"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def saved_items(self, request):
        """Get items saved for later."""
        cart = self.get_cart(request)
        saved_items = CartItem.objects.filter(cart=cart, saved_for_later=True)
        serializer = CartItemSerializer(saved_items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Clear all items from the cart."""
        cart = self.get_cart(request)
        CartItem.objects.filter(cart=cart, saved_for_later=False).delete()
        return Response({"message": "Cart cleared successfully"}, status=status.HTTP_200_OK)
