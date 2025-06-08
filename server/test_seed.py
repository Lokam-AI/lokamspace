#!/usr/bin/env python3

import sys
import os

# Add the server directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.db.init_db import init_db

if __name__ == "__main__":
    print("Starting database initialization and seed data creation...")
    try:
        init_db()
        print("✅ Database initialization completed successfully!")
    except Exception as e:
        print(f"❌ Error during initialization: {e}")
        sys.exit(1) 