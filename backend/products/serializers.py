from rest_framework import serializers
from .models import (
    Category, Brand, Product, ProductImage, ProductAttribute, 
    ProductAttributeValue, ProductVariant, VariantAttributeValue, 
    Inventory, Review, Wishlist, RecentlyViewed
)


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for the Category model."""
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'parent', 'description', 
            'image', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class BrandSerializer(serializers.ModelSerializer):
    """Serializer for the Brand model."""
    
    class Meta:
        model = Brand
        fields = [
            'id', 'name', 'slug', 'description', 'logo', 
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for the ProductImage model."""
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductAttributeSerializer(serializers.ModelSerializer):
    """Serializer for the ProductAttribute model."""
    
    class Meta:
        model = ProductAttribute
        fields = ['id', 'name', 'description']
        read_only_fields = ['id']


class ProductAttributeValueSerializer(serializers.ModelSerializer):
    """Serializer for the ProductAttributeValue model."""
    
    attribute_name = serializers.CharField(source='attribute.name', read_only=True)
    
    class Meta:
        model = ProductAttributeValue
        fields = ['id', 'attribute', 'attribute_name', 'value']
        read_only_fields = ['id']


class VariantAttributeValueSerializer(serializers.ModelSerializer):
    """Serializer for the VariantAttributeValue model."""
    
    attribute_name = serializers.CharField(source='attribute.name', read_only=True)
    
    class Meta:
        model = VariantAttributeValue
        fields = ['id', 'attribute', 'attribute_name', 'value']
        read_only_fields = ['id']


class InventorySerializer(serializers.ModelSerializer):
    """Serializer for the Inventory model."""
    
    is_low_stock = serializers.BooleanField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Inventory
        fields = [
            'id', 'quantity', 'low_stock_threshold', 
            'is_low_stock', 'is_in_stock', 'last_checked'
        ]
        read_only_fields = ['id', 'last_checked']


class ProductVariantSerializer(serializers.ModelSerializer):
    """Serializer for the ProductVariant model."""
    
    attribute_values = VariantAttributeValueSerializer(many=True, read_only=True)
    inventory = InventorySerializer(read_only=True)
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'name', 'sku', 'price', 'sale_price', 'is_on_sale',
            'is_default', 'is_active', 'attribute_values', 'inventory',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for listing products."""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    primary_image = serializers.SerializerMethodField()
    discount_percentage = serializers.FloatField(read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'category', 'category_name',
            'brand', 'brand_name', 'short_description', 'price',
            'sale_price', 'is_on_sale', 'current_price', 'discount_percentage',
            'primary_image', 'is_featured', 'availability', 'created_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at']
    
    def get_primary_image(self, obj):
        """Get the primary image URL for the product."""
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return self.context['request'].build_absolute_uri(primary_image.image.url)
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed product information."""
    
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    attribute_values = ProductAttributeValueSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    inventory = InventorySerializer(read_only=True)
    discount_percentage = serializers.FloatField(read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'category', 'brand',
            'short_description', 'description', 'price', 'sale_price',
            'is_on_sale', 'current_price', 'discount_percentage',
            'is_featured', 'is_active', 'availability', 'warranty_info',
            'images', 'attribute_values', 'variants', 'inventory',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for product reviews."""
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'product', 'user', 'user_email', 'user_name',
            'rating', 'title', 'comment', 'is_verified_purchase',
            'is_approved', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'user_email', 'is_verified_purchase', 'is_approved', 'created_at', 'updated_at']
    
    def get_user_name(self, obj):
        """Get the user's full name or email if not available."""
        if obj.user.get_full_name():
            return obj.user.get_full_name()
        return obj.user.email


class WishlistSerializer(serializers.ModelSerializer):
    """Serializer for user wishlists."""
    
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'product', 'added_at']
        read_only_fields = ['id', 'user', 'added_at']


class RecentlyViewedSerializer(serializers.ModelSerializer):
    """Serializer for recently viewed products."""
    
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = RecentlyViewed
        fields = ['id', 'user', 'product', 'viewed_at']
        read_only_fields = ['id', 'user', 'viewed_at']
