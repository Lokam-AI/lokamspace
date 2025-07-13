#!/usr/bin/env python3
"""
Script to fix common indentation errors in model files.
This focuses on fixing indentation issues with __tablename__ attributes.
"""

import os
import re
from pathlib import Path


def find_model_files(models_dir):
    """Find all Python files in the models directory that likely contain models."""
    return [
        os.path.join(models_dir, f) for f in os.listdir(models_dir)
        if f.endswith('.py') and f not in ['__init__.py', 'base.py']
    ]


def fix_tablename_indentation(file_path):
    """Fix indentation issues with __tablename__ attributes in model files."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check for common indentation errors with __tablename__
    # This pattern looks for __tablename__ that's not properly indented
    wrong_indent_pattern = r'(class\s+\w+\s*\(\s*Base\s*\):.*?\n\s*""".*?"""\s*\n)\s*#\s*Table.*?\n\s*__tablename__'
    
    if re.search(wrong_indent_pattern, content, re.DOTALL):
        # Fix: Find class definition followed by docstring, and then fix tablename indentation
        fixed_content = re.sub(
            r'(class\s+\w+\s*\(\s*Base\s*\):.*?\n\s*""".*?"""\s*\n)\s*#\s*Table.*?\n\s*(__tablename__)',
            r'\1    # Table name - explicitly set\n    \2',
            content,
            flags=re.DOTALL
        )
        
        if fixed_content != content:
            print(f"✓ Fixed indentation in {os.path.basename(file_path)}")
            with open(file_path, 'w') as f:
                f.write(fixed_content)
            return True
    
    # Check for __tablename__ with no indentation
    no_indent_pattern = r'^__tablename__'
    if re.search(no_indent_pattern, content, re.MULTILINE):
        # Get the class and indentation level
        class_match = re.search(r'(class\s+\w+\s*\(\s*Base\s*\):.*?)__tablename__', content, re.DOTALL)
        if class_match:
            # Get the last line of the match to determine indentation
            last_line = class_match.group(1).strip().split('\n')[-1]
            indent = re.match(r'^(\s*)', last_line).group(1)
            if not indent:
                indent = '    '  # Default indentation if we can't determine it
            
            # Fix: Add proper indentation to __tablename__
            fixed_content = re.sub(
                r'^(__tablename__.*?)$',
                f'{indent}\\1',
                content,
                flags=re.MULTILINE
            )
            
            if fixed_content != content:
                print(f"✓ Fixed indentation in {os.path.basename(file_path)}")
                with open(file_path, 'w') as f:
                    f.write(fixed_content)
                return True
    
    return False


def check_for_syntax_errors(file_path):
    """Check if a Python file has any syntax errors."""
    try:
        with open(file_path, 'r') as f:
            compile(f.read(), file_path, 'exec')
        return False
    except SyntaxError as e:
        print(f"✗ Syntax error in {os.path.basename(file_path)}: {e}")
        return True


def main():
    """Main function to find and fix model files."""
    # Find path to models directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(script_dir, '..', 'app', 'models')
    models_dir = os.path.normpath(models_dir)
    
    if not os.path.isdir(models_dir):
        print(f"Error: Models directory not found: {models_dir}")
        return
    
    # Find all model files
    model_files = find_model_files(models_dir)
    print(f"Found {len(model_files)} model files")
    
    # Process each file
    fixed_count = 0
    error_count = 0
    
    for file_path in model_files:
        model_name = os.path.basename(file_path)
        
        # Check for syntax errors first
        has_syntax_error = check_for_syntax_errors(file_path)
        
        if has_syntax_error:
            error_count += 1
        else:
            # Fix indentation if needed
            if fix_tablename_indentation(file_path):
                fixed_count += 1
    
    # Summary
    print("\nSummary:")
    print(f"  {fixed_count} files fixed")
    print(f"  {error_count} files with syntax errors")
    
    if error_count > 0:
        print("\nPlease manually check the files with syntax errors.")
        print("Common issues include:")
        print("- Incorrect indentation")
        print("- Missing closing brackets or quotes")
        print("- Invalid Python syntax")


if __name__ == "__main__":
    main() 