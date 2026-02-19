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
  return localStorage.getItem("jwt_token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("jwt_token", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("jwt_token");
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

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.warn("API not available, using mock data:", error);
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
  phone?: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
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
  } catch {
    // Fallback to mock login when API is unavailable
    const email = credentials.email || "";
    const username = credentials.username || "";
    const password = credentials.password;
    
    if (email === "admin@karnataka.gov.in" && password === "Admin@123") {
      return {
        token: "mock-jwt-token-" + Date.now(),
        user: {
          id: "1",
          username: "admin",
          email: email,
          name: "Administrator",
        },
      };
    }

    if (username === "dataofficer" && password === "Data@1234") {
      return {
        token: "mock-jwt-token-" + Date.now(),
        user: {
          id: "2",
          username: username,
          email: "dataofficer@karnataka.gov.in",
          name: "Data Officer",
        },
      };
    }
    
    throw new Error("Invalid credentials");
  }
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
  institution: string;
  district: string;
  taluk: string;
  cityTownVillage: string;
  fromDate: string;
  toDate: string;
  tenure: string;
}

export interface NewEmployee {
  id?: string;
  kgid: string;
  name: string;
  designation: string;
  designationGroup: string;
  designationSubGroup: string;
  dateOfEntry: string;
  gender: string;
  probationaryPeriod: boolean;
  probationaryPeriodDoc: string;
  dateOfBirth: string;
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
  currentInstitution: string;
  currentDistrict: string;
  currentTaluk: string;
  currentCityTownVillage: string;
  currentWorkingSince: string;
  pastServices: PastServiceEntry[];
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
  ngoBenefits: boolean;
  ngoBenefitsDoc: string;
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
    dateOfEntry: payload.dateOfEntry,
    dateOfJoining: payload.dateOfEntry,
    dob: payload.dateOfBirth,
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
    currentInstitution: payload.currentInstitution,
    currentDistrict: payload.currentDistrict,
    currentTaluk: payload.currentTaluk,
    currentCityTownVillage: payload.currentCityTownVillage,
    currentWorkingSince: payload.currentWorkingSince,
    probationaryPeriod: payload.probationaryPeriod,
    probationaryPeriodDoc: payload.probationaryPeriodDoc,
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
    ngoBenefits: payload.ngoBenefits,
    ngoBenefitsDoc: payload.ngoBenefitsDoc,
    empDeclAgreed: payload.empDeclAgreed,
    empDeclName: payload.empDeclName,
    empDeclDate: payload.empDeclDate,
    officerDeclAgreed: payload.officerDeclAgreed,
    officerDeclName: payload.officerDeclName,
    officerDeclDate: payload.officerDeclDate,
    pastServices: payload.pastServices,
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
    dateOfEntry: payload.dateOfEntry,
    dateOfJoining: payload.dateOfEntry,
    dob: payload.dateOfBirth,
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
    currentInstitution: payload.currentInstitution,
    currentDistrict: payload.currentDistrict,
    currentTaluk: payload.currentTaluk,
    currentCityTownVillage: payload.currentCityTownVillage,
    currentWorkingSince: payload.currentWorkingSince,
    probationaryPeriod: payload.probationaryPeriod,
    probationaryPeriodDoc: payload.probationaryPeriodDoc,
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
    ngoBenefits: payload.ngoBenefits,
    ngoBenefitsDoc: payload.ngoBenefitsDoc,
    empDeclAgreed: payload.empDeclAgreed,
    empDeclName: payload.empDeclName,
    empDeclDate: payload.empDeclDate,
    officerDeclAgreed: payload.officerDeclAgreed,
    officerDeclName: payload.officerDeclName,
    officerDeclDate: payload.officerDeclDate,
    pastServices: payload.pastServices,
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
    dateOfEntry: raw.dateOfEntry ?? "",
    dateOfBirth: raw.dob ?? raw.dateOfBirth ?? "",
    gender: raw.gender ?? "",
    probationaryPeriod: raw.probationaryPeriod ?? false,
    probationaryPeriodDoc: raw.probationaryPeriodDoc ?? "",
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
    currentInstitution: raw.currentInstitution ?? "",
    currentDistrict: raw.currentDistrict ?? "",
    currentTaluk: raw.currentTaluk ?? "",
    currentCityTownVillage: raw.currentCityTownVillage ?? "",
    currentWorkingSince: raw.currentWorkingSince ?? "",
    pastServices: raw.pastServices ?? [],
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
    ngoBenefits: raw.ngoBenefits ?? false,
    ngoBenefitsDoc: raw.ngoBenefitsDoc ?? "",
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

// Get all new-format employees
export const getNewEmployees = async (params?: {
  category?: string;
  query?: string;
}): Promise<NewEmployee[]> => {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.query) searchParams.set("query", params.query);
  const qs = searchParams.toString();
  const res = await apiClient<any>(`/employees${qs ? `?${qs}` : ""}`);
  const arr = res.data || (Array.isArray(res) ? res : []);
  return arr.map(mapBackendToNewEmployee);
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
