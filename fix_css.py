with open('apps/frontend/src/styles/layout.css', 'r') as f:
    layout = f.read()

layout = layout.replace("@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');", "")

with open('apps/frontend/src/styles/layout.css', 'w') as f:
    f.write(layout)

with open('apps/frontend/src/app/globals.css', 'r') as f:
    globals_css = f.read()

target = "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');"
replacement = target + "\n@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');"

globals_css = globals_css.replace(target, replacement)

with open('apps/frontend/src/app/globals.css', 'w') as f:
    f.write(globals_css)

print("Fixed CSS imports")
