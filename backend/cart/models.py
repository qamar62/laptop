from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product, ProductVariant
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver

User = get_user_model()


class Cart(models.Model):
    """Model for shopping cart."""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='cart')
    session_id = models.CharField(max_length=255, null=True, blank=True)  # For guest users
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        if self.user:
            return f"Cart for {self.user.email}"
        return f"Guest cart {self.session_id}"
    
    @property
    def total_items(self):
        """Get the total number of items in the cart."""
        return sum(item.quantity for item in self.items.all())
    
    @property
    def subtotal(self):
        """Calculate the subtotal of all items in the cart."""
        return sum(item.total_price for item in self.items.all())
    
    @property
    def is_empty(self):
        """Check if the cart is empty."""
        return self.items.count() == 0
    
    def merge_with(self, other_cart):
        """Merge another cart into this one."""
        if not other_cart or other_cart.is_empty:
            return
        
        for item in other_cart.items.all():
            # Check if this product/variant already exists in the current cart
            existing_item = None
            if item.product:
                existing_item = self.items.filter(product=item.product, variant=None).first()
            elif item.variant:
                existing_item = self.items.filter(variant=item.variant).first()
            
            if existing_item:
                # Update quantity if item already exists
                existing_item.quantity += item.quantity
                existing_item.save()
            else:
                # Create new item in this cart
                CartItem.objects.create(
                    cart=self,
                    product=item.product,
                    variant=item.variant,
                    quantity=item.quantity
                )
        
        # Delete the other cart after merging
        other_cart.delete()


class CartItem(models.Model):
    """Model for items in the shopping cart."""
    
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    saved_for_later = models.BooleanField(default=False)
    
    class Meta:
        unique_together = [
            ('cart', 'product', 'saved_for_later'),
            ('cart', 'variant', 'saved_for_later')
        ]
    
    def __str__(self):
        if self.product:
            return f"{self.quantity} x {self.product.name} in {self.cart}"
        return f"{self.quantity} x {self.variant.product.name} - {self.variant.name} in {self.cart}"
    
    @property
    def unit_price(self):
        """Get the unit price of the item."""
        if self.variant:
            if self.variant.is_on_sale and self.variant.sale_price:
                return self.variant.sale_price
            return self.variant.price
        
        if self.product:
            if self.product.is_on_sale and self.product.sale_price:
                return self.product.sale_price
            return self.product.price
        
        return 0
    
    @property
    def total_price(self):
        """Calculate the total price for this item."""
        return self.unit_price * self.quantity
    
    def clean(self):
        """Ensure that either product or variant is set, but not both."""
        from django.core.exceptions import ValidationError
        
        if self.product and self.variant:
            raise ValidationError("A cart item cannot have both a product and a variant.")
        if not self.product and not self.variant:
            raise ValidationError("A cart item must have either a product or a variant.")


class SavedForLater(models.Model):
    """Model for items saved for later."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [
            ('user', 'product'),
            ('user', 'variant')
        ]
    
    def __str__(self):
        if self.product:
            return f"{self.product.name} saved by {self.user.email}"
        return f"{self.variant.product.name} - {self.variant.name} saved by {self.user.email}"


# Signal handlers to update cart when items change
@receiver(pre_save, sender=CartItem)
def validate_cart_item(sender, instance, **kwargs):
    """Validate cart item before saving."""
    instance.clean()


@receiver(post_save, sender=CartItem)
@receiver(post_delete, sender=CartItem)
def update_cart(sender, instance, **kwargs):
    """Update cart timestamps when items change."""
    instance.cart.save()  # This will update the 'updated_at' field
