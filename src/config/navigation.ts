export interface NavigationItem {
  id: string;
  href: string;
  label: string;
  icon: string; // SVG Path data
  rolePermissions: string[]; // Allowed role IDs e.g. ['role_super_admin', 'role_admin', ...]
  category: 'operations' | 'analytics' | 'configuration' | 'future';
  visibilityFlags: {
    sidebar: boolean;
    quickAction: boolean;
    commandBar: boolean;
  };
}

export const navConfig: NavigationItem[] = [
  // Core Operations Group
  {
    id: 'dashboard',
    href: '/dashboard',
    label: 'Dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager', 'role_frontdesk', 'role_counselor'],
    category: 'operations',
    visibilityFlags: { sidebar: true, quickAction: true, commandBar: true },
  },
  {
    id: 'walkins',
    href: '/walkins',
    label: 'Walk-ins',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager', 'role_frontdesk', 'role_counselor'],
    category: 'operations',
    visibilityFlags: { sidebar: true, quickAction: true, commandBar: true },
  },
  {
    id: 'queue',
    href: '/queue',
    label: 'Queue',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager', 'role_frontdesk', 'role_counselor'],
    category: 'operations',
    visibilityFlags: { sidebar: true, quickAction: true, commandBar: true },
  },
  {
    id: 'counsellors',
    href: '/counsellors',
    label: 'Counsellors',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager', 'role_frontdesk', 'role_counselor'],
    category: 'operations',
    visibilityFlags: { sidebar: true, quickAction: true, commandBar: true },
  },
  {
    id: 'sessions',
    href: '/sessions',
    label: 'Sessions',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_counselor'],
    category: 'operations',
    visibilityFlags: { sidebar: true, quickAction: true, commandBar: true },
  },

  // Analytics & Integrations Group
  {
    id: 'reports',
    href: '/reports',
    label: 'Reports',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager'],
    category: 'analytics',
    visibilityFlags: { sidebar: true, quickAction: false, commandBar: true },
  },
  {
    id: 'webhooks',
    href: '/webhooks',
    label: 'Webhooks',
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager'],
    category: 'analytics',
    visibilityFlags: { sidebar: true, quickAction: false, commandBar: true },
  },

  // Configurations Group
  {
    id: 'settings',
    href: '/settings',
    label: 'Settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager'],
    category: 'configuration',
    visibilityFlags: { sidebar: true, quickAction: false, commandBar: true },
  },

  // Future Modular Capacity Placeholders (For architectural readiness validation, sidebar flags are false)
  {
    id: 'admissions',
    href: '/admissions',
    label: 'Admissions',
    icon: 'M9 12l2 2 4-4m5 .5a9 9 0 11-18 0 9 9 0 0118 0z',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager'],
    category: 'future',
    visibilityFlags: { sidebar: false, quickAction: true, commandBar: true },
  },
  {
    id: 'follow-ups',
    href: '/follow-ups',
    label: 'Follow-ups',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager', 'role_counselor'],
    category: 'future',
    visibilityFlags: { sidebar: false, quickAction: true, commandBar: true },
  },
  {
    id: 'placements',
    href: '/placements',
    label: 'Placements',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager'],
    category: 'future',
    visibilityFlags: { sidebar: false, quickAction: true, commandBar: true },
  },
  {
    id: 'student-lifecycle',
    href: '/lifecycle',
    label: 'Student Lifecycle',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager'],
    category: 'future',
    visibilityFlags: { sidebar: false, quickAction: false, commandBar: true },
  },
  {
    id: 'notifications',
    href: '/notifications',
    label: 'Notifications',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager', 'role_frontdesk', 'role_counselor'],
    category: 'future',
    visibilityFlags: { sidebar: false, quickAction: false, commandBar: true },
  },
  {
    id: 'ai-insights',
    href: '/ai-insights',
    label: 'AI Insights',
    icon: 'M9.813 15.904L9 21l-1.813-5.096L2.096 14.09 7.19 13.28 8 8.187l1.813 5.096 5.096 1.813-5.096 1.813zM19.004 5.998l-.427 1.201-.427-1.201-1.202-.426 1.202-.427.427-1.202.427 1.202 1.202.427-1.202.426z',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager'],
    category: 'future',
    visibilityFlags: { sidebar: false, quickAction: false, commandBar: true },
  },
  {
    id: 'integrations',
    href: '/integrations',
    label: 'Integrations',
    icon: 'M11 4a2 2 0 114 0v2a2 2 0 11-4 0V4zM4 14a2 2 0 114 0v2a2 2 0 11-4 0v-2zm11 0a2 2 0 114 0v2a2 2 0 11-4 0v-2z',
    rolePermissions: ['role_super_admin', 'role_admin'],
    category: 'future',
    visibilityFlags: { sidebar: false, quickAction: false, commandBar: true },
  },
  {
    id: 'audit-center',
    href: '/audit',
    label: 'Audit Center',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    rolePermissions: ['role_super_admin', 'role_admin'],
    category: 'future',
    visibilityFlags: { sidebar: false, quickAction: false, commandBar: true },
  }
];
