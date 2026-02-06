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

interface BackendEmployee {
  id: string;
  empName: string;
  empKgid: string;
  role: string;
  yearsOfWork: number;
  dob: string;
  currentCity: string;
  currentPosition: string;
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


import { API_BASE_URL, MOCK_EMPLOYEES, Employee, CATEGORY_ROLE_MAP } from "./constants";

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
    // If API is not running, we'll fall back to mock data
    console.warn("API not available, using mock data:", error);
    throw error;
  }
};

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

  try {
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

    const employees: Employee[] = res.data.map((e): Employee => ({
      id: e.id,
      name: e.empName,
      kgid: e.empKgid,
      role: e.role,
      yearsOfWork: e.yearsOfWork,
      dob: e.dob,
      currentCity: e.currentCity,
      currentPosition: e.currentPosition,
      currentHospitalName: "",
      dateOfJoining: "",
      workHistory: [],
      email: e.email,
      phone: e.phone,
    }));

    return {
      employees,
      total: res.total,
      page: res.page,
      limit: res.limit,
      totalPages: res.totalPages,
    };
  } catch {
    // Fallback to mock data when API is unavailable
    let filteredEmployees = [...MOCK_EMPLOYEES];
    
    // Filter by category first (based on role mapping)
    if (category) {
      const categoryRoles = CATEGORY_ROLE_MAP[category] || [];
      filteredEmployees = filteredEmployees.filter((emp) =>
        categoryRoles.includes(emp.role)
      );
    }
    
    // Then apply search filter
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredEmployees = filteredEmployees.filter((emp) =>
        searchMode === "name"
          ? emp.name.toLowerCase().includes(lowerQuery)
          : emp.kgid.toLowerCase().includes(lowerQuery)
      );
    }

    const total = filteredEmployees.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + limit);

    return {
      employees: paginatedEmployees,
      total,
      page,
      limit,
      totalPages,
    };
  }
};

export const getEmployee = async (id: string): Promise<Employee> => {
  try {
    const res = await apiClient<BackendEmployee>(`/employees/${id}`);

    return {
      id: res.id,
      name: res.empName,
      kgid: res.empKgid,
      role: res.role,
      yearsOfWork: res.yearsOfWork,
      dob: res.dob,
      currentCity: res.currentCity,
      currentPosition: res.currentPosition,
      currentHospitalName: "",
      dateOfJoining: "",
      workHistory: [],
      email: res.email,
      phone: res.phone,
    };
  } catch {
    // Fallback to mock data when API is unavailable
    const employee = MOCK_EMPLOYEES.find((emp) => emp.id === id);
    if (!employee) {
      throw new Error("Employee not found");
    }
    return employee;
  }
};

export const transferEmployee = async (
  id: string,
  transfer: TransferRequest
): Promise<Employee> => {
  try {
    const res = await apiClient<BackendEmployee>(
      `/employees/${id}/transfers`,
      {
        method: "POST",
        body: JSON.stringify(transfer),
      }
    );

    return {
      id: res.id,
      name: res.empName,
      kgid: res.empKgid,
      role: res.role,
      yearsOfWork: res.yearsOfWork,
      dob: res.dob,
      currentCity: res.currentCity,
      currentPosition: res.currentPosition,
      currentHospitalName: "",
      dateOfJoining: "",
      workHistory: [],
      email: res.email,
      phone: res.phone,
    };
  } catch {
    // Fallback: simulate transfer locally when API is unavailable
    const employee = MOCK_EMPLOYEES.find((emp) => emp.id === id);
    if (!employee) {
      throw new Error("Employee not found");
    }
    
    // Calculate duration for the current position (ending now)
    const currentEntryIndex = employee.workHistory.findIndex(
      (entry) => entry.toDate === "Present"
    );
    
    const updatedWorkHistory = [...employee.workHistory];
    
    if (currentEntryIndex !== -1) {
      // Update the current entry's end date
      const currentEntry = updatedWorkHistory[currentEntryIndex];
      const fromDate = new Date(currentEntry.fromDate);
      const toDate = new Date(transfer.effectiveFrom);
      const durationYears = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
      
      updatedWorkHistory[currentEntryIndex] = {
        ...currentEntry,
        toDate: transfer.effectiveFrom.split("T")[0],
        durationYears,
      };
    }
    
    // Add new entry for the transfer
    const newEntry = {
      city: transfer.toCity,
      hospitalName: transfer.toHospitalName || `${transfer.toCity} District Hospital`,
      position: transfer.toPosition,
      fromDate: transfer.effectiveFrom.split("T")[0],
      toDate: "Present",
      durationYears: 0, // Will accumulate over time
    };
    
    updatedWorkHistory.push(newEntry);
    
    // Update the mock employee data in memory
    const employeeIndex = MOCK_EMPLOYEES.findIndex((emp) => emp.id === id);
    if (employeeIndex !== -1) {
      MOCK_EMPLOYEES[employeeIndex] = {
        ...employee,
        currentCity: transfer.toCity,
        currentPosition: transfer.toPosition,
        currentHospitalName: newEntry.hospitalName,
        workHistory: updatedWorkHistory,
      };
    }
    
    // Return updated employee with new city/position
    return {
      ...employee,
      currentCity: transfer.toCity,
      currentPosition: transfer.toPosition,
      currentHospitalName: newEntry.hospitalName,
      workHistory: updatedWorkHistory,
    };
  }
};

// Export functions (just return URLs for now)
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

// Search suggestions
export const getSearchSuggestions = async (
  searchMode: "name" | "kgid",
  query: string
): Promise<Employee[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await getEmployees({ searchMode, query, limit: 10 });
    return response.employees;
  } catch {
    return [];
  }
};
