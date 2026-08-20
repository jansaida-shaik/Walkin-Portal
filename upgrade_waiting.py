with open('apps/frontend/src/styles/components.css', 'r') as f:
    content = f.read()

target = """.status-chip.waiting,
.status-chip[data-status="waiting"] {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.22);
}"""

replacement = """
.status-chip.waiting,
.status-chip[data-status="waiting"] {
  background: rgba(14, 165, 233, 0.15);
  color: #0284c7; /* darker cyan for better contrast in light mode */
  border: 1px solid rgba(14, 165, 233, 0.3);
  position: relative;
  padding-left: var(--space-4); /* make room for dot */
}

/* Dark mode adjustment for text color */
:root:not([data-theme="light"]) .status-chip.waiting,
:root:not([data-theme="light"]) .status-chip[data-status="waiting"] {
  color: #38bdf8;
}

.status-chip.waiting::before,
.status-chip[data-status="waiting"]::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.6);
  animation: pulse-waiting 1.8s infinite cubic-bezier(0.66, 0, 0, 1);
}

@keyframes pulse-waiting {
  0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.6); }
  70% { box-shadow: 0 0 0 5px rgba(14, 165, 233, 0); }
  100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
}
"""

if target in content:
    content = content.replace(target, replacement)
    with open('apps/frontend/src/styles/components.css', 'w') as f:
        f.write(content)
    print("Waiting chip upgraded")
else:
    print("Could not find waiting chip target")
