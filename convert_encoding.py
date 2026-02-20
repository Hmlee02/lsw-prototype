import os

def process_file(file_path):
    # Try UTF-8 first (since ffc41c1 seems to be UTF-8)
    encodings = ['utf-8', 'utf-8-sig', 'cp949', 'euc-kr', 'utf-16']
    content = None
    applied_enc = None
    
    with open(file_path, 'rb') as f:
        raw_data = f.read()

    for enc in encodings:
        try:
            content = raw_data.decode(enc)
            applied_enc = enc
            # Basic check for sanity: if it's CP949 decoded as UTF-8, it might not fail but look like mojibake.
            # But here we already verified the files are supposed to be UTF-8.
            break
        except Exception:
            continue
            
    if content:
        # Path fixes
        content = content.replace('../node_modules/krds-uiux/resources/', '../assets/krds/')
        content = content.replace('../../node_modules/krds-uiux/resources/', '../../assets/krds/')
        
        # Verify Korean text is STILL correct in memory
        if '현행법령' in content:
            print(f"Verified '현행법령' in {file_path}")
        else:
            # Maybe some files don't have this string, so just print a snippet
            print(f"Decoded {file_path} using {applied_enc}. Snippet: {content[:50].replace('\\n', ' ')}")
            
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        return True, applied_enc
    return False, None

targets = []
for root, dirs, files in os.walk('.'):
    if any(x in root for x in ['assets', 'node_modules', '.git', '.gemini']):
        continue
    for file in files:
        if file.endswith(('.html', '.css', '.js')):
            targets.append(os.path.join(root, file))

for t in targets:
    success, enc = process_file(t)
    if not success:
        print(f"Failed to process {t}")
