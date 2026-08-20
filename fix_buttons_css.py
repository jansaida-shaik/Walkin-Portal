css_append = """
/* Table Action Buttons */
.table-btn-soft {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  font-size: 0.78rem;
  font-weight: 700;
  border-radius: 6px;
  border: 1px solid transparent;
  background: var(--primary-glow);
  color: var(--primary);
  cursor: pointer;
  transition: var(--transition-fast, 0.15s ease);
}

.table-btn-soft:hover {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 4px 12px var(--primary-glow);
  transform: translateY(-1px);
}

.table-btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  font-size: 0.78rem;
  font-weight: 700;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  transition: var(--transition-fast, 0.15s ease);
}

.table-btn-outline:hover {
  border-color: var(--border-hover);
  background: var(--surface-alt);
  transform: translateY(-1px);
}
"""

with open('apps/frontend/src/styles/components.css', 'a') as f:
    f.write(css_append)

with open('apps/frontend/src/app/walkins/WalkinsClient.tsx', 'r') as f:
    content = f.read()

target = """                        <button
                          type="button"
                          className="px-3 py-1.5 text-[0.75rem] font-bold rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 transition-colors shadow-sm"
                          onClick={() => openDrawer(w)}
                          aria-label={`Quick view profile for ${w.name}`}
                        >
                          Quick View
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 text-[0.75rem] font-bold rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 transition-colors shadow-sm"
                          onClick={() => router.push(`/walkins/record?studentId=${w.id}`)}
                          aria-label={`Open full record for ${w.name}`}
                        >
                          Full Record
                        </button>"""

replacement = """                        <button
                          type="button"
                          className="table-btn-soft"
                          onClick={() => openDrawer(w)}
                          aria-label={`Quick view profile for ${w.name}`}
                        >
                          Quick View
                        </button>
                        <button
                          type="button"
                          className="table-btn-outline"
                          onClick={() => router.push(`/walkins/record?studentId=${w.id}`)}
                          aria-label={`Open full record for ${w.name}`}
                        >
                          Full Record
                        </button>"""

if target in content:
    content = content.replace(target, replacement)
    with open('apps/frontend/src/app/walkins/WalkinsClient.tsx', 'w') as f:
        f.write(content)
    print("Fixed walkins client buttons")
else:
    print("Target not found")
