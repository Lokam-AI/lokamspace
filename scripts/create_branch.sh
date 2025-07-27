#!/bin/bash

# Check if branch name is provided
if [ -z "$1" ]; then
  echo "Error: No branch name provided."
  echo "Usage: ./create_branch.sh <new-branch-name>"
  exit 1
fi

NEW_BRANCH=$1

# Checkout to dev branch
echo "Checking out to dev branch..."
git checkout dev

# Pull latest changes from dev
echo "Pulling latest changes from dev..."
git pull origin dev

# Create and checkout to new branch
echo "Creating new branch '$NEW_BRANCH' based on dev..."
git checkout -b $NEW_BRANCH

echo "Successfully created and switched to branch '$NEW_BRANCH'."
echo "You can now start making your changes." 