// ===== Backend response shapes =====
interface BackendUser {
  id: string;
  username: string;
  email: string;
  phone?: string;
  profilePictureUrl?: string | null;
}

interface BackendLoginResponse {
  token: string;
  user: BackendUser;
}

interface BackendAssignmentEntry {
  role?: string;
  city: string;
  hospital: string;
  position: string;
  startedOn: string;
  endedOn?: string | null;
  district?: string;
  period?: string;
  type?: "current" | "additional" | "past" | "rural" | "contract" | "admin";
}

interface BackendEducation {
  type: string;
  qualification?: string;
  degree?: string;
  institution?: string;
  university?: string;
  year?: string;
  specialization?: string;
}

interface BackendTimeboundPromotion {
  label: string;
  status: string;
  order?: string;
  date?: string;
}

interface BackendServiceInformation {
  deputedByGovernment?: string;
  specialistService?: string;
  trainingInHospitalAdmin?: string;
  spouseInGovtService?: string;
  spouseServiceDetails?: string;
}

interface BackendAppointmentDetails {
  slNoInOrder?: string;
  orderNoAndDate?: string;
  dateOfInitialAppointment?: string;
}

interface BackendDisciplinaryRecord {
  departmentalEnquiries?: string;
  suspensionPeriods?: string;
  punishmentsReceived?: string;
  criminalProceedings?: string;
  pendingLegalMatters?: string;
}

interface BackendDeclaration {
  declarationDate?: string;
  declarationPlace?: string;
  agreedToDeclaration?: string;
  remarks?: string;
}

interface BackendDocument {
  name: string;
  sizeKB?: number;
  uploadedAt?: string;
  downloadUrl?: string;
}

interface BackendAchievement {
  type: "significant" | "special";
  description: string;
}

interface BackendPostgraduateQualification {
  qualification?: string;
  degree?: string;
  institution?: string;
  university?: string;
  year?: string;
  specialization?: string;
}

interface BackendAdministrativeRole {
  role: string;
  fromDate?: string;
  toDate?: string;
  details?: string;
}

interface BackendAdditionalCharge {
  designation: string;
  place?: string;
  fromDate?: string;
  toDate?: string;
}

interface BackendEmployee {
  id: string;
  empName: string;
  empKgid: string;
  role: string;
  yearsOfWork: number;
  totalExperienceYears?: number;
  dob: string;
  dateOfJoining?: string;
  currentCity: string;
  currentPosition: string;
  currentHospital?: string;
  currentDesignation?: string;
  assignmentHistory?: BackendAssignmentEntry[];
  category?: string;
  email?: string;
  phone?: string;
  postAppliedFor?: string;
  submittedOn?: string;
  objections?: string;
  education?: BackendEducation[];
  serviceInformation?: BackendServiceInformation;
  appointmentDetails?: BackendAppointmentDetails;
  probationDetails?: string;
  timeboundPromotions?: BackendTimeboundPromotion[];
  postgraduateQualifications?: BackendPostgraduateQualification[];
  administrativeRoles?: BackendAdministrativeRole[];
  additionalCharges?: BackendAdditionalCharge[];
  achievements?: BackendAchievement[];
  disciplinaryRecord?: BackendDisciplinaryRecord;
  declaration?: BackendDeclaration;
  documents?: BackendDocument[];
}

interface BackendEmployeesResponse {
  data: BackendEmployee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BackendTransferResponse {
  employee: BackendEmployee;
}

import { API_BASE_URL, Employee, WorkHistoryEntry } from "./constants";

// API Response types
interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

interface EmployeesResponse {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TransferRequest {
  toCity: string;
  toPosition: string;
  toHospitalName?: string;
  effectiveFrom: string;
}

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("token");
};

export const getUser = (): LoginResponse["user"] | null => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const setUser = (user: LoginResponse["user"]): void => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const removeUser = (): void => {
  localStorage.removeItem("user");
};

// API Client with token injection
const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      removeToken();
      removeUser();
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};

// Helper: calculate duration in years between two dates
function calcDurationYears(from: string, to?: string | null): number {
  const start = new Date(from);
  const end = to ? new Date(to) : new Date();
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24 * 365.25)));
}

