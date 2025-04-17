from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product, ProductVariant
from users.models import Address
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

User = get_user_model()


class Order(models.Model):
    """Model for customer orders."""
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    order_number = models.CharField(max_length=50, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    email = models.EmailField()  # Store email separately in case user is deleted
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    shipping_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, related_name='shipping_orders')
    billing_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, related_name='billing_orders')
    shipping_method = models.CharField(max_length=100, blank=True)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    coupon_code = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    is_guest_checkout = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Payment information
    payment_method = models.CharField(max_length=100, blank=True)
    payment_id = models.CharField(max_length=255, blank=True)  # Payment gateway transaction ID
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.order_number}"
    
    def save(self, *args, **kwargs):
        # Generate order number if it doesn't exist
        if not self.order_number:
            self.order_number = self.generate_order_number()
        
        # Calculate totals
        self.subtotal = sum(item.total_price for item in self.items.all())
        self.total = self.subtotal + self.shipping_cost + self.tax_amount - self.discount_amount
        
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_order_number():
        """Generate a unique order number."""
        return f"ORD-{uuid.uuid4().hex[:8].upper()}"


class OrderItem(models.Model):
    """Model for items in an order."""
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    product_name = models.CharField(max_length=255)  # Store name in case product is deleted
    variant_name = models.CharField(max_length=255, blank=True)  # Store name in case variant is deleted
    sku = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity} x {self.product_name} in {self.order}"
    
    def save(self, *args, **kwargs):
        # Set product and variant names
        if self.product and not self.product_name:
            self.product_name = self.product.name
            self.sku = self.product.sku
        if self.variant and not self.variant_name:
            self.variant_name = self.variant.name
            self.sku = self.variant.sku
        
        # Calculate total price
        self.total_price = self.price * self.quantity
        
        super().save(*args, **kwargs)


class Payment(models.Model):
    """Model for payment transactions."""
    
    PAYMENT_METHOD_CHOICES = (
        ('stripe', 'Stripe'),
        ('paypal', 'PayPal'),
        ('bank_transfer', 'Bank Transfer'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Payment gateway specific fields
    payment_details = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.payment_method} payment of {self.amount} for {self.order}"


class Coupon(models.Model):
    """Model for discount coupons."""
    
    DISCOUNT_TYPE_CHOICES = (
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    )
    
    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255, blank=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)  # Percentage or fixed amount
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    max_uses = models.PositiveIntegerField(default=0)  # 0 means unlimited
    times_used = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.code
    
    @property
    def is_valid(self):
        """Check if the coupon is currently valid."""
        from django.utils import timezone
        now = timezone.now()
        
        if not self.is_active:
            return False
        
        if self.valid_from > now or self.valid_to < now:
            return False
        
        if self.max_uses > 0 and self.times_used >= self.max_uses:
            return False
        
        return True


class OrderStatusHistory(models.Model):
    """Model for tracking order status changes."""
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20, choices=Order.STATUS_CHOICES)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Order status histories'
    
    def __str__(self):
        return f"{self.order} - {self.status} at {self.created_at}"


# Signal handler to create order status history when order status changes
@receiver(post_save, sender=Order)
def create_order_status_history(sender, instance, created, **kwargs):
    """Create order status history when order is created or status is changed."""
    if created:
        OrderStatusHistory.objects.create(order=instance, status=instance.status)
    else:
        # Get the latest status history
        latest_status = instance.status_history.order_by('-created_at').first()
        
        # Create new status history only if status has changed
        if latest_status and latest_status.status != instance.status:
            OrderStatusHistory.objects.create(order=instance, status=instance.status)
