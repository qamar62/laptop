FROM python:3.11-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=laptop_store.settings

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Create an empty acme.json file for Traefik
RUN touch /app/acme.json && chmod 600 /app/acme.json

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "laptop_store.wsgi:application"]

EXPOSE 8000
