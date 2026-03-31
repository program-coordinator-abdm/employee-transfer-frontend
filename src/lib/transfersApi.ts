import { API_BASE_URL } from "./constants";
import { getToken, removeToken, removeUser } from "./api";

// New flat transfer record structure
export interface SpecialCategoryPayload {
  selected: boolean[];
  documents: string[];
}

export interface TransferFormData {
  slNo: string;
  categorySlNo: string;
  currentDistrict: string;
  kgid: string;
  employeeName: string;
  dateOfBirth: string;
  dateOfEntryIntoService: string;
  presentPlaceOfWorking: string;
  gbaYears: string;
  gbaMarks: string;
  aYears: string;
  aMarks: string;
  bYears: string;
  bMarks: string;
  cYears: string;
  cMarks: string;
  totalYears: string;
  totalMarks: string;
  categoryName: string;
  remarks: string;
  designation: string;
  specialization: string;
  specialCategories: SpecialCategoryPayload;
}

export interface TransferRecord {
  id: string;
  status: "draft" | "submitted";
  createdAt: string;
  formData: TransferFormData;
  // Convenience top-level fields from backend
  kgid?: string;
  employeeName?: string;
  designation?: string;
  currentDistrict?: string;
  categoryName?: string;
}

export interface TransfersListResponse {
  data: TransferRecord[];
  total: number;
}

export const EMPTY_TRANSFER_FORM = (): TransferFormData => ({
  slNo: "",
  categorySlNo: "",
  currentDistrict: "",
  kgid: "",
  employeeName: "",
  dateOfBirth: "",
  dateOfEntryIntoService: "",
  presentPlaceOfWorking: "",
  gbaYears: "",
  gbaMarks: "",
  aYears: "",
  aMarks: "",
  bYears: "",
  bMarks: "",
  cYears: "",
  cMarks: "",
  totalYears: "",
  totalMarks: "",
  categoryName: "",
  remarks: "",
  designation: "",
  specialization: "",
});

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
