from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model

User = get_user_model()


class Category(models.Model):
    """Model for product categories."""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Brand(models.Model):
    """Model for product brands."""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    """Model for products."""
    
    AVAILABILITY_CHOICES = (
        ('in_stock', 'In Stock'),
        ('limited_stock', 'Limited Stock'),
        ('out_of_stock', 'Out of Stock'),
        ('pre_order', 'Pre-Order'),
        ('back_order', 'Back-Order'),
    )
    
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    sku = models.CharField(max_length=50, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='products')
    short_description = models.TextField(blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_on_sale = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='in_stock')
    warranty_info = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    @property
    def current_price(self):
        """Return the current price (sale price if on sale, otherwise regular price)."""
        if self.is_on_sale and self.sale_price:
            return self.sale_price
        return self.price
    
    @property
    def discount_percentage(self):
        """Calculate discount percentage if the product is on sale."""
        if self.is_on_sale and self.sale_price and self.price > 0:
            discount = ((self.price - self.sale_price) / self.price) * 100
            return round(discount, 2)
        return 0


class ProductImage(models.Model):
    """Model for product images."""
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_primary', 'created_at']
    
    def __str__(self):
        return f"Image for {self.product.name}"
    
    def save(self, *args, **kwargs):
        # If this image is being set as primary, unset any other primary images
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)


class ProductAttribute(models.Model):
    """Model for product attribute types (e.g., Processor, RAM, Storage)."""
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name


class ProductAttributeValue(models.Model):
    """Model for product attribute values (e.g., Intel i7, 16GB, 512GB SSD)."""
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attribute_values')
    attribute = models.ForeignKey(ProductAttribute, on_delete=models.CASCADE)
    value = models.CharField(max_length=255)
    
    class Meta:
        unique_together = ('product', 'attribute')
    
    def __str__(self):
        return f"{self.attribute.name}: {self.value}"


class ProductVariant(models.Model):
    """Model for product variants (e.g., different configurations of the same product)."""
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=50, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_on_sale = models.BooleanField(default=False)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.product.name} - {self.name}"


class VariantAttributeValue(models.Model):
    """Model for variant attribute values."""
    
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='attribute_values')
    attribute = models.ForeignKey(ProductAttribute, on_delete=models.CASCADE)
    value = models.CharField(max_length=255)
    
    class Meta:
        unique_together = ('variant', 'attribute')
    
    def __str__(self):
        return f"{self.variant.name} - {self.attribute.name}: {self.value}"


class Inventory(models.Model):
    """Model for inventory management."""
    
    product = models.OneToOneField(Product, on_delete=models.CASCADE, null=True, blank=True, related_name='inventory')
    variant = models.OneToOneField(ProductVariant, on_delete=models.CASCADE, null=True, blank=True, related_name='inventory')
    quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)
    last_checked = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Inventories'
    
    def __str__(self):
        if self.product:
            return f"Inventory for {self.product.name}"
        return f"Inventory for {self.variant.product.name} - {self.variant.name}"
    
    @property
    def is_low_stock(self):
        """Check if the inventory is below the low stock threshold."""
        return self.quantity <= self.low_stock_threshold
    
    @property
    def is_in_stock(self):
        """Check if the product is in stock."""
        return self.quantity > 0


class Review(models.Model):
    """Model for product reviews."""
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=255)
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('product', 'user')
    
    def __str__(self):
        return f"{self.user.email}'s review for {self.product.name}"


class Wishlist(models.Model):
    """Model for user wishlists."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlists')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-added_at']
    
    def __str__(self):
        return f"{self.user.email}'s wishlist item: {self.product.name}"


class RecentlyViewed(models.Model):
    """Model for tracking recently viewed products."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recently_viewed')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-viewed_at']
    
    def __str__(self):
        return f"{self.user.email} viewed {self.product.name}"
