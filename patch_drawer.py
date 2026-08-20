with open('apps/frontend/src/components/StudentContextDrawer.tsx', 'r') as f:
    content = f.read()

source_block = """                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Lead Source</span>
                      <span className="drawer-info-value">{student.source || '—'}</span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Walk-in Date</span>
                      <span className="drawer-info-value">{formatDate(student.walkinDate)}</span>
                    </div>
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Branch</span>
                      <span className="drawer-info-value">{student.branchName || '—'}</span>
                    </div>"""

if source_block in content:
    content = content.replace(source_block + "\n", "")
    content = content.replace(source_block, "") # Fallback if no newline
else:
    print("Could not find source block")

target = """                  <div style={{ marginTop: 'var(--space-5)' }}>
                    <span className="drawer-section-label">Intake & Registration</span>
                    <div className="drawer-info-grid">"""

if target in content:
    content = content.replace(target, target + "\n" + source_block)
else:
    print("Could not find target block")

with open('apps/frontend/src/components/StudentContextDrawer.tsx', 'w') as f:
    f.write(content)

print("Done")
