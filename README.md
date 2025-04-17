# Laptop Store - Dockerized Application

This repository contains a complete e-commerce solution for a laptop store, with a Django backend, Next.js frontend, and Traefik as a reverse proxy.

## Architecture

- **Frontend**: Next.js application running on port 3000
- **Backend**: Django REST API running on port 8000
- **Reverse Proxy**: Traefik managing SSL certificates and routing

## Domain Configuration

- Main site: `laptop.qamdm.xyz`
- Backend API: `laptop.qamdm.xyz/api`
- Admin panel: `laptop.qamdm.xyz/admin`
- Backend direct access: `backend.laptop.qamdm.xyz`
- Traefik dashboard: `traefik.laptop.qamdm.xyz` (password protected)

## Prerequisites

- Docker and Docker Compose installed
- Domain `laptop.qamdm.xyz` pointing to your server
- Port 80 and 443 open on your server

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/laptop_store.git
cd laptop_store
```

2. **Create environment file**

```bash
cp .env.example .env
```

Edit the `.env` file and fill in your secret keys and other configuration.

3. **Set proper permissions for Traefik's ACME file**

```bash
chmod 600 traefik/acme.json
```

4. **Start the application**

```bash
docker-compose up -d
```

5. **Create a superuser for the Django admin**

```bash
docker-compose exec backend python manage.py createsuperuser
```

6. **Access your application**

- Frontend: `https://laptop.qamdm.xyz`
- Backend API: `https://laptop.qamdm.xyz/api`
- Admin panel: `https://laptop.qamdm.xyz/admin`
- Traefik dashboard: `https://traefik.laptop.qamdm.xyz`

## Development

For local development without Docker:

### Backend

```bash
cd backend
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Multi-Company Support

The Django admin is configured with Jazzmin for a modern UI and multi-company support. To customize the admin for different companies:

1. Create a Company model to store branding information
2. Link users to companies
3. Use middleware to dynamically change admin branding based on the logged-in user

## Deployment

For production deployment:

1. Update the domain in `docker-compose.yml` and Traefik configuration
2. Generate strong passwords for the Traefik dashboard
3. Set up proper SSL certificates
4. Consider using a managed database instead of SQLite

## License

[MIT License](LICENSE)
"# laptop" 
