#!/usr/bin/env python3
"""
Script to fix foreign key references in all model files.
This updates singular table names to their plural forms in ForeignKey constraints.
"""

import os
import re
import sys
from pathlib import Path


def pluralize(singular: str) -> str:
    """Basic function to pluralize a word."""
    if singular.endswith('y'):
        # city -> cities, but day -> days
        if singular[-2] not in 'aeiou':
            return singular[:-1] + 'ies'
        return singular + 's'
    elif singular.endswith(('s', 'sh', 'ch', 'x', 'z')):
        return singular + 'es'
    else:
        return singular + 's'


def find_model_files(models_dir):
    """Find all Python files in the models directory that likely contain models."""
    return [
        os.path.join(models_dir, f) for f in os.listdir(models_dir)
        if f.endswith('.py') and f not in ['__init__.py', 'base.py']
    ]


def get_table_names(models_dir):
    """Extract __tablename__ values from all model files."""
    table_names = {}
    
    for file_path in find_model_files(models_dir):
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Extract class name
        class_match = re.search(r'class\s+(\w+)\s*\(\s*Base\s*\)', content)
        if not class_match:
            continue
        
        class_name = class_match.group(1)
        
        # Extract tablename
        tablename_match = re.search(r'__tablename__\s*=\s*["\']([^"\']+)["\']', content)
        if tablename_match:
            tablename = tablename_match.group(1)
            table_names[class_name.lower()] = tablename
    
    return table_names


def fix_foreign_keys(file_path, table_names):
    """Fix foreign key references in a model file."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Find all ForeignKey references
    fk_pattern = r'ForeignKey\(\s*["\']([^"\']+)\.id["\']\s*\)'
    matches = re.findall(fk_pattern, content)
    
    if not matches:
        return False, "No foreign keys found"
    
    # Count changes
    changes_made = 0
    
    # Replace each singular table name with its plural form
    for singular_name in matches:
        # Skip if the name is already in our table_names dict
        if singular_name in table_names.values():
            continue
        
        # Check if we have a mapping for this class
        class_name = singular_name
        if class_name in table_names:
            plural_name = table_names[class_name]
            
            # Replace the name in foreign key references
            new_content = re.sub(
                f'ForeignKey\\(\\s*["\']({re.escape(singular_name)})\.id["\']\\s*\\)',
                f'ForeignKey("\\g<1>s.id")',
                content
            )
            
            if new_content != content:
                changes_made += 1
                content = new_content
    
    # If changes were made, write back to the file
    if changes_made > 0:
        with open(file_path, 'w') as f:
            f.write(content)
        
        return True, f"Fixed {changes_made} foreign key references"
    
    return False, "No changes needed"


def main():
    """Main function to find and fix model files."""
    # Find path to models directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(script_dir, '..', 'app', 'models')
    models_dir = os.path.normpath(models_dir)
    
    if not os.path.isdir(models_dir):
        print(f"Error: Models directory not found: {models_dir}")
        sys.exit(1)
    
    # Get table names from all models
    print("Extracting table names from models...")
    table_names = get_table_names(models_dir)
    
    # Find all model files
    model_files = find_model_files(models_dir)
    print(f"Found {len(model_files)} model files")
    
    # Process each file
    fixed_count = 0
    changes_count = 0
    
    print("\nFixing foreign key references...")
    for file_path in model_files:
        model_name = os.path.basename(file_path)
        
        success, message = fix_foreign_keys(file_path, table_names)
        
        if success:
            print(f"✓ {model_name}: {message}")
            fixed_count += 1
            changes_count += int(re.search(r'\d+', message).group(0)) if re.search(r'\d+', message) else 0
        else:
            print(f"- {model_name}: {message}")
    
    # Manual fixes for specific cases
    print("\nApplying manual fixes...")
    special_cases = {
        "call.py": [("service_record.id", "service_records.id")],
        "call_feedback.py": [("call.id", "calls.id")]
    }
    
    for filename, replacements in special_cases.items():
        file_path = os.path.join(models_dir, filename)
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                content = f.read()
            
            changes = 0
            for old, new in replacements:
                new_content = re.sub(
                    f'ForeignKey\\(\\s*["\']({re.escape(old)})["\'](.*?)\\)',
                    f'ForeignKey("\\g<1>s"\\2)',
                    content
                )
                
                if new_content != content:
                    content = new_content
                    changes += 1
            
            if changes > 0:
                with open(file_path, 'w') as f:
                    f.write(content)
                print(f"✓ {filename}: Fixed {changes} special case(s)")
                fixed_count += 1
                changes_count += changes
    
    # Summary
    print("\nSummary:")
    print(f"  {fixed_count} files fixed")
    print(f"  {changes_count} total foreign key references updated")


if __name__ == "__main__":
    main() 