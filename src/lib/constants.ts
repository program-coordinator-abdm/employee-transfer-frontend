// Karnataka Cities List - All major district HQs and cities
export const KARNATAKA_CITIES = [
  "Bengaluru",
  "Bengaluru Rural",
  "Mysuru",
  "Mangaluru",
  "Hubballi",
  "Dharwad",
  "Belagavi",
  "Kalaburagi",
  "Ballari",
  "Davanagere",
  "Shivamogga",
  "Tumakuru",
  "Udupi",
  "Hassan",
  "Mandya",
  "Chitradurga",
  "Kolar",
  "Chikkamagaluru",
  "Vijayapura",
  "Bidar",
  "Raichur",
  "Koppal",
  "Gadag",
  "Bagalkot",
  "Yadgir",
  "Ramanagara",
  "Chikkaballapur",
  "Kodagu (Madikeri)",
  "Haveri",
  "Uttara Kannada (Karwar)",
  "Dakshina Kannada",
  "Chamarajanagar",
] as const;

export type KarnatakaCity = typeof KARNATAKA_CITIES[number];

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [15, 20, 25, 50] as const;

// Category to role mapping for filtering employees
// Maps category keys to the roles that belong to each category
export const CATEGORY_ROLE_MAP: Record<string, string[]> = {
  "doctors": ["Medical Officer", "Senior Medical Officer", "Specialist Doctor", "Surgeon"],
  "nurses": ["Staff Nurse", "Senior Nurse", "Nursing Supervisor", "Head Nurse"],
  "pharmacists": ["Pharmacist", "Senior Pharmacist", "Chief Pharmacist"],
  "lab-technicians": ["Lab Technician", "Senior Lab Technician", "Pathologist"],
  "radiology": ["Radiographer", "Senior Radiographer", "Radiologist"],
  "support-staff": ["Data Entry Operator", "Attender", "Ward Boy", "Cleaner", "Helper"],
  "it-helpdesk": ["Programmer", "System Administrator", "IT Support", "Technical Assistant"],
  "emt": ["EMT", "Paramedic", "Ambulance Driver"],
  "administration": [
    "Senior Clerk", "Chief Clerk", "Administrative Officer", "Section Officer", 
    "Office Superintendent", "Accounts Officer", "Finance Officer", "Assistant Director", 
    "District Officer", "Inspector", "Revenue Inspector", "Welfare Officer", 
    "Training Officer", "Legal Assistant", "Survey Officer", "Research Officer", 
    "Librarian", "Health Officer", "Assistant Engineer", "Junior Engineer", 
    "Executive Engineer"
  ],
};

// Work history entry (mapped from backend assignmentHistory)
export interface WorkHistoryEntry {
  role?: string;
  city: string;
  hospitalName: string;
  position: string;
  fromDate: string;
  toDate: string;
  durationYears: number;
  district?: string;
  period?: string;
  type?: "current" | "additional" | "past" | "rural" | "contract" | "admin";
}

// Education details
export interface EducationEntry {
  type: string; // "MBBS", "Post Graduation", etc.
  degree?: string;
  institution?: string;
  university?: string;
  year?: string;
  specialization?: string;
}

// Timebound promotion entry
export interface TimeboundPromotion {
  label: string; // "6 Year Promotion", "13 Year Promotion", etc.
  status: string;
  order?: string;
  date?: string;
}

// Appointment details
export interface AppointmentDetails {
  slNoInOrder?: string;
  orderNoAndDate?: string;
  dateOfInitialAppointment?: string;
}

// Service information
export interface ServiceInformation {
  deputedByGovernment?: string;
  specialistService?: string;
  trainingInHospitalAdmin?: string;
  spouseInGovtService?: string;
  spouseServiceDetails?: string;
}

// Disciplinary record
export interface DisciplinaryRecord {
  departmentalEnquiries?: string;
  suspensionPeriods?: string;
  punishmentsReceived?: string;
  criminalProceedings?: string;
  pendingLegalMatters?: string;
}

