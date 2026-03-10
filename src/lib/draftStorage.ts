/**
 * localStorage-based draft storage for Employee forms.
 * Drafts are scoped per username and cleared on logout.
 */

export interface EmployeeDraft {
  draftId: string;
  username: string;
  updatedAt: string;
  name: string;
  kgid: string;
  formData: Record<string, any>;
}

const STORAGE_KEY = "etms_employee_drafts";

function getAllDrafts(): EmployeeDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAllDrafts(drafts: EmployeeDraft[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function getDraftsForUser(username: string): EmployeeDraft[] {
  return getAllDrafts().filter(d => d.username === username);
}

export function saveDraft(username: string, formData: Record<string, any>, existingDraftId?: string): string {
  const drafts = getAllDrafts();
  const draftId = existingDraftId || `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const name = (formData.name as string) || "";
  const kgid = (formData.kgid as string) || "";

  const idx = drafts.findIndex(d => d.draftId === draftId);
  const draft: EmployeeDraft = { draftId, username, updatedAt: new Date().toISOString(), name, kgid, formData };

  if (idx >= 0) {
    drafts[idx] = draft;
  } else {
    drafts.push(draft);
  }
  saveAllDrafts(drafts);
  return draftId;
}

export function deleteDraft(draftId: string) {
  saveAllDrafts(getAllDrafts().filter(d => d.draftId !== draftId));
}

export function clearDraftsForUser(username: string) {
  saveAllDrafts(getAllDrafts().filter(d => d.username !== username));
}
