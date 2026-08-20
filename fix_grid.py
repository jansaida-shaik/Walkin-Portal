with open('apps/frontend/src/components/StudentContextDrawer.tsx', 'r') as f:
    content = f.read()

target1 = '<div className="drawer-info-item">\n                        <span className="drawer-info-label">Qualification</span>'
replacement1 = '<div className="drawer-info-item" style={{ gridColumn: \'1 / -1\' }}>\n                        <span className="drawer-info-label">Qualification</span>'

target2 = '<div className="drawer-info-item">\n                        <span className="drawer-info-label">College</span>'
replacement2 = '<div className="drawer-info-item" style={{ gridColumn: \'1 / -1\' }}>\n                        <span className="drawer-info-label">College</span>'

if target1 in content:
    content = content.replace(target1, replacement1)
else:
    print("Could not find Qualification block")

if target2 in content:
    content = content.replace(target2, replacement2)
else:
    print("Could not find College block")

with open('apps/frontend/src/components/StudentContextDrawer.tsx', 'w') as f:
    f.write(content)

print("Done")
