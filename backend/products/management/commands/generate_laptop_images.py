import os
import random
import requests
from io import BytesIO
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from products.models import Product, ProductImage

# List of laptop image URLs from Unsplash
LAPTOP_IMAGES = [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1000',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1000',
    'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?q=80&w=1000',
    'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1000',
    'https://images.unsplash.com/photo-1593642634367-d91a135587b5?q=80&w=1000',
    'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?q=80&w=1000',
    'https://images.unsplash.com/photo-1593642533144-3d62aa4783ec?q=80&w=1000',
    'https://images.unsplash.com/photo-1602080858428-57174f9431cf?q=80&w=1000',
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1000',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1000',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1000',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1000',
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1000',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1000',
    'https://images.unsplash.com/photo-1542393545-10f5cde2c810?q=80&w=1000',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000',
    'https://images.unsplash.com/photo-1504707748692-419802cf939d?q=80&w=1000',
    'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?q=80&w=1000',
]

# Brand-specific image URLs
BRAND_IMAGES = {
    'Apple': [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1000',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1000',
    ],
    'Dell': [
        'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1000',
        'https://images.unsplash.com/photo-1593642634367-d91a135587b5?q=80&w=1000',
    ],
    'Lenovo': [
        'https://images.unsplash.com/photo-1602080858428-57174f9431cf?q=80&w=1000',
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1000',
    ],
}

class Command(BaseCommand):
    help = 'Generate images for laptop products'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting to generate laptop images...')
        
        products = Product.objects.filter(category__name='Laptops')
        
        if not products.exists():
            self.stdout.write(self.style.WARNING('No laptop products found. Run generate_laptop_data command first.'))
            return
            
        self.stdout.write(f'Found {products.count()} laptop products')
        
        for product in products:
            self.add_images_to_product(product)
            
        self.stdout.write(self.style.SUCCESS('Successfully generated laptop images!'))
    
    def add_images_to_product(self, product):
        # Check if product already has images
        if ProductImage.objects.filter(product=product).exists():
            self.stdout.write(f'Product {product.name} already has images, skipping...')
            return
            
        # Get brand-specific images if available, otherwise use general images
        brand_name = product.brand.name
        image_urls = BRAND_IMAGES.get(brand_name, LAPTOP_IMAGES)
        
        # Shuffle the image URLs to get random ones
        random.shuffle(image_urls)
        
        # Add 3-5 images to the product
        num_images = random.randint(3, 5)
        for i in range(min(num_images, len(image_urls))):
            image_url = image_urls[i]
            is_primary = (i == 0)  # First image is primary
            
            try:
                # Download the image
                response = requests.get(image_url, timeout=10)
                response.raise_for_status()
                
                # Generate a filename
                filename = f"{product.slug}_{i+1}.jpg"
                
                # Create the ProductImage
                image = ProductImage(
                    product=product,
                    is_primary=is_primary,
                    alt_text=f"{product.name} - Image {i+1}"
                )
                
                # Save the image file
                image.image.save(filename, ContentFile(response.content), save=True)
                
                self.stdout.write(f'Added image {i+1} to {product.name}')
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error adding image to {product.name}: {str(e)}'))
