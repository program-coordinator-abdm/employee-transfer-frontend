import { API_BASE_URL } from "./constants";
import { getToken, removeToken, removeUser } from "./api";

// Types
export interface TransferWorkDetail {
  postHeld: string;
  speciality: string;
  instituteName: string;
  district: string;
  taluka: string;
  cityVillageTown: string;
  zone: string;
  workingSince: string;
}

export interface TransferFormData {
  // Section 1: Personal Details
  kgidNumber: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  pinCode: string;
  mailId: string;
  mobileNumber: string;
  residenceNumber: string;
  // Section 2: Current Service Details
  group: string;
  role: string;
  designation: string;
  specialization: string;
  dateOfEntryIntoService: string;
  probationaryPeriodDeclared: string;
  // Section 3: Past Service Details
  workDetails: TransferWorkDetail[];
  // Section 4: Special Conditions
  terminallyIll: boolean;
  terminallyIllDoc: string;
  physicallyChallenged: boolean;
  physicallyChallengedDoc: string;
  widow: boolean;
  widowDoc: string;
  spouseInGovtService: boolean;
  spouseInGovtServiceDoc: string;
  // Section 5: Elected Members
  ngoBenefits: boolean;
  ngoBenefitsDoc: string;
}

export interface TransferRecord {
  id: string;
  kgidNumber: string;
  name: string;
  group: string;
  designation: string;
  status: "draft" | "submitted";
  createdAt: string;
  formData: TransferFormData;
}

export interface TransfersListResponse {
  data: TransferRecord[];
  total: number;
}

const transferApiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    ...(!(options.body instanceof FormData) && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

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
    let message = `API Error: ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody?.message) message = errBody.message;
      else if (errBody?.error) message = errBody.error;
    } catch {}
    throw new Error(message);
  }

  return response.json();
};

export const getTransfers = async (): Promise<TransferRecord[]> => {
  const res = await transferApiClient<TransfersListResponse>("/transfers");
  return res.data;
};

export const getTransferById = async (id: string): Promise<TransferRecord> => {
  return transferApiClient<TransferRecord>(`/transfers/${id}`);
};

export const createTransferDraft = async (data: TransferFormData): Promise<TransferRecord> => {
  return transferApiClient<TransferRecord>("/transfers", {
    method: "POST",
    body: JSON.stringify({ ...data, status: "draft" }),
  });
};

export const updateTransfer = async (id: string, data: TransferFormData): Promise<TransferRecord> => {
  return transferApiClient<TransferRecord>(`/transfers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const submitTransferFinal = async (id: string): Promise<TransferRecord> => {
  return transferApiClient<TransferRecord>(`/transfers/${id}/submit`, {
    method: "POST",
  });
};

export const uploadTransferDocument = async (file: File): Promise<{ url: string; fileName: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  return transferApiClient<{ url: string; fileName: string }>("/transfers/upload", {
    method: "POST",
    body: formData,
  });
};

export const EMPTY_WORK_DETAIL: () => TransferWorkDetail = () => ({
  postHeld: "",
  speciality: "",
  instituteName: "",
  district: "",
  taluka: "",
  cityVillageTown: "",
  zone: "",
  workingSince: "",
});

export const EMPTY_TRANSFER_FORM: () => TransferFormData = () => ({
  kgidNumber: "",
  name: "",
  gender: "",
  dateOfBirth: "",
  address: "",
  pinCode: "",
  mailId: "",
  mobileNumber: "",
  residenceNumber: "",
  group: "",
  role: "",
  designation: "",
  specialization: "",
  dateOfEntryIntoService: "",
  probationaryPeriodDeclared: "",
  workDetails: [EMPTY_WORK_DETAIL()],
  terminallyIll: false,
  terminallyIllDoc: "",
  physicallyChallenged: false,
  physicallyChallengedDoc: "",
  widow: false,
  widowDoc: "",
  spouseInGovtService: false,
  spouseInGovtServiceDoc: "",
  ngoBenefits: false,
  ngoBenefitsDoc: "",
});
