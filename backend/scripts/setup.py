#!/usr/bin/env python3
"""
Setup script for Jalyuzi API
Creates .env file and runs initial setup
"""
import os

ENV_TEMPLATE = '''# Supabase PostgreSQL Connection
# Format: postgresql://postgres.[project]:[password]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
DATABASE_URL=postgresql://postgres.rgqgefqmuwqeritnxely:YOUR_PASSWORD@aws-1-ap-south-1.pooler.supabase.com:6543/postgres

# Supabase Settings
SUPABASE_URL=https://rgqgefqmuwqeritnxely.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET=uploads

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Admin (optional)
ADMIN_EMAIL=admin@curtain.uz
ADMIN_PASSWORD=admin123

# Logging
LOG_LEVEL=INFO
'''


def setup_env():
    """Create .env file if not exists."""
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    env_path = os.path.abspath(env_path)
    
    if os.path.exists(env_path):
        print(f".env file already exists at: {env_path}")
        print("Please edit it with your actual credentials")
    else:
        with open(env_path, 'w') as f:
            f.write(ENV_TEMPLATE)
        print(f"Created .env file at: {env_path}")
        print("IMPORTANT: Edit .env and add your Supabase password!")
    
    return env_path


def main():
    print("=" * 60)
    print("Jalyuzi API Setup")
    print("=" * 60)
    
    env_path = setup_env()
    
    print("\n" + "=" * 60)
    print("Next Steps:")
    print("=" * 60)
    print("1. Edit .env file and add your Supabase password")
    print("2. Add SUPABASE_SERVICE_ROLE_KEY for file uploads")
    print("3. Change JWT_SECRET to a secure random string")
    print("4. Run: pip install -r requirements.txt")
    print("5. Run: alembic upgrade head")
    print("6. Run: uvicorn app.main:app --reload")
    print("=" * 60)


if __name__ == "__main__":
    main()
