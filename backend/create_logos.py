from PIL import Image, ImageDraw, ImageFont
import os

# Create directory if it doesn't exist
os.makedirs('static/images', exist_ok=True)

# Create a simple logo
def create_logo(filename, text, size=(200, 200), bg_color=(0, 123, 255), text_color=(255, 255, 255)):
    # Create a new image with a blue background
    img = Image.new('RGB', size, bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to use a system font, fall back to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 30)
    except IOError:
        font = ImageFont.load_default()
    
    # Calculate text position to center it
    text_width, text_height = draw.textbbox((0, 0), text, font=font)[2:4]
    position = ((size[0] - text_width) // 2, (size[1] - text_height) // 2)
    
    # Draw the text
    draw.text(position, text, font=font, fill=text_color)
    
    # Save the image
    img.save(f'static/images/{filename}')
    print(f"Created {filename}")

# Create main logo
create_logo('logo.png', 'LS', size=(100, 100))

# Create login logo (larger)
create_logo('login_logo.png', 'Laptop Store', size=(300, 100), bg_color=(52, 58, 64))

# Create favicon (smaller)
create_logo('favicon.png', 'LS', size=(32, 32))

print("Logo files created successfully in static/images/")
