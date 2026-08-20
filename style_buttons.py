with open('apps/frontend/src/app/walkins/WalkinsClient.tsx', 'r') as f:
    content = f.read()

target = """                        <button
                          type="button"
                          className="outline-btn"
                          style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }}
                          onClick={() => openDrawer(w)}
                          aria-label={`Quick view profile for ${w.name}`}
                        >
                          Quick View
                        </button>
                        <button
                          type="button"
                          className="outline-btn"
                          style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }}
                          onClick={() => router.push(`/walkins/record?studentId=${w.id}`)}
                          aria-label={`Open full record for ${w.name}`}
                        >
                          Full Record
                        </button>"""

replacement = """                        <button
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

if target in content:
    content = content.replace(target, replacement)
    with open('apps/frontend/src/app/walkins/WalkinsClient.tsx', 'w') as f:
        f.write(content)
    print("Buttons styled successfully")
else:
    print("Could not find the target buttons")