// Helper: map backend employee to frontend Employee
function mapBackendEmployee(e: BackendEmployee): Employee {
  const workHistory: WorkHistoryEntry[] = (e.assignmentHistory || []).map(
    (a) => ({
      role: a.role || e.role,
      city: a.city,
      hospitalName: a.hospital,
      position: a.position,
      fromDate: a.startedOn,
      toDate: a.endedOn || "Present",
      durationYears: calcDurationYears(a.startedOn, a.endedOn),
      district: a.district,
      period: a.period,
      type: a.type,
    })
  );

  return {
    id: e.id,
    name: e.empName,
    kgid: e.empKgid,
    role: e.role,
    yearsOfWork: e.yearsOfWork,
    totalExperienceYears: e.totalExperienceYears,
    dob: e.dob,
    dateOfJoining: e.dateOfJoining || "",
    currentCity: e.currentCity,
    currentPosition: e.currentPosition,
    currentHospitalName: e.currentHospital || "",
    currentDesignation: e.currentDesignation,
    workHistory,
    email: e.email,
    phone: e.phone,
    postAppliedFor: e.postAppliedFor,
    submittedOn: e.submittedOn,
    objections: e.objections,
    education: e.education,
    serviceInformation: e.serviceInformation,
    appointmentDetails: e.appointmentDetails,
    probationDetails: e.probationDetails,
    timeboundPromotions: e.timeboundPromotions,
    postgraduateQualifications: e.postgraduateQualifications,
    administrativeRoles: e.administrativeRoles,
    additionalCharges: e.additionalCharges,
    achievements: e.achievements,
    disciplinaryRecord: e.disciplinaryRecord,
    declaration: e.declaration,
    documents: e.documents,
  };
}

// Auth API
export const login = async (credentials: {
  username?: string;
  email?: string;
  password: string;
}): Promise<LoginResponse> => {
  const res = await apiClient<BackendLoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  return {
    token: res.token,
    user: {
      id: res.user.id,
      username: res.user.username,
      email: res.user.email,
      name: res.user.username,
      avatar: res.user.profilePictureUrl ?? undefined,
    },
  };
};

// Employees API
export const getEmployees = async (params: {
  searchMode?: "name" | "kgid";
  query?: string;
  page?: number;
  limit?: number;
  category?: string;
}): Promise<EmployeesResponse> => {
  const { searchMode = "name", query = "", page = 1, limit = 20, category } = params;

  const searchParams = new URLSearchParams({
    searchMode,
    query,
    page: page.toString(),
    limit: limit.toString(),
    ...(category && { category }),
  });

  const res = await apiClient<BackendEmployeesResponse>(
    `/employees?${searchParams}`
  );

  const employees: Employee[] = res.data.map(mapBackendEmployee);

  return {
    employees,
    total: res.total,
    page: res.page,
    limit: res.limit,
    totalPages: res.totalPages,
  };
};

// Get single employee (with optional category query param)
export const getEmployee = async (id: string, category?: string): Promise<Employee> => {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await apiClient<BackendEmployee>(`/employees/${id}${query}`);
  return mapBackendEmployee(res);
};

// Transfer employee (with optional category query param)
export const transferEmployee = async (
  id: string,
  transfer: TransferRequest,
  category?: string
): Promise<Employee> => {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await apiClient<BackendTransferResponse>(
    `/employees/${id}/transfers${query}`,
    {
      method: "POST",
      body: JSON.stringify(transfer),
    }
  );

  return mapBackendEmployee(res.employee);
};

// Export functions
const downloadFile = async (endpoint: string, filename: string): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Export failed: ${res.status}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
};

export const downloadEmployeesCSV = async (): Promise<void> => {
  return downloadFile("/exports/employees.csv", "employees.csv");
};

export const downloadEmployeesPDF = async (): Promise<void> => {
  return downloadFile("/exports/employees.pdf", "employees.pdf");
};

// ===== New Employee (Data Officer form) types =====
export interface PastServiceEntry {
  postHeld: string;
  postGroup: string;
  postSubGroup: string;
  firstPostHeld: string;
  institutionType: string;
  hfrId: string;
  institution: string;
  district: string;
  taluk: string;
  cityTownVillage: string;
  fromDate: string;
  toDate: string;
  tenure: string;
}

