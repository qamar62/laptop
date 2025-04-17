from django.contrib import admin
from .models import (
    Category, Brand, Product, ProductImage, ProductAttribute, 
    ProductAttributeValue, ProductVariant, VariantAttributeValue, 
    Inventory, Review, Wishlist, RecentlyViewed
)


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'is_active', 'created_at')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductAttributeValueInline(admin.TabularInline):
    model = ProductAttributeValue
    extra = 1


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


class InventoryInline(admin.TabularInline):
    model = Inventory
    extra = 1
    max_num = 1


class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'category', 'brand', 'price', 'is_on_sale', 'is_active', 'availability')
    list_filter = ('is_active', 'is_on_sale', 'is_featured', 'availability', 'category', 'brand')
    search_fields = ('name', 'sku', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, ProductAttributeValueInline, ProductVariantInline, InventoryInline]
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'sku', 'category', 'brand')
        }),
        ('Description', {
            'fields': ('short_description', 'description')
        }),
        ('Pricing', {
            'fields': ('price', 'sale_price', 'is_on_sale')
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured', 'availability', 'warranty_info')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


class VariantAttributeValueInline(admin.TabularInline):
    model = VariantAttributeValue
    extra = 1


class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('name', 'product', 'sku', 'price', 'is_on_sale', 'is_active')
    list_filter = ('is_active', 'is_on_sale', 'is_default', 'product')
    search_fields = ('name', 'sku', 'product__name')
    inlines = [VariantAttributeValueInline, InventoryInline]


class ProductAttributeAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name', 'description')


class InventoryAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'quantity', 'low_stock_threshold', 'is_low_stock', 'is_in_stock', 'last_checked')
    list_filter = ('quantity', 'low_stock_threshold')
    search_fields = ('product__name', 'variant__name')
    readonly_fields = ('is_low_stock', 'is_in_stock')


class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'title', 'is_verified_purchase', 'is_approved', 'created_at')
    list_filter = ('rating', 'is_verified_purchase', 'is_approved')
    search_fields = ('product__name', 'user__email', 'title', 'comment')
    readonly_fields = ('created_at', 'updated_at')


class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('user__email', 'product__name')


class RecentlyViewedAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'viewed_at')
    list_filter = ('viewed_at',)
    search_fields = ('user__email', 'product__name')


# Register models
admin.site.register(Category, CategoryAdmin)
admin.site.register(Brand, BrandAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(ProductVariant, ProductVariantAdmin)
admin.site.register(ProductAttribute, ProductAttributeAdmin)
admin.site.register(Inventory, InventoryAdmin)
admin.site.register(Review, ReviewAdmin)
admin.site.register(Wishlist, WishlistAdmin)
admin.site.register(RecentlyViewed, RecentlyViewedAdmin)
