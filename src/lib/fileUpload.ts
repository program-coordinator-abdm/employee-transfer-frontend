import { API_BASE_URL } from "./constants";
import { getToken } from "./api";

export interface UploadResult {
  url: string;
  key: string;
  fileName: string;
}

/**
 * Upload a document file to the backend as multipart/form-data.
 * Returns the uploaded file reference (url/key) to store in form state.
 */
const FRIENDLY_MESSAGES: Record<number, string> = {
  413: "File is too large. Maximum allowed size is 5 MB.",
  415: "Unsupported file format. Please upload PDF, DOC, DOCX, JPG, or JPEG.",
  401: "Session expired. Please log in again.",
  403: "You do not have permission to upload files.",
};

const NETWORK_ERROR_MSG =
  "Unable to upload document. Please check your internet connection or try again.";
const FALLBACK_MSG = "Document upload failed. Please try again.";

export async function uploadDocument(
  file: File,
  fieldName: string
): Promise<UploadResult> {
  const token = getToken();
  if (!token) throw new Error("Session expired. Please log in again.");

  console.log("[FileUpload] start", { field: fieldName, name: file.name, size: file.size, type: file.type });

  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch (networkErr) {
    console.log("[FileUpload] network error", networkErr);
    throw new Error(NETWORK_ERROR_MSG);
  }

  console.log("[FileUpload] response status", response.status);

  if (!response.ok) {
    let parsedError: any = null;
    let errorMsg = FRIENDLY_MESSAGES[response.status] || FALLBACK_MSG;
    try {
      parsedError = await response.json();
      if (parsedError?.message) errorMsg = parsedError.message;
      else if (parsedError?.error) errorMsg = parsedError.error;
    } catch {
      // response wasn't JSON — use friendly mapped message
    }
    console.log("[FileUpload] response body (error)", parsedError);
    throw new Error(errorMsg);
  }

  const result = await response.json();
  console.log("[FileUpload] response body (success)", result);

  return {
    url: result.url || result.fileUrl || result.downloadUrl || "",
    key: result.key || result.fileKey || result.s3Key || result.path || "",
    fileName: result.fileName || result.originalName || file.name,
  };
}
