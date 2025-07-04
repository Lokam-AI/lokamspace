#!/usr/bin/env python3
import sys
import getpass
from pathlib import Path

# Add the project root to Python path
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)

from src.core.security import get_password_hash

def generate_hash():
    """Generate a password hash from command line input."""
    print("Password Hash Generator")
    print("----------------------")
    
    # Get password securely (won't show on screen)
    password = getpass.getpass("Enter password: ")
    
    if not password:
        print("Error: Password cannot be empty")
        sys.exit(1)
    
    # Generate hash
    hashed_password = get_password_hash(password)
    
    print("\nGenerated Hash:")
    print("--------------")
    print(hashed_password)
    print("\nYou can use this hash in your database or .env file.")

if __name__ == "__main__":
    generate_hash() 