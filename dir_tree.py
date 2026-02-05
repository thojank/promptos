import os
import json
from pathlib import Path

# The script now uses the current working directory
BASE_DIR = Path(".") 
OUTPUT_FILE = BASE_DIR / "dir_tree.json"

def build_tree(path: Path):
    """Erstellt rekursiv eine Baumstruktur aus Dateien und Ordnern."""
    # Use path.name directly for the name
    tree = {"name": path.name, "path": str(path.relative_to(BASE_DIR))}
    if path.is_dir():
        tree["type"] = "directory"
        # Use a list comprehension to build the children
        children = [build_tree(path / entry) for entry in os.listdir(path) if not entry.startswith('.')]
        tree["children"] = children
    else:
        tree["type"] = "file"
    return tree

def main():
    tree = build_tree(BASE_DIR)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(tree, f, indent=2, ensure_ascii=False)
    print(f"✅ Struktur gespeichert in {OUTPUT_FILE}")

if __name__ == "__main__":
    main()