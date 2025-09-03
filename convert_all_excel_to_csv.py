#!/usr/bin/env python3
"""
Excel to CSV Converter for All Assembly Groups
Converts all Excel files in all assembly group directories to CSV format.
"""

import os
import pandas as pd
import glob
from pathlib import Path

def convert_excel_to_csv(input_dir, output_dir):
    """
    Convert all Excel files in the input directory to CSV format.
    
    Args:
        input_dir (str): Directory containing Excel files
        output_dir (str): Output directory for CSV files
    """
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Find all Excel files
    excel_patterns = ['*.xlsx', '*.xls']
    excel_files = []
    
    for pattern in excel_patterns:
        excel_files.extend(glob.glob(os.path.join(input_dir, pattern)))
    
    if not excel_files:
        return 0, 0
    
    print(f"  Found {len(excel_files)} Excel files in {os.path.basename(input_dir)}")
    
    converted_count = 0
    error_count = 0
    
    for excel_file in excel_files:
        try:
            # Get the base filename without extension
            base_name = os.path.splitext(os.path.basename(excel_file))[0]
            csv_file = os.path.join(output_dir, f"{base_name}.csv")
            
            # Skip if CSV already exists
            if os.path.exists(csv_file):
                print(f"    ⚠ Skipping {os.path.basename(excel_file)} (CSV already exists)")
                continue
            
            # Read Excel file
            df = pd.read_excel(excel_file)
            
            # Save as CSV
            df.to_csv(csv_file, index=False, encoding='utf-8')
            
            print(f"    ✓ {os.path.basename(excel_file)} -> {os.path.basename(csv_file)} ({len(df)} rows)")
            converted_count += 1
            
        except Exception as e:
            print(f"    ✗ Error converting {os.path.basename(excel_file)}: {str(e)}")
            error_count += 1
    
    return converted_count, error_count

def find_assembly_directories():
    """Find all assembly directories that contain groups folders."""
    
    database_dir = "database"
    assembly_dirs = []
    
    if not os.path.exists(database_dir):
        print(f"Error: Database directory '{database_dir}' does not exist!")
        return assembly_dirs
    
    # Look for directories that contain a 'groups' subdirectory
    for item in os.listdir(database_dir):
        item_path = os.path.join(database_dir, item)
        if os.path.isdir(item_path):
            groups_path = os.path.join(item_path, 'groups')
            if os.path.exists(groups_path) and os.path.isdir(groups_path):
                assembly_dirs.append(groups_path)
    
    return assembly_dirs

def main():
    """Main function to run the conversion for all assemblies."""
    
    print("Excel to CSV Converter - All Assemblies")
    print("=" * 60)
    
    # Create main output directory
    main_output_dir = "csv_output"
    os.makedirs(main_output_dir, exist_ok=True)
    print(f"Output directory: {main_output_dir}")
    print()
    
    # Find all assembly group directories
    assembly_dirs = find_assembly_directories()
    
    if not assembly_dirs:
        print("No assembly directories with groups found!")
        return
    
    print(f"Found {len(assembly_dirs)} assembly directories:")
    for dir_path in assembly_dirs:
        print(f"  - {dir_path}")
    print()
    
    total_converted = 0
    total_errors = 0
    
    # Convert files in each assembly directory
    for assembly_dir in assembly_dirs:
        assembly_name = os.path.basename(os.path.dirname(assembly_dir))
        print(f"Processing: {assembly_name}")
        
        # Create assembly-specific output directory
        assembly_output_dir = os.path.join(main_output_dir, assembly_name)
        
        converted, errors = convert_excel_to_csv(assembly_dir, assembly_output_dir)
        total_converted += converted
        total_errors += errors
        
        print(f"  Summary: {converted} converted, {errors} errors")
        print(f"  Output: {assembly_output_dir}")
        print()
    
    print("=" * 60)
    print("Overall Summary:")
    print(f"  ✓ Total files converted: {total_converted}")
    print(f"  ✗ Total errors: {total_errors}")
    print(f"  📁 Processed {len(assembly_dirs)} assembly directories")
    print(f"  📂 All CSV files saved in: {main_output_dir}")
    print("\nConversion completed!")

if __name__ == "__main__":
    main()
