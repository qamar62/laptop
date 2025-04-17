from rest_framework import serializers
from .models import Cart, CartItem, SavedForLater
from products.serializers import ProductListSerializer, ProductVariantSerializer


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items."""
    
    product_details = serializers.SerializerMethodField()
    variant_details = serializers.SerializerMethodField()
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'variant', 'product_details', 'variant_details',
            'quantity', 'unit_price', 'total_price', 'saved_for_later',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_product_details(self, obj):
        """Get product details if the cart item has a product."""
        if obj.product:
            return ProductListSerializer(obj.product, context=self.context).data
        return None
    
    def get_variant_details(self, obj):
        """Get variant details if the cart item has a variant."""
        if obj.variant:
            return ProductVariantSerializer(obj.variant).data
        return None
    
    def validate(self, attrs):
        """Validate that either product or variant is provided, but not both."""
        product = attrs.get('product')
        variant = attrs.get('variant')
        
        if product and variant:
            raise serializers.ValidationError("A cart item cannot have both a product and a variant.")
        if not product and not variant:
            raise serializers.ValidationError("A cart item must have either a product or a variant.")
        
        return attrs


class CartSerializer(serializers.ModelSerializer):
    """Serializer for shopping cart."""
    
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_empty = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Cart
        fields = [
            'id', 'user', 'session_id', 'items', 'total_items',
            'subtotal', 'is_empty', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class AddToCartSerializer(serializers.Serializer):
    """Serializer for adding items to cart."""
    
    product_id = serializers.IntegerField(required=False)
    variant_id = serializers.IntegerField(required=False)
    quantity = serializers.IntegerField(min_value=1, default=1)
    
    def validate(self, attrs):
        """Validate that either product_id or variant_id is provided, but not both."""
        product_id = attrs.get('product_id')
        variant_id = attrs.get('variant_id')
        
        if product_id and variant_id:
            raise serializers.ValidationError("Cannot add both a product and a variant to cart.")
        if not product_id and not variant_id:
            raise serializers.ValidationError("Must provide either a product_id or variant_id.")
        
        return attrs


class UpdateCartItemSerializer(serializers.Serializer):
    """Serializer for updating cart item quantity."""
    
    quantity = serializers.IntegerField(min_value=1)


class SavedForLaterSerializer(serializers.ModelSerializer):
    """Serializer for saved for later items."""
    
    product_details = serializers.SerializerMethodField()
    variant_details = serializers.SerializerMethodField()
    
    class Meta:
        model = SavedForLater
        fields = [
            'id', 'user', 'product', 'variant', 'product_details',
            'variant_details', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']
    
    def get_product_details(self, obj):
        """Get product details if the saved item has a product."""
        if obj.product:
            return ProductListSerializer(obj.product, context=self.context).data
        return None
    
    def get_variant_details(self, obj):
        """Get variant details if the saved item has a variant."""
        if obj.variant:
            return ProductVariantSerializer(obj.variant).data
        return None