export interface EducationFormEntry {
  level: string;
  institution: string;
  yearOfPassing: string;
  gradePercentage: string;
  documentProof: string;
  specialization: string;
}

export interface NewEmployee {
  id?: string;
  kgid: string;
  name: string;
  designation: string;
  designationGroup: string;
  designationSubGroup: string;
  firstPostHeld: string;
  dateOfEntry: string;
  gender: string;
  probationaryPeriod: boolean;
  probationaryPeriodDoc: string;
  probationDeclarationDate: string;
  dateOfBirth: string;
  cltCompleted: boolean;
  cltCompletedDoc: string;
  isDoctorNursePharmacist: boolean;
  hprId: string;
  hfrId: string;
  address: string;
  pinCode: string;
  email: string;
  phoneNumber: string;
  telephoneNumber: string;
  officeAddress: string;
  officePinCode: string;
  officeEmail: string;
  officePhoneNumber: string;
  officeTelephoneNumber: string;
  currentPostHeld: string;
  currentPostGroup: string;
  currentPostSubGroup: string;
  currentFirstPostHeld: string;
  currentInstitution: string;
  currentDistrict: string;
  currentTaluk: string;
  currentCityTownVillage: string;
  currentInstitutionType: string;
  currentHfrId: string;
  currentWorkingSince: string;
  currentAreaType: string;
  cltCompletionDate: string;
  pastServices: PastServiceEntry[];
  educationDetails: EducationFormEntry[];
  terminallyIll: boolean;
  terminallyIllDoc: string;
  pregnantOrChildUnderOne: boolean;
  pregnantOrChildUnderOneDoc: string;
  retiringWithinTwoYears: boolean;
  retiringWithinTwoYearsDoc: string;
  childSpouseDisability: boolean;
  childSpouseDisabilityDoc: string;
  divorceeWidowWithChild: boolean;
  divorceeWidowWithChildDoc: string;
  spouseGovtServant: boolean;
  spouseGovtServantDoc: string;
  spouseDesignation: string;
  spouseDistrict: string;
  spouseTaluk: string;
  spouseCityTownVillage: string;
  ngoBenefits: boolean;
  ngoBenefitsDoc: string;
  timeboundApplicable: boolean;
  timeboundCategory: string;
  timeboundYears: string;
  timeboundDoc: string;
  timeboundDate: string;
  timebound6Years: boolean;
  timebound6YearsDoc: string;
  timebound6YearsDate: string;
  timebound13Years: boolean;
  timebound13YearsDoc: string;
  timebound13YearsDate: string;
  timebound20Years: boolean;
  timebound20YearsDoc: string;
  timebound20YearsDate: string;
  timebound10Years: boolean;
  timebound10YearsDoc: string;
  timebound10YearsDate: string;
  timebound15Years: boolean;
  timebound15YearsDoc: string;
  timebound15YearsDate: string;
  currentServiceDoc: string;
  promotionRejected: boolean;
  promotionRejectedDate: string;
  promotionRejectedDesignation: string;
  pgBond: boolean;
  pgBondDoc: string;
  pgBondCompletionDate: string;
  recruitmentType: string;
  contractRegularised: boolean;
  contractRegularisedDoc: string;
  contractRegularisedDate: string;
  contractJoiningDate: string;
  pastServiceDocs: string[];
  empDeclAgreed: boolean;
  empDeclName: string;
  empDeclDate: string;
  officerDeclAgreed: boolean;
  officerDeclName: string;
  officerDeclDate: string;
  createdAt?: string;
}