// Declaration
export interface Declaration {
  declarationDate?: string;
  declarationPlace?: string;
  agreedToDeclaration?: string;
  remarks?: string;
}

// Supporting document
export interface SupportingDocument {
  name: string;
  sizeKB?: number;
  uploadedAt?: string;
  downloadUrl?: string;
}

// Achievement entry
export interface Achievement {
  type: "significant" | "special";
  description: string;
}

// Postgraduate Qualification
export interface PostgraduateQualification {
  degree?: string;
  institution?: string;
  university?: string;
  year?: string;
  specialization?: string;
}

// Administrative Role
export interface AdministrativeRole {
  role: string;
  fromDate?: string;
  toDate?: string;
  details?: string;
}

// Additional Charge
export interface AdditionalCharge {
  designation: string;
  place?: string;
  fromDate?: string;
  toDate?: string;
}

// Employee interface
export interface Employee {
  id: string;
  name: string;
  kgid: string;
  role: string;
  yearsOfWork: number;
  totalExperienceYears?: number;
  dob: string;
  dateOfJoining: string;
  currentCity: string;
  currentPosition: string;
  currentHospitalName: string;
  currentDesignation?: string;
  workHistory: WorkHistoryEntry[];
  email?: string;
  phone?: string;
  postAppliedFor?: string;
  submittedOn?: string;
  objections?: string;
  education?: EducationEntry[];
  serviceInformation?: ServiceInformation;
  appointmentDetails?: AppointmentDetails;
  probationDetails?: string;
  timeboundPromotions?: TimeboundPromotion[];
  postgraduateQualifications?: PostgraduateQualification[];
  administrativeRoles?: AdministrativeRole[];
  additionalCharges?: AdditionalCharge[];
  achievements?: Achievement[];
  disciplinaryRecord?: DisciplinaryRecord;
  declaration?: Declaration;
  documents?: SupportingDocument[];
}

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    kgid: "KG2019001",
    role: "Senior Clerk",
    yearsOfWork: 12,
    dob: "1985-03-15",
    dateOfJoining: "2012-06-01",
    currentCity: "Bengaluru",
    currentPosition: "Administrative Officer",
    currentHospitalName: "Victoria Hospital",
    workHistory: [
      { city: "Mysuru", hospitalName: "K.R. Hospital", position: "Junior Clerk", fromDate: "2012-06-01", toDate: "2015-05-31", durationYears: 3 },
      { city: "Hassan", hospitalName: "Hassan District Hospital", position: "Senior Clerk", fromDate: "2015-06-01", toDate: "2019-07-31", durationYears: 4 },
      { city: "Bengaluru", hospitalName: "Victoria Hospital", position: "Administrative Officer", fromDate: "2019-08-01", toDate: "Present", durationYears: 5 },
    ],
  },
  {
    id: "2",
    name: "Priya Sharma",
    kgid: "KG2020045",
    role: "Assistant Engineer",
    yearsOfWork: 8,
    dob: "1990-07-22",
    dateOfJoining: "2016-04-15",
    currentCity: "Mysuru",
    currentPosition: "Junior Engineer",
    currentHospitalName: "JSS Hospital",
    workHistory: [
      { city: "Mandya", hospitalName: "Mandya District Hospital", position: "Trainee Engineer", fromDate: "2016-04-15", toDate: "2018-03-31", durationYears: 2 },
      { city: "Mysuru", hospitalName: "JSS Hospital", position: "Junior Engineer", fromDate: "2018-04-01", toDate: "Present", durationYears: 6 },
    ],
  },
  {
    id: "3",
    name: "Venkatesh Gowda",
    kgid: "KG2015078",
    role: "Section Officer",
    yearsOfWork: 15,
    dob: "1980-11-08",
    dateOfJoining: "2009-01-10",
    currentCity: "Mangaluru",
    currentPosition: "Deputy Secretary",
    currentHospitalName: "Government Wenlock Hospital",
    workHistory: [
      { city: "Udupi", hospitalName: "Udupi District Hospital", position: "Assistant Officer", fromDate: "2009-01-10", toDate: "2012-12-31", durationYears: 4 },
      { city: "Dakshina Kannada", hospitalName: "Lady Goschen Hospital", position: "Section Officer", fromDate: "2013-01-01", toDate: "2018-06-30", durationYears: 5 },
      { city: "Mangaluru", hospitalName: "Government Wenlock Hospital", position: "Deputy Secretary", fromDate: "2018-07-01", toDate: "Present", durationYears: 6 },
    ],
  },
  {
    id: "4",
    name: "Lakshmi Devi",
    kgid: "KG2018032",
    role: "Accounts Officer",
    yearsOfWork: 10,
    dob: "1988-01-25",
    dateOfJoining: "2014-08-01",
    currentCity: "Hubballi",
    currentPosition: "Senior Accountant",
    currentHospitalName: "KIMS Hubballi",
    workHistory: [
      { city: "Dharwad", hospitalName: "SDM Medical College Hospital", position: "Junior Accountant", fromDate: "2014-08-01", toDate: "2017-07-31", durationYears: 3 },
      { city: "Gadag", hospitalName: "Gadag District Hospital", position: "Accounts Officer", fromDate: "2017-08-01", toDate: "2021-03-31", durationYears: 4 },
      { city: "Hubballi", hospitalName: "KIMS Hubballi", position: "Senior Accountant", fromDate: "2021-04-01", toDate: "Present", durationYears: 3 },
    ],
  },
  {
    id: "5",
    name: "Mohammed Farooq",
    kgid: "KG2017089",
    role: "Technical Assistant",
    yearsOfWork: 9,
    dob: "1989-05-12",
    dateOfJoining: "2015-09-15",
    currentCity: "Belagavi",
    currentPosition: "Technical Officer",
    currentHospitalName: "Belagavi Institute of Medical Sciences",
    workHistory: [
      { city: "Vijayapura", hospitalName: "BLDE Hospital", position: "Technical Trainee", fromDate: "2015-09-15", toDate: "2018-08-31", durationYears: 3 },
      { city: "Belagavi", hospitalName: "Belagavi Institute of Medical Sciences", position: "Technical Officer", fromDate: "2018-09-01", toDate: "Present", durationYears: 6 },
    ],
  },
  {
    id: "6",
    name: "Shivanna Reddy",
    kgid: "KG2016054",
    role: "District Officer",
    yearsOfWork: 14,
    dob: "1982-09-30",
    dateOfJoining: "2010-03-01",
    currentCity: "Kalaburagi",
    currentPosition: "Deputy Commissioner",
    currentHospitalName: "Gulbarga Institute of Medical Sciences",
    workHistory: [
      { city: "Bidar", hospitalName: "Bidar District Hospital", position: "Assistant Officer", fromDate: "2010-03-01", toDate: "2014-02-28", durationYears: 4 },
      { city: "Raichur", hospitalName: "RIMS Raichur", position: "District Officer", fromDate: "2014-03-01", toDate: "2019-05-31", durationYears: 5 },
      { city: "Kalaburagi", hospitalName: "Gulbarga Institute of Medical Sciences", position: "Deputy Commissioner", fromDate: "2019-06-01", toDate: "Present", durationYears: 5 },
    ],
  },
  {
    id: "7",
    name: "Anitha Kumari",
    kgid: "KG2021012",
    role: "Data Entry Operator",
    yearsOfWork: 4,
    dob: "1995-12-18",
    dateOfJoining: "2021-01-10",
    currentCity: "Ballari",
    currentPosition: "Junior Clerk",
    currentHospitalName: "VIMS Ballari",
    workHistory: [
      { city: "Koppal", hospitalName: "Koppal District Hospital", position: "Data Entry Operator", fromDate: "2021-01-10", toDate: "2023-06-30", durationYears: 2 },
      { city: "Ballari", hospitalName: "VIMS Ballari", position: "Junior Clerk", fromDate: "2023-07-01", toDate: "Present", durationYears: 2 },
    ],
  },
  {
    id: "8",
    name: "Basavaraj Patil",
    kgid: "KG2014098",
    role: "Executive Engineer",
    yearsOfWork: 16,
    dob: "1978-04-05",
    dateOfJoining: "2008-07-01",
    currentCity: "Davanagere",
    currentPosition: "Chief Engineer",
    currentHospitalName: "Chigateri District Hospital",
    workHistory: [
      { city: "Chitradurga", hospitalName: "Chitradurga District Hospital", position: "Junior Engineer", fromDate: "2008-07-01", toDate: "2012-06-30", durationYears: 4 },
      { city: "Shivamogga", hospitalName: "McGann Hospital", position: "Assistant Engineer", fromDate: "2012-07-01", toDate: "2017-12-31", durationYears: 5 },
      { city: "Davanagere", hospitalName: "Chigateri District Hospital", position: "Chief Engineer", fromDate: "2018-01-01", toDate: "Present", durationYears: 7 },
    ],
  },
  {
    id: "9",
    name: "Kavitha Nair",
    kgid: "KG2019067",
    role: "Research Officer",
    yearsOfWork: 7,
    dob: "1991-08-14",
    dateOfJoining: "2017-11-01",
    currentCity: "Shivamogga",
    currentPosition: "Senior Researcher",
    currentHospitalName: "McGann Hospital",
    workHistory: [
      { city: "Hassan", hospitalName: "Hassan Institute of Medical Sciences", position: "Research Assistant", fromDate: "2017-11-01", toDate: "2020-10-31", durationYears: 3 },
      { city: "Shivamogga", hospitalName: "McGann Hospital", position: "Senior Researcher", fromDate: "2020-11-01", toDate: "Present", durationYears: 4 },
    ],
  },
  {
    id: "10",
    name: "Suresh Babu",
    kgid: "KG2013045",
    role: "Chief Clerk",
    yearsOfWork: 18,
    dob: "1975-02-28",
    dateOfJoining: "2006-05-15",
    currentCity: "Tumakuru",
    currentPosition: "Head Clerk",
    currentHospitalName: "Tumkur District Hospital",
    workHistory: [
      { city: "Kolar", hospitalName: "Sri Narasimharaja Hospital", position: "Junior Clerk", fromDate: "2006-05-15", toDate: "2010-04-30", durationYears: 4 },
      { city: "Chikkaballapur", hospitalName: "Chikkaballapur District Hospital", position: "Senior Clerk", fromDate: "2010-05-01", toDate: "2015-08-31", durationYears: 5 },
      { city: "Tumakuru", hospitalName: "Tumkur District Hospital", position: "Head Clerk", fromDate: "2015-09-01", toDate: "Present", durationYears: 9 },
    ],
  },
  {
    id: "11",
    name: "Deepika Hegde",
    kgid: "KG2022001",
    role: "Junior Engineer",
    yearsOfWork: 2,
    dob: "1998-06-10",
    dateOfJoining: "2022-02-01",
    currentCity: "Udupi",
    currentPosition: "Assistant Engineer",
    currentHospitalName: "TMA Pai Hospital",
    workHistory: [
      { city: "Udupi", hospitalName: "TMA Pai Hospital", position: "Junior Engineer", fromDate: "2022-02-01", toDate: "2023-12-31", durationYears: 2 },
    ],
  },
  {
    id: "12",
    name: "Ravi Shankar",
    kgid: "KG2016023",
    role: "Inspector",
    yearsOfWork: 11,
    dob: "1986-10-03",
    dateOfJoining: "2013-04-01",
    currentCity: "Hassan",
    currentPosition: "Senior Inspector",
    currentHospitalName: "Hassan Institute of Medical Sciences",
    workHistory: [
      { city: "Mandya", hospitalName: "Mandya Institute of Medical Sciences", position: "Sub-Inspector", fromDate: "2013-04-01", toDate: "2017-03-31", durationYears: 4 },
      { city: "Hassan", hospitalName: "Hassan Institute of Medical Sciences", position: "Senior Inspector", fromDate: "2017-04-01", toDate: "Present", durationYears: 7 },
    ],
  },
  {
    id: "13",
    name: "Meena Kumari",
    kgid: "KG2018076",
    role: "Office Superintendent",
    yearsOfWork: 9,
    dob: "1989-03-22",
    dateOfJoining: "2015-06-15",
    currentCity: "Mandya",
    currentPosition: "Administrative Superintendent",
    currentHospitalName: "Mandya Institute of Medical Sciences",
    workHistory: [
      { city: "Mysuru", hospitalName: "K.R. Hospital", position: "Office Assistant", fromDate: "2015-06-15", toDate: "2019-05-31", durationYears: 4 },
      { city: "Mandya", hospitalName: "Mandya Institute of Medical Sciences", position: "Administrative Superintendent", fromDate: "2019-06-01", toDate: "Present", durationYears: 5 },
    ],
  },
  {
    id: "14",
    name: "Arun Kumar",
    kgid: "KG2017034",
    role: "Programmer",
    yearsOfWork: 8,
    dob: "1990-11-15",
    dateOfJoining: "2016-08-01",
    currentCity: "Chitradurga",
    currentPosition: "Senior Programmer",
    currentHospitalName: "Chitradurga District Hospital",
    workHistory: [
      { city: "Bengaluru", hospitalName: "Bowring Hospital", position: "Junior Programmer", fromDate: "2016-08-01", toDate: "2020-07-31", durationYears: 4 },
      { city: "Chitradurga", hospitalName: "Chitradurga District Hospital", position: "Senior Programmer", fromDate: "2020-08-01", toDate: "Present", durationYears: 4 },
    ],
  },
  {
    id: "15",
    name: "Savitha Rao",
    kgid: "KG2015091",
    role: "Librarian",
    yearsOfWork: 13,
    dob: "1983-07-08",
    dateOfJoining: "2011-02-01",
    currentCity: "Kolar",
    currentPosition: "Chief Librarian",
    currentHospitalName: "Sri Narasimharaja Hospital",
    workHistory: [
      { city: "Chikkaballapur", hospitalName: "Chikkaballapur District Hospital", position: "Assistant Librarian", fromDate: "2011-02-01", toDate: "2015-01-31", durationYears: 4 },
      { city: "Tumakuru", hospitalName: "Tumkur District Hospital", position: "Librarian", fromDate: "2015-02-01", toDate: "2019-12-31", durationYears: 5 },
      { city: "Kolar", hospitalName: "Sri Narasimharaja Hospital", position: "Chief Librarian", fromDate: "2020-01-01", toDate: "Present", durationYears: 4 },
    ],
  },
  {
    id: "16",
    name: "Naveen Gowda",
    kgid: "KG2020078",
    role: "Survey Officer",
    yearsOfWork: 5,
    dob: "1993-04-25",
    dateOfJoining: "2019-09-01",
    currentCity: "Chikkamagaluru",
    currentPosition: "Land Surveyor",
    currentHospitalName: "Chikkamagaluru District Hospital",
    workHistory: [
      { city: "Hassan", hospitalName: "Hassan District Hospital", position: "Survey Assistant", fromDate: "2019-09-01", toDate: "2022-08-31", durationYears: 3 },
      { city: "Chikkamagaluru", hospitalName: "Chikkamagaluru District Hospital", position: "Land Surveyor", fromDate: "2022-09-01", toDate: "Present", durationYears: 2 },
    ],
  },
  {
    id: "17",
    name: "Rekha Jain",
    kgid: "KG2014056",
    role: "Finance Officer",
    yearsOfWork: 15,
    dob: "1981-12-01",
    dateOfJoining: "2009-10-15",
    currentCity: "Vijayapura",
    currentPosition: "Chief Finance Officer",
    currentHospitalName: "BLDE Hospital",
    workHistory: [
      { city: "Bagalkot", hospitalName: "S. Nijalingappa Medical College", position: "Junior Finance Officer", fromDate: "2009-10-15", toDate: "2013-09-30", durationYears: 4 },
      { city: "Belagavi", hospitalName: "Belagavi Institute of Medical Sciences", position: "Finance Officer", fromDate: "2013-10-01", toDate: "2018-09-30", durationYears: 5 },
      { city: "Vijayapura", hospitalName: "BLDE Hospital", position: "Chief Finance Officer", fromDate: "2018-10-01", toDate: "Present", durationYears: 6 },
    ],
  },
  {
    id: "18",
    name: "Siddharth Murthy",
    kgid: "KG2019089",
    role: "Legal Assistant",
    yearsOfWork: 6,
    dob: "1992-09-18",
    dateOfJoining: "2018-03-01",
    currentCity: "Bidar",
    currentPosition: "Legal Officer",
    currentHospitalName: "Bidar Institute of Medical Sciences",
    workHistory: [
      { city: "Kalaburagi", hospitalName: "Gulbarga Institute of Medical Sciences", position: "Legal Trainee", fromDate: "2018-03-01", toDate: "2021-02-28", durationYears: 3 },
      { city: "Bidar", hospitalName: "Bidar Institute of Medical Sciences", position: "Legal Officer", fromDate: "2021-03-01", toDate: "Present", durationYears: 3 },
    ],
  },
  {
    id: "19",
    name: "Geetha Bhat",
    kgid: "KG2016067",
    role: "Training Officer",
    yearsOfWork: 12,
    dob: "1984-05-30",
    dateOfJoining: "2012-07-01",
    currentCity: "Raichur",
    currentPosition: "Chief Training Officer",
    currentHospitalName: "RIMS Raichur",
    workHistory: [
      { city: "Koppal", hospitalName: "Koppal District Hospital", position: "Training Assistant", fromDate: "2012-07-01", toDate: "2016-06-30", durationYears: 4 },
      { city: "Yadgir", hospitalName: "Yadgir District Hospital", position: "Training Officer", fromDate: "2016-07-01", toDate: "2020-12-31", durationYears: 4 },
      { city: "Raichur", hospitalName: "RIMS Raichur", position: "Chief Training Officer", fromDate: "2021-01-01", toDate: "Present", durationYears: 4 },
    ],
  },
  {
    id: "20",
    name: "Manjunath Shetty",
    kgid: "KG2021034",
    role: "Assistant Director",
    yearsOfWork: 3,
    dob: "1996-01-12",
    dateOfJoining: "2021-05-01",
    currentCity: "Koppal",
    currentPosition: "Deputy Director",
    currentHospitalName: "Koppal District Hospital",
    workHistory: [
      { city: "Ballari", hospitalName: "VIMS Ballari", position: "Management Trainee", fromDate: "2021-05-01", toDate: "2023-04-30", durationYears: 2 },
      { city: "Koppal", hospitalName: "Koppal District Hospital", position: "Deputy Director", fromDate: "2023-05-01", toDate: "Present", durationYears: 1 },
    ],
  },
  {
    id: "21",
    name: "Pallavi Kamath",
    kgid: "KG2018045",
    role: "Welfare Officer",
    yearsOfWork: 8,
    dob: "1990-08-07",
    dateOfJoining: "2016-11-01",
    currentCity: "Gadag",
    currentPosition: "Senior Welfare Officer",
    currentHospitalName: "Gadag Institute of Medical Sciences",
    workHistory: [
      { city: "Haveri", hospitalName: "Haveri District Hospital", position: "Welfare Assistant", fromDate: "2016-11-01", toDate: "2020-10-31", durationYears: 4 },
      { city: "Gadag", hospitalName: "Gadag Institute of Medical Sciences", position: "Senior Welfare Officer", fromDate: "2020-11-01", toDate: "Present", durationYears: 4 },
    ],
  },
  {
    id: "22",
    name: "Harish Kumar",
    kgid: "KG2015023",
    role: "Revenue Inspector",
    yearsOfWork: 14,
    dob: "1982-03-14",
    dateOfJoining: "2010-06-01",
    currentCity: "Bagalkot",
    currentPosition: "Deputy Tahsildar",
    currentHospitalName: "S. Nijalingappa Medical College",
    workHistory: [
      { city: "Vijayapura", hospitalName: "BLDE Hospital", position: "Revenue Assistant", fromDate: "2010-06-01", toDate: "2014-05-31", durationYears: 4 },
      { city: "Dharwad", hospitalName: "SDM Medical College Hospital", position: "Revenue Inspector", fromDate: "2014-06-01", toDate: "2019-05-31", durationYears: 5 },
      { city: "Bagalkot", hospitalName: "S. Nijalingappa Medical College", position: "Deputy Tahsildar", fromDate: "2019-06-01", toDate: "Present", durationYears: 5 },
    ],
  },
  {
    id: "23",
    name: "Suma Devi",
    kgid: "KG2017056",
    role: "Health Officer",
    yearsOfWork: 10,
    dob: "1987-06-22",
    dateOfJoining: "2014-04-01",
    currentCity: "Yadgir",
    currentPosition: "District Health Officer",
    currentHospitalName: "Yadgir District Hospital",
    workHistory: [
      { city: "Raichur", hospitalName: "RIMS Raichur", position: "Health Assistant", fromDate: "2014-04-01", toDate: "2017-03-31", durationYears: 3 },
      { city: "Kalaburagi", hospitalName: "Gulbarga Institute of Medical Sciences", position: "Health Officer", fromDate: "2017-04-01", toDate: "2021-03-31", durationYears: 4 },
      { city: "Yadgir", hospitalName: "Yadgir District Hospital", position: "District Health Officer", fromDate: "2021-04-01", toDate: "Present", durationYears: 3 },
    ],
  },
  {
    id: "24",
    name: "Kiran Naik",
    kgid: "KG2020012",
    role: "Environment Officer",
    yearsOfWork: 5,
    dob: "1994-10-28",
    dateOfJoining: "2019-07-15",
    currentCity: "Ramanagara",
    currentPosition: "Senior Environment Officer",
    currentHospitalName: "Ramanagara District Hospital",
    workHistory: [
      { city: "Bengaluru Rural", hospitalName: "Anekal PHC", position: "Environment Assistant", fromDate: "2019-07-15", toDate: "2022-07-14", durationYears: 3 },
      { city: "Ramanagara", hospitalName: "Ramanagara District Hospital", position: "Senior Environment Officer", fromDate: "2022-07-15", toDate: "Present", durationYears: 2 },
    ],
  },
  {
    id: "25",
    name: "Vidya Rani",
    kgid: "KG2013078",
    role: "Education Officer",
    yearsOfWork: 17,
    dob: "1977-02-15",
    dateOfJoining: "2007-08-01",
    currentCity: "Chikkaballapur",
    currentPosition: "Deputy Director of Education",
    currentHospitalName: "Chikkaballapur District Hospital",
    workHistory: [
      { city: "Kolar", hospitalName: "Sri Narasimharaja Hospital", position: "Education Assistant", fromDate: "2007-08-01", toDate: "2011-07-31", durationYears: 4 },
      { city: "Tumakuru", hospitalName: "Tumkur District Hospital", position: "Education Officer", fromDate: "2011-08-01", toDate: "2017-07-31", durationYears: 6 },
      { city: "Chikkaballapur", hospitalName: "Chikkaballapur District Hospital", position: "Deputy Director of Education", fromDate: "2017-08-01", toDate: "Present", durationYears: 7 },
    ],
  },
];
