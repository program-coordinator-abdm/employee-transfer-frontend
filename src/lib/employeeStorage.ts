// localStorage-based employee storage

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
  id: string;
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
  createdAt: string;
}

const STORAGE_KEY = "new_employees";

export function getEmployees(): NewEmployee[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveEmployee(emp: NewEmployee): void {
  const list = getEmployees();
  list.push(emp);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getEmployeeById(id: string): NewEmployee | undefined {
  return getEmployees().find((e) => e.id === id);
}
