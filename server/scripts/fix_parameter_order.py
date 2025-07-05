#!/usr/bin/env python3
"""
Script to fix parameter order in service files.

This script ensures that parameters with default values come after parameters without default values
in all service files in the app/services directory.
"""

import os
import re
import glob
from typing import List, Tuple

# Path to services directory
SERVICES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "app", "services")

# Regular expression to match function definitions with parameters
FUNC_DEF_PATTERN = re.compile(r"async def ([a-zA-Z0-9_]+)\(\s*([^)]+)\)\s*->")

# Regular expression to match parameter with default value
PARAM_WITH_DEFAULT_PATTERN = re.compile(r"([a-zA-Z0-9_]+):\s*([a-zA-Z0-9_\[\]\.]+)(?:\s*=\s*([^,]+))?")


def parse_parameters(param_str: str) -> List[Tuple[str, str, bool]]:
    """
    Parse parameters string into a list of (name, type, has_default) tuples.
    
    Args:
        param_str: String containing function parameters
        
    Returns:
        List of tuples with parameter name, type, and whether it has a default value
    """
    params = []
    for line in param_str.strip().split(","):
        line = line.strip()
        if not line:
            continue
        
        match = PARAM_WITH_DEFAULT_PATTERN.search(line)
        if match:
            name = match.group(1)
            type_hint = match.group(2)
            has_default = match.group(3) is not None
            params.append((name, type_hint, has_default))
    
    return params


def reorder_parameters(params: List[Tuple[str, str, bool]]) -> List[Tuple[str, str, bool]]:
    """
    Reorder parameters so that parameters with default values come after those without.
    
    Args:
        params: List of parameter tuples (name, type, has_default)
        
    Returns:
        Reordered list of parameter tuples
    """
    # Split into parameters with and without default values
    no_default = [p for p in params if not p[2]]
    with_default = [p for p in params if p[2]]
    
    # Special case: move db: AsyncSession to the front if it exists
    db_param = None
    for i, param in enumerate(no_default):
        if param[0] == "db" and "AsyncSession" in param[1]:
            db_param = no_default.pop(i)
            break
    
    # Reorder with db first, then other required params, then params with defaults
    result = []
    if db_param:
        result.append(db_param)
    result.extend(no_default)
    result.extend(with_default)
    
    return result


def fix_service_file(file_path: str) -> None:
    """
    Fix parameter order in a service file.
    
    Args:
        file_path: Path to the service file
    """
    print(f"Processing {os.path.basename(file_path)}...")
    
    with open(file_path, "r") as f:
        content = f.read()
    
    # Find all function definitions
    modified = False
    for match in FUNC_DEF_PATTERN.finditer(content):
        func_name = match.group(1)
        param_str = match.group(2)
        
        # Parse parameters
        params = parse_parameters(param_str)
        
        # Check if reordering is needed
        reordered = reorder_parameters(params)
        if reordered != params:
            print(f"  Fixing parameter order in {func_name}()")
            
            # Build new parameter string
            new_param_str = ""
            for i, (name, type_hint, has_default) in enumerate(reordered):
                if i > 0:
                    new_param_str += ",\n        "
                new_param_str += f"{name}: {type_hint}"
            
            # Replace in content
            old_pattern = re.escape(param_str)
            content = re.sub(old_pattern, new_param_str, content, count=1)
            modified = True
    
    # Write changes back to file
    if modified:
        with open(file_path, "w") as f:
            f.write(content)
        print(f"  Updated {file_path}")
    else:
        print(f"  No changes needed in {file_path}")


def main():
    """Main function to fix parameter order in all service files."""
    print("Fixing parameter order in service files...")
    
    # Get all service files
    service_files = glob.glob(os.path.join(SERVICES_DIR, "*.py"))
    
    # Skip __init__.py and empty files
    service_files = [f for f in service_files if not f.endswith("__init__.py") and os.path.getsize(f) > 0]
    
    # Process each file
    for file_path in service_files:
        fix_service_file(file_path)
    
    print("Done!")


if __name__ == "__main__":
    main() 