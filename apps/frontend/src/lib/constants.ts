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

export const roles: Role[] = [
  { id: 'role_superadmin', name: 'Super Admin', description: 'Full institutional access across all campuses.' },
  { id: 'role_admin', name: 'Admin', description: 'Branch management and administrative operations.' },
  { id: 'role_counselor', name: 'Counselor', description: 'Student counseling, intake handling, and sessions.' },
  { id: 'role_frontdesk', name: 'Front Desk', description: 'Student walk-in reception and queue assignment.' },
];

export const departments: Department[] = [
  { id: 'dept_sales', name: 'Admissions & Counseling', description: 'Handles inquiries and admissions.' },
  { id: 'dept_frontdesk', name: 'Reception & Front Desk', description: 'Handles token generation and check-in.' },
  { id: 'dept_administration', name: 'Administration', description: 'Branch operations and oversight.' },
];

export const modules: Module[] = [
  { id: 'mod_counseling', name: 'Counseling', departmentId: 'dept_sales', description: 'Student guidance.' },
  { id: 'mod_queue', name: 'Queue Management', departmentId: 'dept_frontdesk', description: 'Queue handling.' },
];

export const locations: Location[] = [
  { id: 'loc_hyd', name: 'Hyderabad', address: 'Hyderabad, Telangana' },
  { id: 'loc_vsp', name: 'Visakhapatnam', address: 'Visakhapatnam, Andhra Pradesh' },
  { id: 'loc_vij', name: 'Vijayawada', address: 'Vijayawada, Andhra Pradesh' },
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
    profile: '1st Main Campus at JNTU Hyderabad.',
    departmentIds: ['dept_sales', 'dept_frontdesk']
  },
  {
    id: 'branch_pista',
    name: '3rd Campus (Pista House-HYD)',
    locationId: 'loc_hyd',
    profile: '3rd Campus near Pista House at JNTU Hyderabad.',
    departmentIds: ['dept_sales', 'dept_frontdesk']
  },
  {
    id: 'branch_vsp1',
    name: '1st Campus (Main-VSP)',
    locationId: 'loc_vsp',
    profile: '1st Main Campus in Visakhapatnam.',
    departmentIds: ['dept_sales', 'dept_frontdesk']
  },
  {
    id: 'branch_vij1',
    name: '1st Campus (Main-VIJ)',
    locationId: 'loc_vij',
    profile: '1st Main Campus in Vijayawada.',
    departmentIds: ['dept_sales', 'dept_frontdesk']
  }
];

export const walkinBranches: Branch[] = branches;

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
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
];

export interface SelectOption {
  value: string;
  label: string;
}

export const KNOW_US_OPTIONS: SelectOption[] = [
  { value: 'Google Search', label: 'Google Search' },
  { value: 'Instagram / Social Media', label: 'Instagram / Social Media' },
  { value: 'Friend / Referral', label: 'Friend / Referral' },
  { value: 'College Campus Placement', label: 'College Campus Placement' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'Banner / Hoarding', label: 'Banner / Hoarding' },
  { value: 'Walk-in / Direct Visit', label: 'Walk-in / Direct Visit' },
  { value: 'Other', label: 'Other' },
];

export const PASSOUT_YEAR_OPTIONS: SelectOption[] = [
  { value: '2026 (Pursuing)', label: '2026 (Pursuing)' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
  { value: '2021', label: '2021' },
  { value: '2020 or earlier', label: '2020 or earlier' },
];

export const WHY_COURSE_OPTIONS: SelectOption[] = [
  { value: 'Career Switch to IT', label: 'Career Switch to IT' },
  { value: 'Fresh Graduate Job Placement', label: 'Fresh Graduate Job Placement' },
  { value: 'Skill Upgrade / Promotion', label: 'Skill Upgrade / Promotion' },
  { value: 'College Project / Academic Requirement', label: 'College Project / Academic Requirement' },
  { value: 'Freelancing & Remote Work', label: 'Freelancing & Remote Work' },
  { value: 'Personal Interest & Curiosity', label: 'Personal Interest & Curiosity' },
  { value: 'Other', label: 'Other' },
];
