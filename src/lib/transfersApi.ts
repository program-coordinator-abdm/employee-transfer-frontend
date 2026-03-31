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
  remarks: string;
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

const UPLOAD_FRIENDLY_MESSAGES: Record<number, string> = {
  413: "File is too large. Maximum allowed size is 5 MB.",
  415: "Unsupported file format. Please upload PDF, DOC, DOCX, JPG, or JPEG.",
  401: "Session expired. Please log in again.",
  403: "You do not have permission to upload files.",
};

const UPLOAD_NETWORK_ERROR = "Unable to upload document. Please check your internet connection or try again.";
const UPLOAD_FALLBACK = "Document upload failed. Please try again.";

export const uploadTransferDocument = async (file: File, fieldName?: string): Promise<{ url: string; fileName: string }> => {
  const token = getToken();
  if (!token) throw new Error("Session expired. Please log in again.");

  console.log("[TransferUpload] start", { field: fieldName, name: file.name, size: file.size, type: file.type });

  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/transfers/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch (networkErr) {
    console.log("[TransferUpload] network error", networkErr);
    throw new Error(UPLOAD_NETWORK_ERROR);
  }

  console.log("[TransferUpload] response status", response.status);

  if (!response.ok) {
    let errorMsg = UPLOAD_FRIENDLY_MESSAGES[response.status] || UPLOAD_FALLBACK;
    try {
      const parsed = await response.json();
      console.log("[TransferUpload] error body", parsed);
      if (parsed?.message) errorMsg = parsed.message;
      else if (parsed?.error) errorMsg = parsed.error;
    } catch {
      // not JSON, use friendly mapped message
    }
    throw new Error(errorMsg);
  }

  const result = await response.json();
  console.log("[TransferUpload] success", result);

  return {
    url: result.url || result.fileUrl || result.downloadUrl || "",
    fileName: result.fileName || result.originalName || file.name,
  };
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
  remarks: "",
});
