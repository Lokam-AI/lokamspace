#!/usr/bin/env python3
"""
Script to add explicit __tablename__ attributes to SQLAlchemy model files.
This script will:
1. Identify all model files in app/models/
2. For each file without an explicit __tablename__, add one using the pluralized model name
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Tuple


def pluralize(singular: str) -> str:
    """
    Basic function to pluralize a word.
    Not comprehensive, but covers common cases in database naming.
    """
    if singular.endswith('y'):
        # city -> cities, but day -> days
        if singular[-2] not in 'aeiou':
            return singular[:-1] + 'ies'
        return singular + 's'
    elif singular.endswith(('s', 'sh', 'ch', 'x', 'z')):
        return singular + 'es'
    else:
        return singular + 's'


def find_model_files(models_dir: str) -> List[str]:
    """Find all Python files in the models directory that likely contain models."""
    return [
        os.path.join(models_dir, f) for f in os.listdir(models_dir)
        if f.endswith('.py') and f not in ['__init__.py', 'base.py']
    ]


def has_explicit_tablename(file_path: str) -> bool:
    """Check if a model file already has an explicit __tablename__ attribute."""
    with open(file_path, 'r') as f:
        content = f.read()
        return '__tablename__' in content


def extract_class_name(file_path: str) -> Tuple[bool, str]:
    """Extract the model class name from the file, returns (success, class_name)."""
    with open(file_path, 'r') as f:
        content = f.read()
        
    # Regular expression to find class definitions that inherit from Base
    class_match = re.search(r'class\s+(\w+)\s*\(\s*Base\s*\)', content)
    if not class_match:
        return False, ""
    
    return True, class_match.group(1)


def add_tablename_to_file(file_path: str, class_name: str) -> bool:
    """Add __tablename__ attribute to the model class in the file."""
    table_name = pluralize(class_name.lower())
    
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    # Find the class definition line
    class_line_index = None
    for i, line in enumerate(lines):
        if re.search(rf'class\s+{class_name}\s*\(\s*Base\s*\)', line):
            class_line_index = i
            break
    
    if class_line_index is None:
        return False
    
    # Find where to insert the tablename (after class docstring if it exists)
    insert_index = class_line_index + 1
    
    # Check if there's a docstring
    docstring_start = None
    for i in range(class_line_index + 1, min(class_line_index + 10, len(lines))):
        line = lines[i].strip()
        if line.startswith('"""') or line.startswith("'''"):
            docstring_start = i
            break
    
    if docstring_start is not None:
        # Find the end of the docstring
        docstring_end = None
        docstring_delimiter = lines[docstring_start].strip()[:3]
        for i in range(docstring_start + 1, len(lines)):
            if docstring_delimiter in lines[i]:
                docstring_end = i
                break
        
        if docstring_end is not None:
            insert_index = docstring_end + 1
    
    # Insert tablename line
    indent = re.match(r'^(\s*)', lines[insert_index]).group(1)
    tablename_line = f"{indent}# Table name - explicitly set\n"
    tablename_attr = f'{indent}__tablename__ = "{table_name}"\n'
    blank_line = f"{indent}\n"
    
    lines.insert(insert_index, blank_line)
    lines.insert(insert_index, tablename_attr)
    lines.insert(insert_index, tablename_line)
    
    # Write back to file
    with open(file_path, 'w') as f:
        f.writelines(lines)
    
    return True


def main():
    """Main function to add tablenames to all model files."""
    # Find path to models directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(script_dir, '..', 'app', 'models')
    models_dir = os.path.normpath(models_dir)
    
    if not os.path.isdir(models_dir):
        print(f"Error: Models directory not found: {models_dir}")
        sys.exit(1)
    
    # Find all model files
    model_files = find_model_files(models_dir)
    print(f"Found {len(model_files)} model files")
    
    # Process each file
    success_count = 0
    skipped_count = 0
    failed_count = 0
    
    for file_path in model_files:
        model_name = os.path.basename(file_path).replace('.py', '')
        
        if has_explicit_tablename(file_path):
            print(f"✓ Skipping {model_name} (already has __tablename__)")
            skipped_count += 1
            continue
        
        success, class_name = extract_class_name(file_path)
        if not success:
            print(f"✗ Failed to extract class name from {model_name}")
            failed_count += 1
            continue
        
        if add_tablename_to_file(file_path, class_name):
            table_name = pluralize(class_name.lower())
            print(f"✓ Added __tablename__ = '{table_name}' to {model_name}")
            success_count += 1
        else:
            print(f"✗ Failed to add __tablename__ to {model_name}")
            failed_count += 1
    
    # Summary
    print("\nSummary:")
    print(f"  {success_count} models updated")
    print(f"  {skipped_count} models already had __tablename__")
    print(f"  {failed_count} models failed to update")
    
    if failed_count > 0:
        print("\nPlease check and manually update the models that failed.")


if __name__ == "__main__":
    main() 