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

  console.log("[FileUpload] start", { field: fieldName, name: file.name, size: file.size, type: file.type });

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  console.log("[FileUpload] response status", response.status);

  if (!response.ok) {
    let parsedError: any = null;
    let errorMsg = `File upload failed: server returned ${response.status}`;
    try {
      parsedError = await response.json();
      if (parsedError?.message) errorMsg = `File upload failed: ${parsedError.message}`;
      else if (parsedError?.error) errorMsg = `File upload failed: ${parsedError.error}`;
    } catch {
      // response wasn't JSON — keep generic message
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
