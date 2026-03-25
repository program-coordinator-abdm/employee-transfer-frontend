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
export async function uploadDocument(
  file: File,
  fieldName: string
): Promise<UploadResult> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  console.log(`[FileUpload] Uploading document for field "${fieldName}": ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

  const formData = new FormData();
  formData.append("file", file);

  // Do NOT set Content-Type manually — browser sets multipart/form-data with boundary
  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMsg = `Upload failed (${response.status})`;
    try {
      const errBody = await response.json();
      if (errBody?.message) errorMsg = errBody.message;
      else if (errBody?.error) errorMsg = errBody.error;
    } catch {}
    console.error(`[FileUpload] Upload failed for "${fieldName}":`, errorMsg);
    throw new Error(errorMsg);
  }

  const result = await response.json();
  console.log(`[FileUpload] Upload success for "${fieldName}":`, result);

  return {
    url: result.url || result.fileUrl || result.downloadUrl || "",
    key: result.key || result.fileKey || result.s3Key || result.path || "",
    fileName: result.fileName || result.originalName || file.name,
  };
}
