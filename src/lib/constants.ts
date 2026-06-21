export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface Module {
  id: string;
  name: string;
  departmentId: string;
  description: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
}

export interface Timing {
  id: string;
  label: string;
  start: string;
  end: string;
}

export interface Branch {
  id: string;
  name: string;
  locationId: string;
  profile: string;
  departmentIds: string[];
}

export interface BranchPayload extends Branch {
  locationName: string;
  departmentNames: string[];
}

export const roles: Role[] = [
  { id: 'role_super_admin', name: 'Super Admin', description: 'Full control of the system.' },
  { id: 'role_admin', name: 'Admin', description: 'Full administrative access.' },
  { id: 'role_manager', name: 'Manager', description: 'Reports, dashboards, and branch monitoring.' },
  { id: 'role_frontdesk', name: 'Front Desk', description: 'Add walk-ins, assign counsellors, and manage queue.' },
  { id: 'role_counselor', name: 'Counsellor', description: 'View assigned students, start/end sessions, and update status.' }
];

export const departments: Department[] = [
  { id: 'dept_sales', name: 'Sales', description: 'Admissions counseling and student conversion.' },
  { id: 'dept_development', name: 'Development', description: 'Product and software development.' },
  { id: 'dept_frontdesk', name: 'Front Desk', description: 'Walk-in intake and reception operations.' },
  { id: 'dept_administration', name: 'Administration', description: 'Administrative management and operations.' }
];

export const modules: Module[] = [
  { id: 'mod_appointments', name: 'Appointments', departmentId: 'dept_sales', description: 'Manage counselor appointments.' },
  { id: 'mod_walkins', name: 'Walk-ins', departmentId: 'dept_frontdesk', description: 'Manage walk-in intake and queue flow.' },
  { id: 'mod_admin', name: 'Administration', departmentId: 'dept_administration', description: 'Manage users, branches and operations.' },
  { id: 'mod_development', name: 'Development', departmentId: 'dept_development', description: 'Manage development work and support.' }
];

export const locations: Location[] = [
  { id: 'loc_hyd', name: 'Hyderabad', address: 'Hyderabad, Telangana' },
  { id: 'loc_vij', name: 'Vijayawada', address: 'Vijayawada, Andhra Pradesh' },
  { id: 'loc_vsp', name: 'Visakhapatnam', address: 'Visakhapatnam, Andhra Pradesh' }
];

export const timings: Timing[] = [
  { id: 'time_0900', label: '09:00 AM', start: '09:00', end: '09:30' },
  { id: 'time_1000', label: '10:00 AM', start: '10:00', end: '10:30' },
  { id: 'time_1100', label: '11:00 AM', start: '11:00', end: '11:30' },
  { id: 'time_1230', label: '12:30 PM', start: '12:30', end: '13:00' },
  { id: 'time_1500', label: '03:00 PM', start: '15:00', end: '15:30' }
];

export const branches: Branch[] = [
  {
    id: 'branch_jntu1',
    name: '1st Campus (JNTU-HYD)',
    locationId: 'loc_hyd',
    profile: 'Main campus at JNTU Hyderabad.',
    departmentIds: ['dept_sales', 'dept_frontdesk']
  },
  {
    id: 'branch_jntu2',
    name: '2nd Campus (JNTU-HYD)',
    locationId: 'loc_hyd',
    profile: 'Second campus at JNTU Hyderabad.',
    departmentIds: ['dept_sales', 'dept_frontdesk']
  },
  {
    id: 'branch_pista',
    name: 'Pista House (JNTU-HYD)',
    locationId: 'loc_hyd',
    profile: 'Pista House branch near JNTU Hyderabad.',
    departmentIds: ['dept_sales']
  },
  {
    id: 'branch_jntu4',
    name: '4th Campus (JNTU-HYD)',
    locationId: 'loc_hyd',
    profile: '4th campus at JNTU Hyderabad.',
    departmentIds: ['dept_sales', 'dept_frontdesk']
  },
  {
    id: 'branch_jntu5',
    name: '5th Campus (JNTU-HYD)',
    locationId: 'loc_hyd',
    profile: '5th campus at JNTU Hyderabad.',
    departmentIds: ['dept_sales']
  },
  {
    id: 'branch_ameerpet',
    name: 'Ameerpet (HYD)',
    locationId: 'loc_hyd',
    profile: 'Ameerpet branch in Hyderabad.',
    departmentIds: ['dept_sales', 'dept_frontdesk']
  },
  {
    id: 'branch_vij1',
    name: '1st Campus (Main-VIJ)',
    locationId: 'loc_vij',
    profile: 'Main campus in Vijayawada.',
    departmentIds: ['dept_sales', 'dept_frontdesk']
  },
  {
    id: 'branch_vij4',
    name: '4th Campus (Modern-VIJ)',
    locationId: 'loc_vij',
    profile: 'Modern campus in Vijayawada.',
    departmentIds: ['dept_sales', 'dept_administration']
  },
  {
    id: 'branch_vsp1',
    name: '1st Campus (Main-VSP)',
    locationId: 'loc_vsp',
    profile: 'Main campus in Visakhapatnam.',
    departmentIds: ['dept_sales', 'dept_frontdesk']
  }
];

export const getRole = (roleId: string): string => roles.find((role) => role.id === roleId)?.name || 'Unknown';
export const getDepartment = (departmentId: string): string => departments.find((dept) => dept.id === departmentId)?.name || 'Unknown';
export const getLocation = (locationId: string): string => locations.find((loc) => loc.id === locationId)?.name || 'Unknown';
export const getBranchName = (branchId: string): string => branches.find((b) => b.id === branchId)?.name || 'Unknown';
export const getBranchById = (branchId: string): Branch | undefined => branches.find((b) => b.id === branchId);

// ─── Courses ───────────────────────────────────────────────────────────────
export const COURSES: string[] = [
  'Python',
  'Java',
  'Full Stack (MERN)',
  'Full Stack (.NET)',
  'Full Stack (Python+React)',
  'Data Science',
  'AI & Machine Learning',
  'Data Analytics',
  'DevOps & Cloud (AWS)',
  'DevOps & Cloud (Azure)',
  'Cloud Computing (GCP)',
  'Cybersecurity',
  'Embedded Systems',
  'Digital Marketing',
  'Tally & Finance',
  'Salesforce',
  'UI/UX Design',
  'Software Testing (Manual)',
  'Software Testing (Automation)',
  'React JS',
  'Node JS',
  'Power BI',
  'Tableau',
  'Other',
];

// ─── Country Codes ─────────────────────────────────────────────────────────
export interface CountryCode {
  code: string;   // e.g. "+91"
  country: string; // e.g. "India"
  flag: string;   // emoji flag
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
];

