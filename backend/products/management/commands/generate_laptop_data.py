import os
import random
import time
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import (
    Category, Brand, Product, ProductImage, 
    ProductAttribute, ProductAttributeValue,
    ProductVariant, VariantAttributeValue, Inventory
)

class Command(BaseCommand):
    help = 'Generate realistic laptop data for the store'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting to generate laptop data...')
        
        # Create or get laptop category
        laptop_category, _ = Category.objects.get_or_create(
            name='Laptops',
            defaults={
                'slug': 'laptops',
                'description': 'Powerful laptops for work, gaming, and everyday use'
            }
        )
        
        # Create laptop brands if they don't exist
        brands = self._create_brands()
        
        # Create product attributes
        attributes = self._create_attributes()
        
        # Generate laptop products
        self._generate_laptops(laptop_category, brands, attributes)
        
        self.stdout.write(self.style.SUCCESS('Successfully generated laptop data!'))
        
    def _create_brands(self):
        """Create laptop brands if they don't exist"""
        brand_data = [
            {
                'name': 'Apple',
                'description': 'Premium laptops with macOS operating system',
            },
            {
                'name': 'Dell',
                'description': 'Business and consumer laptops with excellent build quality',
            },
            {
                'name': 'HP',
                'description': 'Wide range of laptops for home and office use',
            },
            {
                'name': 'Lenovo',
                'description': 'Known for ThinkPad business laptops and Legion gaming series',
            },
            {
                'name': 'ASUS',
                'description': 'Gaming and consumer laptops with innovative features',
            },
            {
                'name': 'Acer',
                'description': 'Affordable laptops with good performance',
            },
            {
                'name': 'Microsoft',
                'description': 'Surface laptops with touchscreen and detachable keyboards',
            },
            {
                'name': 'MSI',
                'description': 'Gaming laptops with high-performance components',
            },
        ]
        
        brands = []
        for data in brand_data:
            brand, created = Brand.objects.get_or_create(
                name=data['name'],
                defaults={
                    'slug': slugify(data['name']),
                    'description': data['description'],
                    'is_active': True
                }
            )
            brands.append(brand)
            action = 'Created' if created else 'Using existing'
            self.stdout.write(f"{action} brand: {brand.name}")
            
        return brands
        
    def _create_attributes(self):
        """Create product attributes for laptops"""
        attribute_data = [
            {
                'name': 'Processor',
                'description': 'CPU model and specifications',
            },
            {
                'name': 'RAM',
                'description': 'Memory capacity',
            },
            {
                'name': 'Storage',
                'description': 'Storage type and capacity',
            },
            {
                'name': 'Display',
                'description': 'Screen size and resolution',
            },
            {
                'name': 'Graphics',
                'description': 'GPU model and specifications',
            },
            {
                'name': 'Operating System',
                'description': 'Pre-installed operating system',
            },
            {
                'name': 'Color',
                'description': 'Laptop color',
            },
            {
                'name': 'Battery Life',
                'description': 'Expected battery life in hours',
            },
        ]
        
        attributes = {}
        for data in attribute_data:
            attribute, created = ProductAttribute.objects.get_or_create(
                name=data['name'],
                defaults={
                    'description': data['description'],
                }
            )
            attributes[data['name']] = attribute
            action = 'Created' if created else 'Using existing'
            self.stdout.write(f"{action} attribute: {attribute.name}")
            
        return attributes
        
    def _generate_laptops(self, category, brands, attributes):
        """Generate laptop products with variants and attributes"""
        # Laptop model data
        laptop_data = [
            {
                'brand': 'Apple',
                'name': 'MacBook Pro M3',
                'short_description': 'Powerful MacBook with M3 chip',
                'description': 'The most powerful MacBook Pro ever with the blazing-fast M3 chip. Experience exceptional performance for demanding tasks like editing high-resolution photos, creating complex 3D scenes, and compiling code faster than ever. The stunning Liquid Retina XDR display delivers extreme dynamic range with incredible detail in shadows and highlights.',
                'price': Decimal('1999.99'),
                'sale_price': Decimal('1899.99'),
                'is_on_sale': True,
                'is_featured': True,
                'warranty_info': '1 year limited warranty',
                'features': [
                    'Apple M3 Pro chip with 12-core CPU and 19-core GPU',
                    '16GB unified memory',
                    '512GB SSD storage',
                    '16-inch Liquid Retina XDR display',
                    'Three Thunderbolt 4 ports, HDMI port, SDXC card slot',
                    'Magic Keyboard with Touch ID',
                    'Force Touch trackpad',
                    'Up to 22 hours of battery life'
                ],
                'variants': [
                    {
                        'name': '512GB / Space Gray',
                        'sku': 'MBP-M3-512-SG',
                        'price': Decimal('1999.99'),
                        'sale_price': Decimal('1899.99'),
                        'attributes': {
                            'Storage': '512GB SSD',
                            'Color': 'Space Gray',
                            'Processor': 'Apple M3 Pro',
                            'RAM': '16GB',
                            'Display': '16-inch Liquid Retina XDR',
                            'Operating System': 'macOS'
                        }
                    },
                    {
                        'name': '1TB / Space Gray',
                        'sku': 'MBP-M3-1TB-SG',
                        'price': Decimal('2199.99'),
                        'sale_price': Decimal('2099.99'),
                        'attributes': {
                            'Storage': '1TB SSD',
                            'Color': 'Space Gray',
                            'Processor': 'Apple M3 Pro',
                            'RAM': '16GB',
                            'Display': '16-inch Liquid Retina XDR',
                            'Operating System': 'macOS'
                        }
                    },
                    {
                        'name': '512GB / Silver',
                        'sku': 'MBP-M3-512-S',
                        'price': Decimal('1999.99'),
                        'sale_price': Decimal('1899.99'),
                        'attributes': {
                            'Storage': '512GB SSD',
                            'Color': 'Silver',
                            'Processor': 'Apple M3 Pro',
                            'RAM': '16GB',
                            'Display': '16-inch Liquid Retina XDR',
                            'Operating System': 'macOS'
                        }
                    },
                ]
            },
            {
                'brand': 'Dell',
                'name': 'XPS 15',
                'short_description': 'Premium ultrabook with InfinityEdge display',
                'description': 'Ultra-thin and powerful laptop with InfinityEdge display. The XPS 15 features a stunning 4K UHD+ display with 100% Adobe RGB color and 94% DCI-P3 color gamut, making it perfect for creative professionals. With the latest Intel processors and NVIDIA graphics, it delivers exceptional performance for photo editing, video production, and other demanding tasks.',
                'price': Decimal('1599.99'),
                'is_featured': True,
                'warranty_info': '1 year limited warranty',
                'features': [
                    '12th Gen Intel Core i7-12700H processor',
                    'NVIDIA GeForce RTX 3050 Ti graphics',
                    '16GB DDR5 RAM',
                    '512GB PCIe SSD',
                    '15.6-inch 4K UHD+ (3840 x 2400) InfinityEdge touch display',
                    'Killer Wi-Fi 6 AX1675 and Bluetooth 5.2',
                    'Backlit keyboard with fingerprint reader',
                    'Up to 13 hours of battery life'
                ],
                'variants': [
                    {
                        'name': '512GB / i7 / 16GB',
                        'sku': 'XPS15-512-I7-16',
                        'price': Decimal('1599.99'),
                        'attributes': {
                            'Storage': '512GB SSD',
                            'Processor': 'Intel Core i7-12700H',
                            'RAM': '16GB',
                            'Display': '15.6-inch 4K UHD+',
                            'Graphics': 'NVIDIA GeForce RTX 3050 Ti',
                            'Operating System': 'Windows 11 Pro',
                            'Color': 'Platinum Silver'
                        }
                    },
                    {
                        'name': '1TB / i7 / 16GB',
                        'sku': 'XPS15-1TB-I7-16',
                        'price': Decimal('1799.99'),
                        'attributes': {
                            'Storage': '1TB SSD',
                            'Processor': 'Intel Core i7-12700H',
                            'RAM': '16GB',
                            'Display': '15.6-inch 4K UHD+',
                            'Graphics': 'NVIDIA GeForce RTX 3050 Ti',
                            'Operating System': 'Windows 11 Pro',
                            'Color': 'Platinum Silver'
                        }
                    },
                ]
            },
        ]
        
        # Add more laptop data programmatically
        laptop_models = [
            ('Lenovo', 'ThinkPad X1 Carbon', 'Business ultrabook with legendary durability', Decimal('1499.99')),
            ('HP', 'Spectre x360', 'Convertible laptop with premium design', Decimal('1399.99')),
            ('ASUS', 'ROG Zephyrus G14', 'Compact gaming powerhouse', Decimal('1499.99')),
            ('Acer', 'Swift 5', 'Ultra-lightweight laptop with powerful performance', Decimal('1099.99')),
            ('Microsoft', 'Surface Laptop 5', 'Sleek and powerful with touchscreen', Decimal('1299.99')),
            ('MSI', 'Creator Z16', 'Content creation laptop with high color accuracy', Decimal('1899.99')),
            ('Apple', 'MacBook Air M2', 'Thin and light with all-day battery life', Decimal('1199.99')),
            ('Dell', 'Inspiron 16', 'Affordable laptop with large display', Decimal('899.99')),
            ('HP', 'Envy 15', 'Creator-focused laptop with powerful specs', Decimal('1299.99')),
            ('Lenovo', 'Legion 5 Pro', 'Gaming laptop with high refresh rate display', Decimal('1399.99')),
            ('ASUS', 'ZenBook 14', 'Compact ultrabook with OLED display', Decimal('1099.99')),
            ('Acer', 'Predator Helios 300', 'High-performance gaming laptop', Decimal('1299.99')),
            ('MSI', 'GS66 Stealth', 'Thin gaming laptop with powerful GPU', Decimal('1799.99')),
            ('HP', 'Pavilion 15', 'Everyday laptop for work and entertainment', Decimal('699.99')),
            ('Dell', 'G15', 'Budget-friendly gaming laptop', Decimal('899.99')),
            ('Lenovo', 'Yoga 9i', 'Premium 2-in-1 convertible with excellent audio', Decimal('1399.99')),
            ('ASUS', 'TUF Gaming A15', 'Durable gaming laptop with long battery life', Decimal('999.99')),
            ('Microsoft', 'Surface Pro 9', 'Versatile 2-in-1 tablet with laptop capabilities', Decimal('1099.99')),
        ]
        
        # Process each laptop
        created_count = 0
        for laptop in laptop_data:
            brand = next((b for b in brands if b.name == laptop['brand']), None)
            if not brand:
                self.stdout.write(self.style.WARNING(f"Brand {laptop['brand']} not found, skipping laptop"))
                continue
                
            # Create or get product
            slug = slugify(laptop['name'])
            product, created = Product.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': laptop['name'],
                    'sku': f"SKU-{slug[:10]}",
                    'category': category,
                    'brand': brand,
                    'short_description': laptop['short_description'],
                    'description': laptop['description'],
                    'price': laptop['price'],
                    'sale_price': laptop.get('sale_price'),
                    'is_on_sale': laptop.get('is_on_sale', False),
                    'is_featured': laptop.get('is_featured', False),
                    'warranty_info': laptop.get('warranty_info', ''),
                    'availability': 'in_stock',
                    'is_active': True,
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f"Created product: {product.name}")
                
                # Create inventory
                Inventory.objects.get_or_create(
                    product=product,
                    defaults={
                        'quantity': random.randint(5, 30),
                        'low_stock_threshold': 5
                    }
                )
                
                # Add product attributes for key specifications
                # Instead of using a single 'Features' attribute, we'll create individual attributes
                # for each key specification to avoid the unique constraint issue
                
                # Map features to appropriate attributes when possible
                for feature in laptop.get('features', []):
                    # Try to map the feature to an existing attribute based on keywords
                    mapped = False
                    for attr_name, attr in attributes.items():
                        if attr_name.lower() in feature.lower():
                            # Found a matching attribute
                            try:
                                ProductAttributeValue.objects.create(
                                    product=product,
                                    attribute=attr,
                                    value=feature
                                )
                                mapped = True
                                break
                            except Exception:
                                # If there's already a value for this attribute, skip it
                                pass
                    
                    # If we couldn't map to an existing attribute, create a new one
                    if not mapped:
                        # Create a new attribute for this feature
                        feature_name = feature.split(':')[0] if ':' in feature else f"Feature {feature[:20]}"
                        feature_attr, _ = ProductAttribute.objects.get_or_create(
                            name=f"{feature_name} {product.id}",
                            defaults={'description': 'Product specification'}
                        )
                        
                        try:
                            ProductAttributeValue.objects.create(
                                product=product,
                                attribute=feature_attr,
                                value=feature
                            )
                        except Exception as e:
                            self.stdout.write(self.style.WARNING(f"Could not add feature: {feature} - {str(e)}"))
                
                # Create variants
                
                for i, variant_data in enumerate(laptop.get('variants', [])):
                    # Generate a unique SKU using product ID, timestamp, and random number
                    timestamp = int(time.time() * 1000)
                    random_suffix = random.randint(1000, 9999)
                    unique_sku = f"{product.slug}-{i}-{timestamp}-{random_suffix}"
                    
                    # Try to create the variant with the unique SKU
                    try:
                        variant = ProductVariant.objects.create(
                            product=product,
                            name=variant_data.get('name', 'Default'),
                            sku=unique_sku,
                            price=variant_data.get('price', laptop['price']),
                            sale_price=variant_data.get('sale_price'),
                            is_on_sale=variant_data.get('is_on_sale', False),
                            is_default=variant_data.get('is_default', False),
                            is_active=True
                        )
                        
                        # Create inventory for variant
                        Inventory.objects.create(
                            variant=variant,
                            quantity=random.randint(5, 30),
                            low_stock_threshold=5
                        )
                        
                        # Add variant attributes
                        for attr_name, attr_value in variant_data.get('attributes', {}).items():
                            if attr_name in attributes:
                                VariantAttributeValue.objects.create(
                                    variant=variant,
                                    attribute=attributes[attr_name],
                                    value=attr_value
                                )
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f"Could not create variant for {product.name}: {str(e)}"))
            else:
                self.stdout.write(f"Using existing product: {product.name}")
        
        # Generate additional laptops from the models list
        for brand_name, model_name, description, price in laptop_models:
            brand = next((b for b in brands if b.name == brand_name), None)
            if not brand:
                continue
                
            slug = slugify(model_name)
            product, created = Product.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': model_name,
                    'sku': f"SKU-{slug[:10]}",
                    'category': category,
                    'brand': brand,
                    'short_description': description,
                    'description': f"{description}. This {model_name} from {brand_name} offers excellent performance and value for its price range. With modern components and thoughtful design, it's a great choice for both work and play.",
                    'price': price,
                    'sale_price': price * Decimal('0.9') if random.choice([True, False]) else None,
                    'is_on_sale': random.choice([True, False]),
                    'is_featured': random.choice([True, False]),
                    'warranty_info': '1 year limited warranty',
                    'availability': random.choice(['in_stock', 'limited_stock']),
                    'is_active': True,
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f"Created product: {product.name}")
                
                # Create inventory
                Inventory.objects.get_or_create(
                    product=product,
                    defaults={
                        'quantity': random.randint(5, 30),
                        'low_stock_threshold': 5
                    }
                )
                
                # Create a few variants
                storage_options = ['256GB SSD', '512GB SSD', '1TB SSD']
                ram_options = ['8GB', '16GB', '32GB']
                color_options = ['Silver', 'Black', 'Space Gray', 'Blue']
                
                for i in range(random.randint(2, 4)):
                    storage = random.choice(storage_options)
                    ram = random.choice(ram_options)
                    color = random.choice(color_options)
                    
                    variant_name = f"{storage} / {ram} / {color}"
                    variant_price = price + Decimal(str(random.randint(-100, 200)))
                    
                    # Generate a unique SKU with timestamp and random number
                    timestamp = int(time.time() * 1000)
                    random_suffix = random.randint(1000, 9999)
                    unique_sku = f"{slug[:5]}-{storage[:3]}-{ram[:2]}-{color[:1]}-{timestamp}-{random_suffix}".upper()
                    
                    try:
                        variant = ProductVariant.objects.create(
                            product=product,
                            name=variant_name,
                            sku=unique_sku,
                            price=variant_price,
                            sale_price=variant_price * Decimal('0.9') if random.choice([True, False]) else None,
                            is_on_sale=random.choice([True, False]),
                            is_default=i == 0,  # First variant is default
                            is_active=True
                        )
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f"Could not create variant for {product.name}: {str(e)}"))
                        continue
                    
                    # Create inventory for variant
                    Inventory.objects.create(
                        variant=variant,
                        quantity=random.randint(5, 30),
                        low_stock_threshold=5
                    )
                    
                    # Add variant attributes
                    if 'Storage' in attributes:
                        VariantAttributeValue.objects.create(
                            variant=variant,
                            attribute=attributes['Storage'],
                            value=storage
                        )
                    
                    if 'RAM' in attributes:
                        VariantAttributeValue.objects.create(
                            variant=variant,
                            attribute=attributes['RAM'],
                            value=ram
                        )
                    
                    if 'Color' in attributes:
                        VariantAttributeValue.objects.create(
                            variant=variant,
                            attribute=attributes['Color'],
                            value=color
                        )
            else:
                self.stdout.write(f"Using existing product: {product.name}")
        
        self.stdout.write(f"Created {created_count} new laptop products")
