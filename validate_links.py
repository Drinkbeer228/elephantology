import os
import re

DOCS_DIR = "docs"

def validate_pdf_links():
    link_pattern = re.compile(r'\]\(([^)]+\.pdf)\)')
    broken_links_found = False

    print("Starting automated verification of PDF asset links...")
    
    for root, _, files in os.walk(DOCS_DIR):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    
                matches = link_pattern.findall(content)
                for link in matches:
                    # Resolve relative path from markdown file location
                    resolved_path = os.path.normpath(os.path.join(root, link))
                    if not os.path.exists(resolved_path):
                        broken_links_found = True
                        print(f"[BROKEN LINK] In {file_path} -> Target not found: {link}")
                    else:
                        print(f"[VERIFIED] {link} referenced in {file}")

    if not broken_links_found:
        print("\nAll local PDF document references successfully verified.")
    else:
        print("\nValidation complete. Broken links detected requiring path remediation.")

if __name__ == "__main__":
    validate_pdf_links()