// Create employee (Data Officer)
export const createEmployee = async (payload: Omit<NewEmployee, "id" | "createdAt">): Promise<NewEmployee> => {
  const body = {
    empKgid: payload.kgid,
    empName: payload.name,
    designation: payload.designation,
    designationGroup: payload.designationGroup,
    designationSubGroup: payload.designationSubGroup,
    firstPostHeld: payload.firstPostHeld,
    dateOfEntry: payload.dateOfEntry,
    dateOfJoining: payload.dateOfEntry,
    dob: payload.dateOfBirth,
    cltCompleted: payload.cltCompleted,
    cltCompletedDoc: payload.cltCompletedDoc,
    isDoctorNursePharmacist: payload.isDoctorNursePharmacist,
    hprId: payload.hprId,
    hfrId: payload.hfrId,
    gender: payload.gender,
    address: payload.address,
    pinCode: payload.pinCode,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    telephoneNumber: payload.telephoneNumber,
    officeAddress: payload.officeAddress,
    officePinCode: payload.officePinCode,
    officeEmail: payload.officeEmail,
    officePhoneNumber: payload.officePhoneNumber,
    officeTelephoneNumber: payload.officeTelephoneNumber,
    currentPostHeld: payload.currentPostHeld,
    currentPostGroup: payload.currentPostGroup,
    currentPostSubGroup: payload.currentPostSubGroup,
    currentFirstPostHeld: payload.currentFirstPostHeld,
    currentInstitution: payload.currentInstitution,
    currentInstitutionType: payload.currentInstitutionType,
    currentHfrId: payload.currentHfrId,
    currentDistrict: payload.currentDistrict,
    currentTaluk: payload.currentTaluk,
    currentCityTownVillage: payload.currentCityTownVillage,
    currentWorkingSince: payload.currentWorkingSince,
    currentAreaType: payload.currentAreaType,
    cltCompletionDate: payload.cltCompletionDate,
    probationaryPeriod: payload.probationaryPeriod,
    probationaryPeriodDoc: payload.probationaryPeriodDoc,
    probationDeclarationDate: payload.probationDeclarationDate,
    terminallyIll: payload.terminallyIll,
    terminallyIllDoc: payload.terminallyIllDoc,
    pregnantOrChildUnderOne: payload.pregnantOrChildUnderOne,
    pregnantOrChildUnderOneDoc: payload.pregnantOrChildUnderOneDoc,
    retiringWithinTwoYears: payload.retiringWithinTwoYears,
    retiringWithinTwoYearsDoc: payload.retiringWithinTwoYearsDoc,
    childSpouseDisability: payload.childSpouseDisability,
    childSpouseDisabilityDoc: payload.childSpouseDisabilityDoc,
    divorceeWidowWithChild: payload.divorceeWidowWithChild,
    divorceeWidowWithChildDoc: payload.divorceeWidowWithChildDoc,
    spouseGovtServant: payload.spouseGovtServant,
    spouseGovtServantDoc: payload.spouseGovtServantDoc,
    spouseDesignation: payload.spouseDesignation,
    spouseDistrict: payload.spouseDistrict,
    spouseTaluk: payload.spouseTaluk,
    spouseCityTownVillage: payload.spouseCityTownVillage,
    ngoBenefits: payload.ngoBenefits,
    ngoBenefitsDoc: payload.ngoBenefitsDoc,
    timeboundApplicable: payload.timeboundApplicable,
    timeboundCategory: payload.timeboundCategory,
    timeboundYears: payload.timeboundYears,
    timeboundDoc: payload.timeboundDoc,
    timeboundDate: payload.timeboundDate,
    promotionRejected: payload.promotionRejected,
    promotionRejectedDate: payload.promotionRejectedDate,
    promotionRejectedDesignation: payload.promotionRejectedDesignation,
    pgBond: payload.pgBond,
    pgBondDoc: payload.pgBondDoc,
    pgBondCompletionDate: payload.pgBondCompletionDate,
    recruitmentType: payload.recruitmentType,
    contractRegularised: payload.contractRegularised,
    contractRegularisedDoc: payload.contractRegularisedDoc,
    contractRegularisedDate: payload.contractRegularisedDate,
    contractJoiningDate: payload.contractJoiningDate,
    timebound6Years: payload.timebound6Years,
    timebound6YearsDoc: payload.timebound6YearsDoc,
    timebound6YearsDate: payload.timebound6YearsDate,
    timebound13Years: payload.timebound13Years,
    timebound13YearsDoc: payload.timebound13YearsDoc,
    timebound13YearsDate: payload.timebound13YearsDate,
    timebound20Years: payload.timebound20Years,
    timebound20YearsDoc: payload.timebound20YearsDoc,
    timebound20YearsDate: payload.timebound20YearsDate,
    timebound10Years: payload.timebound10Years,
    timebound10YearsDoc: payload.timebound10YearsDoc,
    timebound10YearsDate: payload.timebound10YearsDate,
    timebound15Years: payload.timebound15Years,
    timebound15YearsDoc: payload.timebound15YearsDoc,
    timebound15YearsDate: payload.timebound15YearsDate,
    currentServiceDoc: payload.currentServiceDoc,
    pastServiceDocs: payload.pastServiceDocs,
    empDeclAgreed: payload.empDeclAgreed,
    empDeclName: payload.empDeclName,
    empDeclDate: payload.empDeclDate,
    officerDeclAgreed: payload.officerDeclAgreed,
    officerDeclName: payload.officerDeclName,
    officerDeclDate: payload.officerDeclDate,
    pastServices: payload.pastServices,
    educationDetails: payload.educationDetails,
  };
  return apiClient<NewEmployee>("/employees", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

// Update employee (Admin)
export const updateEmployeeById = async (id: string, payload: Omit<NewEmployee, "id" | "createdAt">): Promise<NewEmployee> => {
  const body = {
    empKgid: payload.kgid,
    empName: payload.name,
    designation: payload.designation,
    designationGroup: payload.designationGroup,
    designationSubGroup: payload.designationSubGroup,
    firstPostHeld: payload.firstPostHeld,
    dateOfEntry: payload.dateOfEntry,
    dateOfJoining: payload.dateOfEntry,
    dob: payload.dateOfBirth,
    cltCompleted: payload.cltCompleted,
    cltCompletedDoc: payload.cltCompletedDoc,
    isDoctorNursePharmacist: payload.isDoctorNursePharmacist,
    hprId: payload.hprId,
    hfrId: payload.hfrId,
    gender: payload.gender,
    address: payload.address,
    pinCode: payload.pinCode,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    telephoneNumber: payload.telephoneNumber,
    officeAddress: payload.officeAddress,
    officePinCode: payload.officePinCode,
    officeEmail: payload.officeEmail,
    officePhoneNumber: payload.officePhoneNumber,
    officeTelephoneNumber: payload.officeTelephoneNumber,
    currentPostHeld: payload.currentPostHeld,
    currentPostGroup: payload.currentPostGroup,
    currentPostSubGroup: payload.currentPostSubGroup,
    currentFirstPostHeld: payload.currentFirstPostHeld,
    currentInstitution: payload.currentInstitution,
    currentInstitutionType: payload.currentInstitutionType,
    currentHfrId: payload.currentHfrId,
    currentDistrict: payload.currentDistrict,
    currentTaluk: payload.currentTaluk,
    currentCityTownVillage: payload.currentCityTownVillage,
    currentWorkingSince: payload.currentWorkingSince,
    currentAreaType: payload.currentAreaType,
    cltCompletionDate: payload.cltCompletionDate,
    probationaryPeriod: payload.probationaryPeriod,
    probationaryPeriodDoc: payload.probationaryPeriodDoc,
    probationDeclarationDate: payload.probationDeclarationDate,
    terminallyIll: payload.terminallyIll,
    terminallyIllDoc: payload.terminallyIllDoc,
    pregnantOrChildUnderOne: payload.pregnantOrChildUnderOne,
    pregnantOrChildUnderOneDoc: payload.pregnantOrChildUnderOneDoc,
    retiringWithinTwoYears: payload.retiringWithinTwoYears,
    retiringWithinTwoYearsDoc: payload.retiringWithinTwoYearsDoc,
    childSpouseDisability: payload.childSpouseDisability,
    childSpouseDisabilityDoc: payload.childSpouseDisabilityDoc,
    divorceeWidowWithChild: payload.divorceeWidowWithChild,
    divorceeWidowWithChildDoc: payload.divorceeWidowWithChildDoc,
    spouseGovtServant: payload.spouseGovtServant,
    spouseGovtServantDoc: payload.spouseGovtServantDoc,
    spouseDesignation: payload.spouseDesignation,
    spouseDistrict: payload.spouseDistrict,
    spouseTaluk: payload.spouseTaluk,
    spouseCityTownVillage: payload.spouseCityTownVillage,
    ngoBenefits: payload.ngoBenefits,
    ngoBenefitsDoc: payload.ngoBenefitsDoc,
    timeboundApplicable: payload.timeboundApplicable,
    timeboundCategory: payload.timeboundCategory,
    timeboundYears: payload.timeboundYears,
    timeboundDoc: payload.timeboundDoc,
    timeboundDate: payload.timeboundDate,
    promotionRejected: payload.promotionRejected,
    promotionRejectedDate: payload.promotionRejectedDate,
    promotionRejectedDesignation: payload.promotionRejectedDesignation,
    pgBond: payload.pgBond,
    pgBondDoc: payload.pgBondDoc,
    pgBondCompletionDate: payload.pgBondCompletionDate,
    recruitmentType: payload.recruitmentType,
    contractRegularised: payload.contractRegularised,
    contractRegularisedDoc: payload.contractRegularisedDoc,
    contractRegularisedDate: payload.contractRegularisedDate,
    contractJoiningDate: payload.contractJoiningDate,
    timebound6Years: payload.timebound6Years,
    timebound6YearsDoc: payload.timebound6YearsDoc,
    timebound6YearsDate: payload.timebound6YearsDate,
    timebound13Years: payload.timebound13Years,
    timebound13YearsDoc: payload.timebound13YearsDoc,
    timebound13YearsDate: payload.timebound13YearsDate,
    timebound20Years: payload.timebound20Years,
    timebound20YearsDoc: payload.timebound20YearsDoc,
    timebound20YearsDate: payload.timebound20YearsDate,
    timebound10Years: payload.timebound10Years,
    timebound10YearsDoc: payload.timebound10YearsDoc,
    timebound10YearsDate: payload.timebound10YearsDate,
    timebound15Years: payload.timebound15Years,
    timebound15YearsDoc: payload.timebound15YearsDoc,
    timebound15YearsDate: payload.timebound15YearsDate,
    currentServiceDoc: payload.currentServiceDoc,
    pastServiceDocs: payload.pastServiceDocs,
    empDeclAgreed: payload.empDeclAgreed,
    empDeclName: payload.empDeclName,
    empDeclDate: payload.empDeclDate,
    officerDeclAgreed: payload.officerDeclAgreed,
    officerDeclName: payload.officerDeclName,
    officerDeclDate: payload.officerDeclDate,
    pastServices: payload.pastServices,
    educationDetails: payload.educationDetails,
  };
  return apiClient<NewEmployee>(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

// Helper: map backend keys to NewEmployee frontend keys
function mapBackendToNewEmployee(raw: any): NewEmployee {
  return {
    id: raw.id,
    kgid: raw.empKgid ?? raw.kgid ?? "",
    name: raw.empName ?? raw.name ?? "",
    designation: raw.designation ?? "",
    designationGroup: raw.designationGroup ?? "",
    designationSubGroup: raw.designationSubGroup ?? "",
    firstPostHeld: raw.firstPostHeld ?? "",
    dateOfEntry: raw.dateOfEntry ?? "",
    dateOfBirth: raw.dob ?? raw.dateOfBirth ?? "",
    cltCompleted: raw.cltCompleted ?? false,
    cltCompletedDoc: raw.cltCompletedDoc ?? "",
    isDoctorNursePharmacist: raw.isDoctorNursePharmacist ?? false,
    hprId: raw.hprId ?? "",
    hfrId: raw.hfrId ?? "",
    gender: raw.gender ?? "",
    probationaryPeriod: raw.probationaryPeriod ?? false,
    probationaryPeriodDoc: raw.probationaryPeriodDoc ?? "",
    probationDeclarationDate: raw.probationDeclarationDate ?? "",
    address: raw.address ?? "",
    pinCode: raw.pinCode ?? "",
    email: raw.email ?? "",
    phoneNumber: raw.phoneNumber ?? "",
    telephoneNumber: raw.telephoneNumber ?? "",
    officeAddress: raw.officeAddress ?? "",
    officePinCode: raw.officePinCode ?? "",
    officeEmail: raw.officeEmail ?? "",
    officePhoneNumber: raw.officePhoneNumber ?? "",
    officeTelephoneNumber: raw.officeTelephoneNumber ?? "",
    currentPostHeld: raw.currentPostHeld ?? raw.currentDesignation ?? raw.designation ?? "",
    currentPostGroup: raw.currentPostGroup ?? "",
    currentPostSubGroup: raw.currentPostSubGroup ?? "",
    currentFirstPostHeld: raw.currentFirstPostHeld ?? "",
    currentInstitution: raw.currentInstitution ?? "",
    currentInstitutionType: raw.currentInstitutionType ?? "",
    currentHfrId: raw.currentHfrId ?? "",
    currentDistrict: raw.currentDistrict ?? "",
    currentTaluk: raw.currentTaluk ?? "",
    currentCityTownVillage: raw.currentCityTownVillage ?? "",
    currentWorkingSince: raw.currentWorkingSince ?? "",
    currentAreaType: raw.currentAreaType ?? "",
    cltCompletionDate: raw.cltCompletionDate ?? "",
    pastServices: raw.pastServices ?? [],
    educationDetails: raw.educationDetails ?? [],
    terminallyIll: raw.terminallyIll ?? false,
    terminallyIllDoc: raw.terminallyIllDoc ?? "",
    pregnantOrChildUnderOne: raw.pregnantOrChildUnderOne ?? false,
    pregnantOrChildUnderOneDoc: raw.pregnantOrChildUnderOneDoc ?? "",
    retiringWithinTwoYears: raw.retiringWithinTwoYears ?? false,
    retiringWithinTwoYearsDoc: raw.retiringWithinTwoYearsDoc ?? "",
    childSpouseDisability: raw.childSpouseDisability ?? false,
    childSpouseDisabilityDoc: raw.childSpouseDisabilityDoc ?? "",
    divorceeWidowWithChild: raw.divorceeWidowWithChild ?? false,
    divorceeWidowWithChildDoc: raw.divorceeWidowWithChildDoc ?? "",
    spouseGovtServant: raw.spouseGovtServant ?? false,
    spouseGovtServantDoc: raw.spouseGovtServantDoc ?? "",
    spouseDesignation: raw.spouseDesignation ?? "",
    spouseDistrict: raw.spouseDistrict ?? "",
    spouseTaluk: raw.spouseTaluk ?? "",
    spouseCityTownVillage: raw.spouseCityTownVillage ?? "",
    ngoBenefits: raw.ngoBenefits ?? false,
    ngoBenefitsDoc: raw.ngoBenefitsDoc ?? "",
    timeboundApplicable: raw.timeboundApplicable ?? false,
    timeboundCategory: raw.timeboundCategory ?? "",
    timeboundYears: raw.timeboundYears ?? "",
    timeboundDoc: raw.timeboundDoc ?? "",
    timeboundDate: raw.timeboundDate ?? "",
    promotionRejected: raw.promotionRejected ?? false,
    promotionRejectedDate: raw.promotionRejectedDate ?? "",
    promotionRejectedDesignation: raw.promotionRejectedDesignation ?? "",
    pgBond: raw.pgBond ?? false,
    pgBondDoc: raw.pgBondDoc ?? "",
    pgBondCompletionDate: raw.pgBondCompletionDate ?? "",
    recruitmentType: raw.recruitmentType ?? "",
    contractRegularised: raw.contractRegularised ?? false,
    contractRegularisedDoc: raw.contractRegularisedDoc ?? "",
    contractRegularisedDate: raw.contractRegularisedDate ?? "",
    contractJoiningDate: raw.contractJoiningDate ?? "",
    timebound6Years: raw.timebound6Years ?? false,
    timebound6YearsDoc: raw.timebound6YearsDoc ?? "",
    timebound6YearsDate: raw.timebound6YearsDate ?? "",
    timebound13Years: raw.timebound13Years ?? false,
    timebound13YearsDoc: raw.timebound13YearsDoc ?? "",
    timebound13YearsDate: raw.timebound13YearsDate ?? "",
    timebound20Years: raw.timebound20Years ?? false,
    timebound20YearsDoc: raw.timebound20YearsDoc ?? "",
    timebound20YearsDate: raw.timebound20YearsDate ?? "",
    timebound10Years: raw.timebound10Years ?? false,
    timebound10YearsDoc: raw.timebound10YearsDoc ?? "",
    timebound10YearsDate: raw.timebound10YearsDate ?? "",
    timebound15Years: raw.timebound15Years ?? false,
    timebound15YearsDoc: raw.timebound15YearsDoc ?? "",
    timebound15YearsDate: raw.timebound15YearsDate ?? "",
    currentServiceDoc: raw.currentServiceDoc ?? "",
    pastServiceDocs: raw.pastServiceDocs ?? [],
    empDeclAgreed: raw.empDeclAgreed ?? false,
    empDeclName: raw.empDeclName ?? "",
    empDeclDate: raw.empDeclDate ?? "",
    officerDeclAgreed: raw.officerDeclAgreed ?? false,
    officerDeclName: raw.officerDeclName ?? "",
    officerDeclDate: raw.officerDeclDate ?? "",
    createdAt: raw.createdAt,
  };
}

// Get single new-format employee by ID
export const getNewEmployeeById = async (id: string): Promise<NewEmployee> => {
  const raw = await apiClient<any>(`/employees/${id}`);
  return mapBackendToNewEmployee(raw);
};

// Delete employee by ID (Admin only)
export const deleteEmployeeById = async (id: string): Promise<void> => {
  await apiClient<void>(`/employees/${id}`, { method: "DELETE" });
};

// Get all new-format employees (paginates through all pages)
export const getNewEmployees = async (params?: {
  category?: string;
  query?: string;
}): Promise<NewEmployee[]> => {
  const allEmployees: NewEmployee[] = [];
  let page = 1;
  const limit = 100; // API max per page

  while (true) {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("limit", String(limit));
    if (params?.category) searchParams.set("category", params.category);
    if (params?.query) searchParams.set("query", params.query);
    const qs = searchParams.toString();
    const res = await apiClient<any>(`/employees?${qs}`);
    const arr = res.data || (Array.isArray(res) ? res : []);
    const mapped = arr.map(mapBackendToNewEmployee);
    allEmployees.push(...mapped);

    // If we got fewer than limit, we've reached the last page
    if (mapped.length < limit) break;
    page++;
  }

  return allEmployees;
};

// Paginated employee fetch (single page, no loop)
export interface PaginatedEmployeesResult {
  employees: NewEmployee[];
  total: number;
  page: number;
  totalPages: number;
}

export const fetchEmployeesPaginated = async (
  params: { page?: number; pageSize?: number; search?: string },
  signal?: AbortSignal
): Promise<PaginatedEmployeesResult> => {
  const { page = 1, pageSize = 20, search = "" } = params;
  console.log(`[fetchEmployeesPaginated] START page=${page} pageSize=${pageSize} search="${search}"`);

  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(pageSize),
  });
  if (search.trim()) searchParams.set("query", search.trim());

  const res = await fetch(`${API_BASE_URL}/employees?${searchParams}`, {
    headers,
    cache: "no-store",
    signal,
  });

  if (res.status === 401 || res.status === 403) {
    removeToken();
    removeUser();
    window.location.href = "/login";
    throw new Error("Session expired");
  }
  if (!res.ok) throw new Error(`API Error: ${res.status}`);

  const data = await res.json();
  const arr = data.data || (Array.isArray(data) ? data : []);
  const mapped = arr.map(mapBackendToNewEmployee);

  console.log(`[fetchEmployeesPaginated] END got ${mapped.length} employees, total=${data.total ?? mapped.length}`);

  return {
    employees: mapped,
    total: data.total ?? mapped.length,
    page: data.page ?? page,
    totalPages: data.totalPages ?? Math.ceil((data.total ?? mapped.length) / pageSize),
  };
};

// Download CSV export
export const downloadEmployeesCSVExport = async (): Promise<void> => {
  return downloadFile("/employees/export", "employees.csv");
};

// Search suggestions (with optional category)
export const getSearchSuggestions = async (
  searchMode: "name" | "kgid",
  query: string,
  category?: string
): Promise<Employee[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await getEmployees({ searchMode, query, limit: 10, category });
    return response.employees;
  } catch {
    return [];
  }
};
