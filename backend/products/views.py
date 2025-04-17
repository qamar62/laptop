from rest_framework import viewsets, generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q, Avg
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Category, Brand, Product, ProductImage, ProductAttribute, 
    ProductAttributeValue, ProductVariant, VariantAttributeValue, 
    Inventory, Review, Wishlist, RecentlyViewed
)
from .serializers import (
    CategorySerializer, BrandSerializer, ProductListSerializer,
    ProductDetailSerializer, ProductImageSerializer, ProductAttributeSerializer,
    ProductVariantSerializer, InventorySerializer, ReviewSerializer,
    WishlistSerializer, RecentlyViewedSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing product categories."""
    
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    
    @action(detail=True, methods=['get'])
    def products(self, request, slug=None):
        """Get all products in a category."""
        category = self.get_object()
        products = Product.objects.filter(category=category, is_active=True)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def root(self, request):
        """Get all root categories (categories without a parent)."""
        categories = Category.objects.filter(parent=None, is_active=True)
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


class BrandViewSet(viewsets.ModelViewSet):
    """ViewSet for managing product brands."""
    
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    
    @action(detail=True, methods=['get'])
    def products(self, request, slug=None):
        """Get all products of a brand."""
        brand = self.get_object()
        products = Product.objects.filter(brand=brand, is_active=True)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for managing products."""
    
    queryset = Product.objects.filter(is_active=True)
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'is_featured', 'availability']
    search_fields = ['name', 'description', 'short_description', 'sku']
    ordering_fields = ['name', 'price', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductDetailSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'featured', 'search', 'by_category', 'by_brand']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products."""
        products = Product.objects.filter(is_featured=True, is_active=True)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search products by query parameter."""
        query = request.query_params.get('q', '')
        if not query:
            return Response({'error': 'Query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        products = Product.objects.filter(
            Q(name__icontains=query) | 
            Q(description__icontains=query) | 
            Q(short_description__icontains=query) |
            Q(sku__icontains=query) |
            Q(category__name__icontains=query) |
            Q(brand__name__icontains=query),
            is_active=True
        )
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get products by category slug."""
        slug = request.query_params.get('slug', '')
        if not slug:
            return Response({'error': 'Category slug is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        category = get_object_or_404(Category, slug=slug, is_active=True)
        products = Product.objects.filter(category=category, is_active=True)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_brand(self, request):
        """Get products by brand slug."""
        slug = request.query_params.get('slug', '')
        if not slug:
            return Response({'error': 'Brand slug is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        brand = get_object_or_404(Brand, slug=slug, is_active=True)
        products = Product.objects.filter(brand=brand, is_active=True)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def variants(self, request, slug=None):
        """Get all variants of a product."""
        product = self.get_object()
        variants = product.variants.filter(is_active=True)
        serializer = ProductVariantSerializer(variants, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, slug=None):
        """Get all approved reviews of a product."""
        product = self.get_object()
        reviews = product.reviews.filter(is_approved=True)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_to_wishlist(self, request, slug=None):
        """Add a product to the user's wishlist."""
        product = self.get_object()
        user = request.user
        
        # Check if product is already in wishlist
        wishlist_item, created = Wishlist.objects.get_or_create(user=user, product=product)
        
        if created:
            return Response({'message': 'Product added to wishlist'}, status=status.HTTP_201_CREATED)
        return Response({'message': 'Product already in wishlist'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def remove_from_wishlist(self, request, slug=None):
        """Remove a product from the user's wishlist."""
        product = self.get_object()
        user = request.user
        
        try:
            wishlist_item = Wishlist.objects.get(user=user, product=product)
            wishlist_item.delete()
            return Response({'message': 'Product removed from wishlist'}, status=status.HTTP_200_OK)
        except Wishlist.DoesNotExist:
            return Response({'message': 'Product not in wishlist'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def track_view(self, request, slug=None):
        """Track a product view for the current user."""
        product = self.get_object()
        user = request.user
        
        # Update or create recently viewed record
        RecentlyViewed.objects.update_or_create(user=user, product=product)
        
        return Response({'message': 'Product view tracked'}, status=status.HTTP_200_OK)


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for managing product reviews."""
    
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Review.objects.all()
        return Review.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        product_id = self.request.data.get('product')
        product = get_object_or_404(Product, id=product_id)
        
        # Check if user already reviewed this product
        if Review.objects.filter(user=self.request.user, product=product).exists():
            raise serializers.ValidationError({'error': 'You have already reviewed this product'})
        
        serializer.save(user=self.request.user, is_approved=False)


class WishlistViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for managing user wishlists."""
    
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)


class RecentlyViewedViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for managing recently viewed products."""
    
    serializer_class = RecentlyViewedSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return RecentlyViewed.objects.filter(user=self.request.user)
