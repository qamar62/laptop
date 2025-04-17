from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from .models import Order, OrderItem, Payment, Coupon, OrderStatusHistory
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderItemSerializer,
    PaymentSerializer, CouponSerializer, CouponApplySerializer,
    OrderStatusUpdateSerializer, PaymentStatusUpdateSerializer
)
from products.models import Product, ProductVariant, Inventory
from cart.models import Cart, CartItem


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for managing orders."""
    
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        elif user.is_authenticated:
            return Order.objects.filter(user=user)
        return Order.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        order = serializer.save()
        
        # Update inventory for ordered items
        for item in order.items.all():
            if item.product:
                inventory = item.product.inventory
                if inventory:
                    inventory.quantity = max(0, inventory.quantity - item.quantity)
                    inventory.save()
            elif item.variant:
                inventory = item.variant.inventory
                if inventory:
                    inventory.quantity = max(0, inventory.quantity - item.quantity)
                    inventory.save()
        
        # Clear the cart if user is authenticated
        user = self.request.user
        if user.is_authenticated:
            try:
                cart = Cart.objects.get(user=user)
                CartItem.objects.filter(cart=cart, saved_for_later=False).delete()
            except Cart.DoesNotExist:
                pass
        
        return order
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update the status of an order."""
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            order.status = serializer.validated_data['status']
            notes = serializer.validated_data.get('notes', '')
            order.save()
            
            # Create status history entry
            OrderStatusHistory.objects.create(
                order=order,
                status=order.status,
                notes=notes,
                created_by=request.user
            )
            
            return Response(OrderSerializer(order).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_payment_status(self, request, pk=None):
        """Update the payment status of an order."""
        order = self.get_object()
        serializer = PaymentStatusUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            order.payment_status = serializer.validated_data['payment_status']
            order.save()
            return Response(OrderSerializer(order).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """Get orders for the current user."""
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        orders = Order.objects.filter(user=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def checkout_from_cart(self, request):
        """Create an order from the user's cart."""
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            cart = Cart.objects.get(user=request.user)
            if cart.is_empty:
                return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Prepare order data
            order_data = {
                'email': request.user.email,
                'shipping_address': request.data.get('shipping_address'),
                'billing_address': request.data.get('billing_address'),
                'shipping_method': request.data.get('shipping_method', ''),
                'shipping_cost': request.data.get('shipping_cost', 0),
                'tax_amount': request.data.get('tax_amount', 0),
                'discount_amount': request.data.get('discount_amount', 0),
                'coupon_code': request.data.get('coupon_code', ''),
                'notes': request.data.get('notes', ''),
                'payment_method': request.data.get('payment_method', ''),
                'items': []
            }
            
            # Add cart items to order data
            for item in cart.items.filter(saved_for_later=False):
                item_data = {
                    'quantity': item.quantity,
                    'price': float(item.unit_price)
                }
                
                if item.product:
                    item_data['product_id'] = item.product.id
                elif item.variant:
                    item_data['variant_id'] = item.variant.id
                
                order_data['items'].append(item_data)
            
            # Create order
            serializer = OrderCreateSerializer(data=order_data, context={'request': request})
            if serializer.is_valid():
                order = serializer.save()
                
                # Clear the cart
                CartItem.objects.filter(cart=cart, saved_for_later=False).delete()
                
                return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Cart.DoesNotExist:
            return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)


class CouponViewSet(viewsets.ModelViewSet):
    """ViewSet for managing coupons."""
    
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    
    def get_permissions(self):
        if self.action == 'validate':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    
    @action(detail=False, methods=['post'])
    def validate(self, request):
        """Validate a coupon code."""
        serializer = CouponApplySerializer(data=request.data)
        
        if serializer.is_valid():
            code = serializer.validated_data['code']
            order_total = serializer.validated_data.get('order_total')
            
            try:
                coupon = Coupon.objects.get(code=code)
                
                # Check if coupon is valid
                if not coupon.is_valid:
                    return Response({"error": "This coupon is no longer valid"}, status=status.HTTP_400_BAD_REQUEST)
                
                # Check minimum order amount
                if order_total and coupon.minimum_order_amount > 0 and order_total < coupon.minimum_order_amount:
                    return Response({
                        "error": f"This coupon requires a minimum order of ${coupon.minimum_order_amount}"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Calculate discount
                discount = 0
                if coupon.discount_type == 'percentage' and order_total:
                    discount = order_total * (coupon.discount_value / 100)
                elif coupon.discount_type == 'fixed':
                    discount = coupon.discount_value
                
                return Response({
                    "valid": True,
                    "coupon": CouponSerializer(coupon).data,
                    "discount": discount
                })
                
            except Coupon.DoesNotExist:
                return Response({"error": "Invalid coupon code"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
