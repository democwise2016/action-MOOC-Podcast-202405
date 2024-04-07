#!/bin/bash

if [ $# -ne 1 ]; then
  echo "Usage: $0 <directory>"
  exit 1
fi

if [ ! -d "$1" ]; then
  echo "Error: Directory '$1' not found."
  exit 1
fi

calculate_folder_stats() {
  local folder="$1"
  local file_count=0
  local total_size=0

  while IFS= read -r -d '' file; do
    ((file_count++))
    size=$(stat -c '%s' "$file")
    ((total_size += size))
  done < <(find "$folder" -type f -print0)

  total_size_mb=$(bc <<< "scale=2; $total_size / (1024 * 1024)")

  echo -e "Folder: $folder "'\t\t'"File count: $file_count "'\t'"Total size: $total_size_mb MB"
}

find "$1" -mindepth 1 -type d -print0 | while IFS= read -r -d '' dir; do
  calculate_folder_stats "$dir"
done
