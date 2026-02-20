import os

file_path = r'proposal_B\law-detail.html'

with open(file_path, 'rb') as f:
    raw = f.read()

# Check for BOMs
if raw.startswith(b'\xef\xbb\xbf'):
    print("Detected UTF-8 BOM")
elif raw.startswith(b'\xff\xfe'):
    print("Detected UTF-16 LE BOM")
elif raw.startswith(b'\xfe\xff'):
    print("Detected UTF-16 BE BOM")
else:
    print("No BOM detected")

# Try to decode and print a known Korean string
known_part = b'\xc7\xf6\xc0\xe0\xb9\xfd\xb7\xc9' # '현행법령' in CP949
known_part_utf8 = '현행법령'.encode('utf-8')

print(f"Contains CP949 '현행법령' bytes: {known_part in raw}")
print(f"Contains UTF-8 '현행법령' bytes: {known_part_utf8 in raw}")

# Print first 50 bytes hex
print(f"Hex dump (first 50): {raw[:50].hex()}")
