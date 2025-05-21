#!/bin/bash

# Cleanup script for TaskManagement project
# Remove redundant files after migration to feature-based structure

echo "Starting cleanup of redundant files..."

# Remove old Redux files (already migrated to /src/store)
echo "Removing old Redux files..."
rm -rf src/redux

# Remove old Utils (already migrated to /src/shared/utils)
echo "Removing old Utils files..."
rm -rf src/utils

# Remove old Components (already migrated to feature-specific folders)
echo "Removing old Components files..."
rm -rf src/components
rm -rf src/pages

# Remove old Hooks (already migrated to /src/shared/hooks)
echo "Removing old Hooks files..."
rm -rf src/hooks

echo "Cleanup completed!"
echo "Please run the application to ensure everything still works correctly."
