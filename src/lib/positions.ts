// Shared positions data with group information

export interface PositionInfo {
  name: string;
  group: string;
  subGroup: string;
}

const LRO_POSITIONS = [
  "Chief Transport Officer",
  "Administrative Officer (AO) (General) / (Transport) / (Family Welfare)",
  "Administrative Officer (AO) (Medical) (DME)",
  "Chief Food Analyst",
  "Assistant Director of Pharmacy (Chief Pharmacist)",
  "Health Education Officer",
];

const JRO_LRO_POSITIONS = [
  "Nephrologist / Urologist",
  "Forensic Medicine",
  "Pathologist / Blood Bank",
  "Micro Biologist",
  "Bio Chemist",
  "Psychiatrist",
  "TB",
  "General Medicine",
  "General Surgeon + Burns Ward (5)",
  "Obstetrics and Gynaecologist (OBG)",
  "Pediatrician",
  "Anesthesiologist + (Medical Intensivist-3)",
  "Ophthalmologist",
  "Orthopedician",
  "Ear, Nose and Throat Specialist / Otorhinolaryngology",
  "Skin Specialist / Dermatologist + LEP-2",
  "Radiologist",
  "Other (Public Health Manager, Epidemiologist-2 MLCD-4)",
  "Cardiologist / Neurosurgeon / Plastic Surgeon / General Duty Medical Officers / SMO / DCMO / CMO / Dental Health Officers",
];

const GROUP_B_POSITIONS = [
  "Health Equipment Officer",
  "Store Officer (Stores) & (IEC)",
  "Cold Chain Officer",
  "Clinical Instructor",
  "Senior Entomologist",
  "Entomologist",
  "Assistant Entomologist",
  "Microbiologist",
  "Clinical Psychologist",
  "Psychologist (Psychiatric Social Worker)",
  "Service Engineers",
  "Junior Chemical Engineer / Regional Assistant Chemical Analysts",
  "Food Analysts",
  "Senior Food Analysts",
  "Transport Officer",
  "Transport Manager",
  "Technical Officer (Goiter Cell / IDD) & (CMD)",
  "Graduate Pharmacist (Deputy Chief Pharmacy Officer)",
  "Assistant Administrative Officer",
  "Scientific Officer",
  "Medical Records Officer",
  "Assistant Leprosy Officer",
  "Assistant Malaria Officer",
  "Principal (Training Centre) ANMTC & GNM",
  "District Health Education Officer (Social Science Instructors)",
  "Superintendent of Nursing Grade-1",
  "District Nursing Officer",
  "Deputy District Health Education Officer",
];

const GROUP_C_POSITIONS = [
  "Office Superintendents",
  "First Division Assistant",
  "Second Division Assistant",
  "Vehicle Driver",
  "Nursing Superintendents Grade-2 (Group-C)",
  "Primary Health Care Officer (PHCO)",
  "Health Inspecting Officer (Jr HIO)",
  "Senior Health Inspecting Officer (Sr HIO)",
  "Health Supervisor",
  "Senior Primary Health Care Officer (Sr PHCO / LHV)",
  "Block Health Education Officer",
  "Junior Lab Technical Officer",
  "Senior Lab Technical Officer",
  "Junior Radiology Imaging Officer (X-ray Technician)",
  "Senior Radiology Imaging Officer (Radiographer)",
  "Ophthalmic Officer",
  "Senior Ophthalmic Officer",
  "Chief Ophthalmic Officer",
  "Assistant Documentation Technician (Assistant Medical Record Technician)",
  "Physiotherapist (General)",
  "Electrical Technician",
  "Social Worker",
  "Dietitian",
  "Dental Technician",
  "Dental Hygienist",
  "ECG Technician",
  "Dialysis Technician",
  "ECHO Technician",
  "Audiometrician",
  "Refrigerator Mechanic",
  "Librarian",
  "CT Scanning Technician",
  "T A T Technician",
  "Ultrasound Technician",
  "Equipment Technician",
  "Autoclave Mechanic",
  "Occupational Therapist",
  "OT Technicians",
  "Pharmacy Officers",
  "Senior Pharmacy Officers",
  "Junior Pharmacists",
  "Senior Pharmacists",
];

function buildPositions(names: string[], group: string, subGroup: string): PositionInfo[] {
  return names.map((name) => ({ name, group, subGroup }));
}

export const ALL_POSITIONS: PositionInfo[] = [
  ...buildPositions(LRO_POSITIONS, "Group A", "Officers (LRO)"),
  ...buildPositions(JRO_LRO_POSITIONS, "Group A", "Doctors (JRO & LRO)"),
  ...buildPositions(GROUP_B_POSITIONS, "Group B", "Officers"),
  ...buildPositions(GROUP_C_POSITIONS, "Group C", "Employees"),
];

export const KARNATAKA_DISTRICTS = [
  "Bagalkot", "Ballari (Bellary)", "Belagavi (Belgaum)", "Bengaluru Rural",
  "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikballapur",
  "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere",
  "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi (Gulbarga)",
  "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru (Mysore)",
  "Raichur", "Ramanagara", "Shivamogga (Shimoga)", "Tumakuru (Tumkur)",
  "Udupi", "Uttara Kannada", "Vijayanagara", "Vijayapura (Bijapur)", "Yadgir",
];
