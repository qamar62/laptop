from rest_framework import serializers
from .models import Order, OrderItem, Payment, Coupon, OrderStatusHistory
from users.serializers import AddressSerializer
from products.serializers import ProductListSerializer, ProductVariantSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items."""
    
    product_details = serializers.SerializerMethodField()
    variant_details = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'variant', 'product_details', 'variant_details',
            'product_name', 'variant_name', 'sku', 'price', 'quantity', 'total_price'
        ]
        read_only_fields = ['id', 'product_name', 'variant_name', 'total_price']
    
    def get_product_details(self, obj):
        """Get product details if available."""
        if obj.product:
            return ProductListSerializer(obj.product, context=self.context).data
        return None
    
    def get_variant_details(self, obj):
        """Get variant details if available."""
        if obj.variant:
            return ProductVariantSerializer(obj.variant).data
        return None


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payment transactions."""
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_method', 'transaction_id', 'amount', 'status',
            'created_at', 'updated_at', 'payment_details'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer for order status history."""
    
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderStatusHistory
        fields = [
            'id', 'status', 'notes', 'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_created_by_name(self, obj):
        """Get the name of the user who created the status update."""
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return None


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders."""
    
    items = OrderItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    shipping_address_details = serializers.SerializerMethodField()
    billing_address_details = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'user_email', 'email', 'status',
            'payment_status', 'shipping_address', 'shipping_address_details',
            'billing_address', 'billing_address_details', 'shipping_method',
            'shipping_cost', 'tax_amount', 'subtotal', 'total', 'discount_amount',
            'coupon_code', 'notes', 'tracking_number', 'is_guest_checkout',
            'payment_method', 'payment_id', 'stripe_payment_intent_id',
            'items', 'payments', 'status_history', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'subtotal', 'total', 'created_at', 'updated_at',
            'payment_id', 'stripe_payment_intent_id'
        ]
    
    def get_shipping_address_details(self, obj):
        """Get shipping address details if available."""
        if obj.shipping_address:
            return AddressSerializer(obj.shipping_address).data
        return None
    
    def get_billing_address_details(self, obj):
        """Get billing address details if available."""
        if obj.billing_address:
            return AddressSerializer(obj.billing_address).data
        return None


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders."""
    
    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )
    
    class Meta:
        model = Order
        fields = [
            'email', 'shipping_address', 'billing_address', 'shipping_method',
            'shipping_cost', 'tax_amount', 'discount_amount', 'coupon_code',
            'notes', 'is_guest_checkout', 'payment_method', 'items'
        ]
    
    def create(self, validated_data):
        """Create an order with items."""
        items_data = validated_data.pop('items')
        user = self.context['request'].user if self.context['request'].user.is_authenticated else None
        
        # Create order
        order = Order.objects.create(
            user=user,
            **validated_data
        )
        
        # Create order items
        for item_data in items_data:
            product_id = item_data.get('product_id')
            variant_id = item_data.get('variant_id')
            quantity = item_data.get('quantity', 1)
            price = item_data.get('price')
            
            item = OrderItem(
                order=order,
                quantity=quantity,
                price=price
            )
            
            if product_id:
                from products.models import Product
                product = Product.objects.get(id=product_id)
                item.product = product
                item.product_name = product.name
                item.sku = product.sku
            
            if variant_id:
                from products.models import ProductVariant
                variant = ProductVariant.objects.get(id=variant_id)
                item.variant = variant
                item.variant_name = variant.name
                item.sku = variant.sku
            
            item.save()
        
        # Recalculate order totals
        order.save()
        
        return order


class CouponSerializer(serializers.ModelSerializer):
    """Serializer for discount coupons."""
    
    is_valid = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'minimum_order_amount', 'is_active', 'valid_from', 'valid_to',
            'max_uses', 'times_used', 'is_valid', 'created_at'
        ]
        read_only_fields = ['id', 'times_used', 'created_at']


class CouponApplySerializer(serializers.Serializer):
    """Serializer for applying a coupon to an order."""
    
    code = serializers.CharField(max_length=50)
    order_total = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    
    def validate_code(self, value):
        """Validate that the coupon code exists and is valid."""
        try:
            coupon = Coupon.objects.get(code=value)
            if not coupon.is_valid:
                raise serializers.ValidationError("This coupon is no longer valid.")
            return value
        except Coupon.DoesNotExist:
            raise serializers.ValidationError("Invalid coupon code.")


class OrderStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating order status."""
    
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)


class PaymentStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating payment status."""
    
    payment_status = serializers.ChoiceField(choices=Order.PAYMENT_STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)
