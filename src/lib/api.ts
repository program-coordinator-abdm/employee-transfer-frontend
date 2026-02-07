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
  assignmentHistory?: BackendAssignmentEntry[];
  category?: string;
  email?: string;
  phone?: string;
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
    workHistory,
    email: e.email,
    phone: e.phone,
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
