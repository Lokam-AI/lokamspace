#!/usr/bin/env python3
"""
Script to fix indentation issues in all model files.
This specifically targets the common issue with __tablename__ attributes.
"""

import os
import re
import sys
from pathlib import Path


def find_model_files(models_dir):
    """Find all Python files in the models directory that likely contain models."""
    return [
        os.path.join(models_dir, f) for f in os.listdir(models_dir)
        if f.endswith('.py') and f not in ['__init__.py', 'base.py']
    ]


def fix_model_file(file_path):
    """Fix common indentation issues in model files."""
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()
        
        # Skip files that are already fixed
        if any(line.strip().startswith('__tablename__') and line.startswith('    ') for line in lines):
            return False, f"Already fixed: {os.path.basename(file_path)}"
        
        new_lines = []
        in_class = False
        class_found = False
        docstring_ended = False
        tablename_fixed = False
        
        for i, line in enumerate(lines):
            # Check if we're entering a class definition
            if re.match(r'\s*class\s+\w+\s*\(\s*Base\s*\):', line):
                in_class = True
                class_found = True
                new_lines.append(line)
                continue
            
            # Check if we're in a class and found a docstring end
            if in_class and not docstring_ended and '"""' in line and i > 0 and '"""' in lines[i-1]:
                docstring_ended = True
                new_lines.append(line)
                continue
            
            # Fix tablename line if it appears without proper indentation
            if in_class and docstring_ended and not tablename_fixed:
                if line.strip().startswith('#') and 'Table' in line:
                    # Fix table name comment
                    new_lines.append('    # Table name - explicitly set\n')
                    continue
                elif line.strip().startswith('__tablename__'):
                    # Fix tablename line
                    new_lines.append(f'    {line.strip()}\n')
                    tablename_fixed = True
                    continue
            
            # Add all other lines normally
            new_lines.append(line)
        
        # If we didn't fix anything but should have, try a different approach
        if class_found and not tablename_fixed:
            content = ''.join(lines)
            pattern = r'(class\s+\w+\s*\(\s*Base\s*\):.*?""".*?""".*?)(__tablename__\s*=\s*".*?")'
            match = re.search(pattern, content, re.DOTALL)
            if match:
                fixed = re.sub(
                    pattern,
                    r'\1    # Table name - explicitly set\n    \2',
                    content,
                    flags=re.DOTALL
                )
                new_lines = fixed.splitlines(True)  # Keep line endings
        
        # Write back the fixed file
        with open(file_path, 'w') as f:
            f.writelines(new_lines)
        
        return True, f"Fixed: {os.path.basename(file_path)}"
    
    except Exception as e:
        return False, f"Error fixing {os.path.basename(file_path)}: {str(e)}"


def main():
    """Main function to find and fix model files."""
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
    fixed_count = 0
    skipped_count = 0
    error_count = 0
    
    for file_path in model_files:
        success, message = fix_model_file(file_path)
        
        if "Already fixed" in message:
            print(f"✓ {message}")
            skipped_count += 1
        elif success:
            print(f"✓ {message}")
            fixed_count += 1
        else:
            print(f"✗ {message}")
            error_count += 1
    
    # Summary
    print("\nSummary:")
    print(f"  {fixed_count} files fixed")
    print(f"  {skipped_count} files already correct")
    print(f"  {error_count} files with errors")


if __name__ == "__main__":
    main() 