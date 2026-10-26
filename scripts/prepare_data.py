#!/usr/bin/env python3
import csv
import json
import os

def csv_to_json(csv_path, json_path):
    rows = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cleaned = {}
            for k, v in row.items():
                if k is None:
                    continue
                # keep stripped key and value
                cleaned[k.strip()] = v.strip()
            rows.append(cleaned)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(rows, f, separators=(',', ':'), ensure_ascii=False)
    print(f"Wrote {len(rows)} entries from {csv_path} to {json_path} ({os.path.getsize(json_path):,} bytes)")

if __name__ == "__main__":
    base_csv = "data/map_patterns_base.csv"
    gh_csv = "data/map_patterns_gh.csv"
    base_json = "data/patterns_base.json"
    gh_json = "data/patterns_gh.json"
    
    csv_to_json(base_csv, base_json)
    csv_to_json(gh_csv, gh_json)
