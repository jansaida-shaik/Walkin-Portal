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
    icon: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager', 'role_frontdesk', 'role_counselor'],
    category: 'operations',
    visibilityFlags: { sidebar: true, quickAction: true, commandBar: true },
  },
  {
    id: 'walkins',
    href: '/walkins',
    label: 'Walk-ins',
    icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M19 8v6 M22 11h-6',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager', 'role_frontdesk', 'role_counselor'],
    category: 'operations',
    visibilityFlags: { sidebar: true, quickAction: true, commandBar: true },
  },
  {
    id: 'queue',
    href: '/queue',
    label: 'Queue',
    icon: 'M4 6h16 M4 12h16 M4 18h10 M17 15l3 3-3 3',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager', 'role_frontdesk', 'role_counselor'],
    category: 'operations',
    visibilityFlags: { sidebar: true, quickAction: true, commandBar: true },
  },
  {
    id: 'counsellors',
    href: '/counsellors',
    label: 'Counsellors',
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager', 'role_frontdesk', 'role_counselor'],
    category: 'operations',
    visibilityFlags: { sidebar: true, quickAction: true, commandBar: true },
  },
  {
    id: 'sessions',
    href: '/sessions',
    label: 'Sessions',
    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z M8 10h.01 M12 10h.01 M16 10h.01',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_counselor'],
    category: 'operations',
    visibilityFlags: { sidebar: true, quickAction: true, commandBar: true },
  },
  {
    id: 'converted-leads',
    href: '/converted-leads',
    label: 'Converted Leads',
    icon: 'M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c0 2 2 3 6 3s6-1 6-3v-5',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager', 'role_frontdesk', 'role_counselor'],
    category: 'operations',
    visibilityFlags: { sidebar: true, quickAction: true, commandBar: true },
  },

  // Analytics & Integrations Group
  {
    id: 'targets',
    href: '/targets',
    label: 'Targets & Incentives',
    icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm0-14a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm0-6a2 2 0 1 0 2 2 2 2 0 0 0-2-2z',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager', 'role_counselor', 'role_frontdesk'],
    category: 'analytics',
    visibilityFlags: { sidebar: true, quickAction: true, commandBar: true },
  },
  {
    id: 'league',
    href: '/league',
    label: 'Championship League',
    icon: 'M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2 M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2 M6 3h12v7a6 6 0 0 1-12 0V3z M12 16v5 M8 21h8',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager', 'role_counselor', 'role_frontdesk'],
    category: 'analytics',
    visibilityFlags: { sidebar: true, quickAction: true, commandBar: true },
  },
  {
    id: 'reports',
    href: '/reports',
    label: 'Reports',
    icon: 'M18 20V10 M12 20V4 M6 20v-6',
    rolePermissions: ['role_super_admin', 'role_admin', 'role_manager'],
    category: 'analytics',
    visibilityFlags: { sidebar: true, quickAction: false, commandBar: true },
  },
  {
    id: 'webhooks',
    href: '/webhooks',
    label: 'Webhooks',
    icon: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
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
    visibilityFlags: { sidebar: false, quickAction: false, commandBar: true },
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
