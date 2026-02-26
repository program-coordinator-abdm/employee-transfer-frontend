import React, { useState, useRef, useEffect } from "react";
import FileUploadField from "@/components/FileUploadField";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Upload, Download, Printer, CheckCircle2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FormPreview, { type FormPreviewData } from "@/components/FormPreview";
import Header from "@/components/Header";
import PositionDropdown from "@/components/PositionDropdown";
import DatePickerField, { calculateTenure } from "@/components/DatePickerField";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { KARNATAKA_DISTRICTS, type PositionInfo } from "@/lib/positions";
import { getTaluks, getCities } from "@/lib/karnatakaGeo";
import { createEmployee, updateEmployeeById, getNewEmployeeById, getNewEmployees, type NewEmployee, type PastServiceEntry, type EducationFormEntry } from "@/lib/api";
import Toast, { useToastState } from "@/components/Toast";
import { FIRST_POST_HELD_OPTIONS } from "@/lib/firstPostHeld";

interface FormErrors {
  [key: string]: string;
}

const EMPTY_PAST_SERVICE: () => PastServiceEntry = () => ({
  postHeld: "", postGroup: "", postSubGroup: "", firstPostHeld: "",
  institution: "", district: "", taluk: "", cityTownVillage: "",
  fromDate: "", toDate: "", tenure: "",
});

const EMPTY_EDUCATION: () => EducationFormEntry = () => ({
  level: "", institution: "", yearOfPassing: "", gradePercentage: "", documentProof: "",
});

const EDUCATION_LEVELS = ["10th/SSLC", "PU/12th", "Diploma (IT/Medical/Pharmacy/Paramedical)", "Bachelor's degree (UG)", "Master's degree (PG)", "Paramedical", "PhD", "Others"];

const EmployeeCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEditMode = !!editId;
  const { toast, showToast, hideToast } = useToastState();
  const [errors, setErrors] = useState<FormErrors>({});
  // formStep: "fill" → "preview" → "declare"
  const [formStep, setFormStep] = useState<"fill" | "preview" | "declare" | "submitted">("fill");
  const [submittedEmp, setSubmittedEmp] = useState<NewEmployee | null>(null);
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  // Basic fields
  const [kgid, setKgid] = useState("");
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [designationGroup, setDesignationGroup] = useState("");
  const [designationSubGroup, setDesignationSubGroup] = useState("");
  const [firstPostHeld, setFirstPostHeld] = useState("");
  const [dateOfEntry, setDateOfEntry] = useState<Date>();
  const [gender, setGender] = useState("");
  const [probationaryPeriod, setProbationaryPeriod] = useState(false);
  const [probationaryPeriodDoc, setProbationaryPeriodDoc] = useState("");
  const [probationDeclarationDate, setProbationDeclarationDate] = useState<Date>();
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [cltCompleted, setCltCompleted] = useState(false);
  const [cltCompletedDoc, setCltCompletedDoc] = useState("");
  const [isDoctorNursePharmacist, setIsDoctorNursePharmacist] = useState(false);
  const [hprId, setHprId] = useState("");
  const [hfrId, setHfrId] = useState("");

  // Personal Address
  const [address, setAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [telephoneNumber, setTelephoneNumber] = useState("");

  // Office Address
  const [officeAddress, setOfficeAddress] = useState("");
  const [officePinCode, setOfficePinCode] = useState("");
  const [officeEmail, setOfficeEmail] = useState("");
  const [officePhoneNumber, setOfficePhoneNumber] = useState("");
  const [officeTelephoneNumber, setOfficeTelephoneNumber] = useState("");

  // Current working
  const [currentPostHeld, setCurrentPostHeld] = useState("");
  const [currentPostGroup, setCurrentPostGroup] = useState("");
  const [currentFirstPostHeld, setCurrentFirstPostHeld] = useState("");
  const [currentPostSubGroup, setCurrentPostSubGroup] = useState("");
  const [currentInstitution, setCurrentInstitution] = useState("");
  const [currentDistrict, setCurrentDistrict] = useState("");
  const [currentTaluk, setCurrentTaluk] = useState("");
  const [currentCityTownVillage, setCurrentCityTownVillage] = useState("");
  const [currentVillageOtherMode, setCurrentVillageOtherMode] = useState(false);
  const [pastVillageOtherModes, setPastVillageOtherModes] = useState<boolean[]>([false]);
  const [currentWorkingSince, setCurrentWorkingSince] = useState<Date>();
  const [currentZone, setCurrentZone] = useState("");
  const [currentAreaType, setCurrentAreaType] = useState("");

  // Spouse working details
  const [spouseDesignation, setSpouseDesignation] = useState("");
  const [spouseDistrict, setSpouseDistrict] = useState("");
  const [spouseTaluk, setSpouseTaluk] = useState("");
  const [spouseCityTownVillage, setSpouseCityTownVillage] = useState("");
  const [spouseVillageOtherMode, setSpouseVillageOtherMode] = useState(false);

  // Past services
  const [pastServices, setPastServices] = useState<PastServiceEntry[]>([EMPTY_PAST_SERVICE()]);
  const [pastFromDates, setPastFromDates] = useState<(Date | undefined)[]>([undefined]);
  const [pastToDates, setPastToDates] = useState<(Date | undefined)[]>([undefined]);
  const [pastZones, setPastZones] = useState<string[]>([""]);

  // Conditional fields
  const [terminallyIll, setTerminallyIll] = useState(false);
  const [terminallyIllDoc, setTerminallyIllDoc] = useState("");
  const [pregnantOrChildUnderOne, setPregnantOrChildUnderOne] = useState(false);
  const [pregnantOrChildUnderOneDoc, setPregnantOrChildUnderOneDoc] = useState("");
  const [retiringWithinTwoYears, setRetiringWithinTwoYears] = useState(false);
  const [retiringWithinTwoYearsDoc, setRetiringWithinTwoYearsDoc] = useState("");
  const [childSpouseDisability, setChildSpouseDisability] = useState(false);
  const [childSpouseDisabilityDoc, setChildSpouseDisabilityDoc] = useState("");
  const [divorceeWidowWithChild, setDivorceeWidowWithChild] = useState(false);
  const [divorceeWidowWithChildDoc, setDivorceeWidowWithChildDoc] = useState("");
  const [spouseGovtServant, setSpouseGovtServant] = useState(false);
  const [spouseGovtServantDoc, setSpouseGovtServantDoc] = useState("");

  // Timebound
  const [timeboundApplicable, setTimeboundApplicable] = useState(false);
  const [timeboundCategory, setTimeboundCategory] = useState("");
  const [timeboundYears, setTimeboundYears] = useState("");
  const [timeboundDoc, setTimeboundDoc] = useState("");
  const [timeboundDate, setTimeboundDate] = useState<Date>();

  // NGO Benefits
  const [ngoBenefits, setNgoBenefits] = useState(false);
  const [ngoBenefitsDoc, setNgoBenefitsDoc] = useState("");

  // Education Details
  const [educationDetails, setEducationDetails] = useState<EducationFormEntry[]>([EMPTY_EDUCATION()]);

  // Declaration
  const [empDeclAgreed, setEmpDeclAgreed] = useState(false);
  const [empDeclName, setEmpDeclName] = useState("");
  const [empDeclDate, setEmpDeclDate] = useState<Date>();
  const [officerDeclAgreed, setOfficerDeclAgreed] = useState(false);
  const [officerDeclName, setOfficerDeclName] = useState("");
  const [officerDeclDate, setOfficerDeclDate] = useState<Date>();

  // Load existing employee data in edit mode
  useEffect(() => {
    if (!editId) return;
    getNewEmployeeById(editId).then((existing) => {
      setKgid(existing.kgid); setName(existing.name);
      setDesignation(existing.designation); setDesignationGroup(existing.designationGroup); setDesignationSubGroup(existing.designationSubGroup);
      setFirstPostHeld(existing.firstPostHeld || "");
      setDateOfEntry(new Date(existing.dateOfEntry)); setGender(existing.gender);
      setProbationaryPeriod(existing.probationaryPeriod); setProbationaryPeriodDoc(existing.probationaryPeriodDoc);
      if (existing.probationDeclarationDate) setProbationDeclarationDate(new Date(existing.probationDeclarationDate));
      setDateOfBirth(new Date(existing.dateOfBirth));
      if (existing.cltCompleted !== undefined) setCltCompleted(existing.cltCompleted);
      if (existing.cltCompletedDoc) setCltCompletedDoc(existing.cltCompletedDoc);
      if (existing.isDoctorNursePharmacist !== undefined) setIsDoctorNursePharmacist(existing.isDoctorNursePharmacist);
      if (existing.hprId) setHprId(existing.hprId);
      if (existing.hfrId) setHfrId(existing.hfrId);
      setAddress(existing.address); setPinCode(existing.pinCode); setEmail(existing.email);
      setPhoneNumber(existing.phoneNumber); setTelephoneNumber(existing.telephoneNumber);
      setOfficeAddress(existing.officeAddress); setOfficePinCode(existing.officePinCode);
      setOfficeEmail(existing.officeEmail); setOfficePhoneNumber(existing.officePhoneNumber);
      setOfficeTelephoneNumber(existing.officeTelephoneNumber);
      setCurrentPostHeld(existing.currentPostHeld); setCurrentPostGroup(existing.currentPostGroup);
      setCurrentPostSubGroup(existing.currentPostSubGroup); setCurrentFirstPostHeld(existing.currentFirstPostHeld || "");
      setCurrentInstitution(existing.currentInstitution);
      setCurrentDistrict(existing.currentDistrict); setCurrentTaluk(existing.currentTaluk);
      setCurrentCityTownVillage(existing.currentCityTownVillage);
      setCurrentWorkingSince(new Date(existing.currentWorkingSince));
      setPastServices(existing.pastServices);
      setPastFromDates(existing.pastServices.map(s => s.fromDate ? new Date(s.fromDate) : undefined));
      setPastToDates(existing.pastServices.map(s => s.toDate ? new Date(s.toDate) : undefined));
      setTerminallyIll(existing.terminallyIll); setTerminallyIllDoc(existing.terminallyIllDoc);
      setPregnantOrChildUnderOne(existing.pregnantOrChildUnderOne); setPregnantOrChildUnderOneDoc(existing.pregnantOrChildUnderOneDoc);
      setRetiringWithinTwoYears(existing.retiringWithinTwoYears); setRetiringWithinTwoYearsDoc(existing.retiringWithinTwoYearsDoc);
      setChildSpouseDisability(existing.childSpouseDisability); setChildSpouseDisabilityDoc(existing.childSpouseDisabilityDoc);
      setDivorceeWidowWithChild(existing.divorceeWidowWithChild); setDivorceeWidowWithChildDoc(existing.divorceeWidowWithChildDoc);
      setSpouseGovtServant(existing.spouseGovtServant); setSpouseGovtServantDoc(existing.spouseGovtServantDoc);
      if (existing.spouseDesignation) setSpouseDesignation(existing.spouseDesignation);
      if (existing.spouseDistrict) setSpouseDistrict(existing.spouseDistrict);
      if (existing.spouseTaluk) setSpouseTaluk(existing.spouseTaluk);
      if (existing.spouseCityTownVillage) setSpouseCityTownVillage(existing.spouseCityTownVillage);
      if (existing.currentAreaType) setCurrentAreaType(existing.currentAreaType);
      if (existing.timeboundApplicable !== undefined) setTimeboundApplicable(existing.timeboundApplicable);
      if (existing.timeboundCategory) setTimeboundCategory(existing.timeboundCategory);
      if (existing.timeboundYears) setTimeboundYears(existing.timeboundYears);
      if (existing.timeboundDoc) setTimeboundDoc(existing.timeboundDoc);
      if (existing.timeboundDate) setTimeboundDate(new Date(existing.timeboundDate));
      if (existing.ngoBenefits !== undefined) setNgoBenefits(existing.ngoBenefits);
      if (existing.ngoBenefitsDoc !== undefined) setNgoBenefitsDoc(existing.ngoBenefitsDoc);
      if (existing.educationDetails && existing.educationDetails.length > 0) setEducationDetails(existing.educationDetails);
      setEmpDeclAgreed(existing.empDeclAgreed); setEmpDeclName(existing.empDeclName);
      if (existing.empDeclDate) setEmpDeclDate(new Date(existing.empDeclDate));
      setOfficerDeclAgreed(existing.officerDeclAgreed); setOfficerDeclName(existing.officerDeclName);
      if (existing.officerDeclDate) setOfficerDeclDate(new Date(existing.officerDeclDate));
    }).catch(() => {
      showToast("Failed to load employee data", "error");
    });
  }, [editId]);

  // Fetch all employees for duplicate KGID check
  const [allKgids, setAllKgids] = useState<Set<string>>(new Set());
  const [kgidDuplicate, setKgidDuplicate] = useState(false);

  useEffect(() => {
    getNewEmployees().then((emps) => {
      const kgidSet = new Set(emps.map((e) => e.kgid.toLowerCase()));
      // In edit mode, remove the current employee's KGID so it doesn't flag itself
      if (editId) {
        getNewEmployeeById(editId).then((current) => {
          kgidSet.delete(current.kgid.toLowerCase());
          setAllKgids(kgidSet);
        }).catch(() => setAllKgids(kgidSet));
      } else {
        setAllKgids(kgidSet);
      }
    }).catch(() => {});
  }, [editId]);

  // Check for duplicate KGID on change
  useEffect(() => {
    if (kgid.trim().length > 0 && allKgids.has(kgid.trim().toLowerCase())) {
      setKgidDuplicate(true);
    } else {
      setKgidDuplicate(false);
    }
  }, [kgid, allKgids]);

  const clearError = (field: string) => {
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  const ZONE_OPTIONS = [
    { value: "GBA", label: "GBA Zone", points: 0.5 },
    { value: "A", label: "Zone A", points: 1 },
    { value: "B", label: "Zone B", points: 1.5 },
    { value: "C", label: "Zone C", points: 2 },
  ];

  const getZonePoints = (zone: string) => ZONE_OPTIONS.find(z => z.value === zone)?.points || 0;

  const totalZonePoints = React.useMemo(() => {
    let total = getZonePoints(currentZone);
    pastZones.forEach(z => { total += getZonePoints(z); });
    return total;
  }, [currentZone, pastZones]);

  const addPastService = () => {
    setPastServices([...pastServices, EMPTY_PAST_SERVICE()]);
    setPastFromDates([...pastFromDates, undefined]);
    setPastToDates([...pastToDates, undefined]);
    setPastZones([...pastZones, ""]);
    setPastVillageOtherModes([...pastVillageOtherModes, false]);
  };

  const removePastService = (idx: number) => {
    setPastServices(pastServices.filter((_, i) => i !== idx));
    setPastFromDates(pastFromDates.filter((_, i) => i !== idx));
    setPastToDates(pastToDates.filter((_, i) => i !== idx));
    setPastZones(pastZones.filter((_, i) => i !== idx));
    setPastVillageOtherModes(pastVillageOtherModes.filter((_, i) => i !== idx));
  };

  const updatePastService = (idx: number, field: keyof PastServiceEntry, value: string) => {
    setPastServices(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const updatePastServiceMulti = (idx: number, updates: Partial<PastServiceEntry>) => {
    setPastServices(prev => prev.map((s, i) => i === idx ? { ...s, ...updates } : s));
  };

  const updatePastServicePosition = (idx: number, pos: PositionInfo | null) => {
    setPastServices(pastServices.map((s, i) =>
      i === idx ? { ...s, postHeld: pos?.name || "", postGroup: pos?.group || "", postSubGroup: pos?.subGroup || "" } : s
    ));
  };

  // Education helpers
  const addEducation = () => setEducationDetails([...educationDetails, EMPTY_EDUCATION()]);
  const removeEducation = (idx: number) => setEducationDetails(educationDetails.filter((_, i) => i !== idx));
  const updateEducation = (idx: number, field: keyof EducationFormEntry, value: string) => {
    setEducationDetails(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const updatePastFromDate = (idx: number, date: Date | undefined) => {
    const newDates = [...pastFromDates];
    newDates[idx] = date;
    setPastFromDates(newDates);
    const dateStr = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "";
    const tenure = (date && pastToDates[idx]) ? calculateTenure(date, pastToDates[idx]!) : "";
    setPastServices(prev => prev.map((s, i) => i === idx ? { ...s, fromDate: dateStr, tenure } : s));
  };

  const updatePastToDate = (idx: number, date: Date | undefined) => {
    const newDates = [...pastToDates];
    newDates[idx] = date;
    setPastToDates(newDates);
    const dateStr = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "";
    const tenure = (pastFromDates[idx] && date) ? calculateTenure(pastFromDates[idx]!, date) : "";
    setPastServices(prev => prev.map((s, i) => i === idx ? { ...s, toDate: dateStr, tenure } : s));
  };

  const validateSections1to7 = (): boolean => {
    const errs: FormErrors = {};
    if (!kgid.trim()) errs.kgid = "KGID Number is required";
    if (!name.trim()) errs.name = "Employee Name is required";
    else if (!/^[a-zA-Z\s.]+$/.test(name)) errs.name = "Only alphabetic characters allowed";
    if (!designation) errs.designation = "Designation is required";
    if (!dateOfEntry) errs.dateOfEntry = "Date of entry is required";
    if (!gender) errs.gender = "Gender is required";
    if (!dateOfBirth) errs.dateOfBirth = "Date of birth is required";
    if (!address.trim()) errs.address = "Address is required";
    if (!pinCode.trim()) errs.pinCode = "Pin code is required";
    if (!email.trim()) errs.email = "Email is required";
    if (!phoneNumber.trim()) errs.phoneNumber = "Phone number is required";
    if (!officeAddress.trim()) errs.officeAddress = "Office address is required";
    if (!officePinCode.trim()) errs.officePinCode = "Office pin code is required";
    if (!officeEmail.trim()) errs.officeEmail = "Office email is required";
    if (!officePhoneNumber.trim()) errs.officePhoneNumber = "Office phone number is required";
    if (!currentPostHeld) errs.currentPostHeld = "Current post is required";
    if (!currentInstitution.trim()) errs.currentInstitution = "Institution is required";
    if (!currentDistrict) errs.currentDistrict = "District is required";
    if (!currentTaluk.trim()) errs.currentTaluk = "Taluk is required";
    if (!currentCityTownVillage.trim()) errs.currentCityTownVillage = "City/Town/Village is required";
    if (!currentWorkingSince) errs.currentWorkingSince = "Working since date is required";
    if (terminallyIll && !terminallyIllDoc) errs.terminallyIllDoc = "Documentary proof is required";
    if (pregnantOrChildUnderOne && !pregnantOrChildUnderOneDoc) errs.pregnantOrChildUnderOneDoc = "Documentary proof is required";
    if (retiringWithinTwoYears && !retiringWithinTwoYearsDoc) errs.retiringWithinTwoYearsDoc = "Documentary proof is required";
    if (childSpouseDisability && !childSpouseDisabilityDoc) errs.childSpouseDisabilityDoc = "Documentary proof is required";
    if (divorceeWidowWithChild && !divorceeWidowWithChildDoc) errs.divorceeWidowWithChildDoc = "Documentary proof is required";
    if (spouseGovtServant && !spouseGovtServantDoc) errs.spouseGovtServantDoc = "Documentary proof is required";
    if (probationaryPeriod && !probationaryPeriodDoc) errs.probationaryPeriodDoc = "Documentary proof is required";
    if (ngoBenefits && !ngoBenefitsDoc) errs.ngoBenefitsDoc = "Documentary proof is required";

    educationDetails.forEach((e, i) => {
      if (!e.level) errs[`edu_${i}_level`] = "Education level is required";
      if (!e.institution) errs[`edu_${i}_institution`] = "Institution name is required";
      if (!e.yearOfPassing) errs[`edu_${i}_yearOfPassing`] = "Date of passing is required";
      
    });

    pastServices.forEach((s, i) => {
      if (!s.postHeld) errs[`past_${i}_postHeld`] = "Post is required";
      if (!s.institution) errs[`past_${i}_institution`] = "Institution is required";
      if (!s.district) errs[`past_${i}_district`] = "District is required";
      if (!s.fromDate) errs[`past_${i}_fromDate`] = "From date is required";
      if (!s.toDate) errs[`past_${i}_toDate`] = "To date is required";
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!empDeclAgreed) errs.empDeclAgreed = "Employee declaration must be accepted";
    if (empDeclAgreed && !empDeclName.trim()) errs.empDeclName = "Employee signature name is required";
    if (empDeclAgreed && !empDeclDate) errs.empDeclDate = "Employee signature date is required";
    if (!officerDeclAgreed) errs.officerDeclAgreed = "Reporting officer declaration must be accepted";
    if (officerDeclAgreed && !officerDeclName.trim()) errs.officerDeclName = "Officer signature name is required";
    if (officerDeclAgreed && !officerDeclDate) errs.officerDeclDate = "Officer signature date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePreview = () => {
    if (!validateSections1to7()) {
      showToast("Please fill all required fields before preview", "error");
      return;
    }
    setFormStep("preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditSection = (section: number) => {
    setEditingSection(section);
    setFormStep("fill");
    setTimeout(() => {
      sectionRefs.current[section]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleBackToPreview = () => {
    if (!validateSections1to7()) {
      showToast("Please fix errors before returning to preview", "error");
      return;
    }
    setEditingSection(null);
    setFormStep("preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPreviewData = (): FormPreviewData => ({
    kgid, name, designation, designationGroup, designationSubGroup, firstPostHeld,
    dateOfEntry, gender, probationaryPeriod, probationaryPeriodDoc, probationDeclarationDate, dateOfBirth,
    cltCompleted, cltCompletedDoc, isDoctorNursePharmacist, hprId, hfrId,
    address, pinCode, email, phoneNumber, telephoneNumber,
    officeAddress, officePinCode, officeEmail, officePhoneNumber, officeTelephoneNumber,
    currentPostHeld, currentPostGroup, currentPostSubGroup, currentFirstPostHeld,
    currentInstitution, currentDistrict, currentTaluk, currentCityTownVillage,
    currentWorkingSince, currentAreaType, pastServices, educationDetails,
    timeboundApplicable, timeboundCategory, timeboundYears, timeboundDoc,
    timeboundDate,
    terminallyIll, terminallyIllDoc,
    pregnantOrChildUnderOne, pregnantOrChildUnderOneDoc,
    retiringWithinTwoYears, retiringWithinTwoYearsDoc,
    childSpouseDisability, childSpouseDisabilityDoc,
    divorceeWidowWithChild, divorceeWidowWithChildDoc,
    spouseGovtServant, spouseGovtServantDoc,
    spouseDesignation, spouseDistrict, spouseTaluk, spouseCityTownVillage,
    ngoBenefits, ngoBenefitsDoc,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const payload = {
      kgid, name, designation, designationGroup, designationSubGroup, firstPostHeld,
      dateOfEntry: dateOfEntry!.toISOString(),
      gender, probationaryPeriod, probationaryPeriodDoc,
      probationDeclarationDate: probationDeclarationDate?.toISOString() || "",
      dateOfBirth: dateOfBirth!.toISOString(),
      cltCompleted, cltCompletedDoc, isDoctorNursePharmacist, hprId, hfrId,
      address, pinCode, email, phoneNumber, telephoneNumber,
      officeAddress, officePinCode, officeEmail, officePhoneNumber, officeTelephoneNumber,
      currentPostHeld, currentPostGroup, currentPostSubGroup, currentFirstPostHeld,
      currentInstitution, currentDistrict, currentTaluk, currentCityTownVillage,
      currentWorkingSince: currentWorkingSince!.toISOString(),
      currentAreaType,
      pastServices, educationDetails,
      timeboundApplicable, timeboundCategory, timeboundYears, timeboundDoc,
      timeboundDate: timeboundDate?.toISOString() || "",
      terminallyIll, terminallyIllDoc,
      pregnantOrChildUnderOne, pregnantOrChildUnderOneDoc,
      retiringWithinTwoYears, retiringWithinTwoYearsDoc,
      childSpouseDisability, childSpouseDisabilityDoc,
      divorceeWidowWithChild, divorceeWidowWithChildDoc,
      spouseGovtServant, spouseGovtServantDoc,
      spouseDesignation, spouseDistrict, spouseTaluk, spouseCityTownVillage,
      ngoBenefits, ngoBenefitsDoc,
      empDeclAgreed, empDeclName, empDeclDate: empDeclDate?.toISOString() || "",
      officerDeclAgreed, officerDeclName, officerDeclDate: officerDeclDate?.toISOString() || "",
    };

    setSubmitting(true);
    try {
      if (isEditMode) {
        await updateEmployeeById(editId, payload);
        showToast("Employee updated successfully!", "success");
        setTimeout(() => navigate("/employee-list"), 1200);
      } else {
        const saved = await createEmployee(payload);
        setSubmittedEmp({ ...payload, id: saved.id, createdAt: saved.createdAt });
        setFormStep("submitted");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      showToast("Failed to save employee. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!submittedEmp) return;
    const emp = submittedEmp;
    const doc = new jsPDF();
    let y = 15;
    const lm = 14;
    const fmt = (d?: string) => d ? new Date(d).toLocaleDateString("en-IN") : "—";

    doc.setFontSize(16);
    doc.text("Employee Service Record", lm, y);
    y += 8;
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, lm, y);
    y += 10;

    const addSection = (title: string, rows: [string, string][]) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(title, lm, y);
      y += 2;
      autoTable(doc, {
        startY: y,
        body: rows,
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 } },
        didDrawPage: (d) => { y = d.cursor?.y || y; },
      });
      y += 6;
    };

    addSection("1. Basic Information", [
      ["KGID", emp.kgid], ["Name", emp.name],
    ]);
    const desigRows: [string, string][] = [
      ["Designation", emp.designation],
      ["Group", `${emp.designationGroup} — ${emp.designationSubGroup}`],
    ];
    if (emp.isDoctorNursePharmacist) {
      desigRows.push(["Doctor/Nurse/Pharmacist", "Yes"]);
      if (emp.hprId) desigRows.push(["HPR ID", emp.hprId]);
      if (emp.hfrId) desigRows.push(["HFR ID", emp.hfrId]);
    }
    addSection("2. Designation", desigRows);
    // Timebound in PDF
    const tbPdfRows: [string, string][] = [
      ["Timebound Applicable", emp.timeboundApplicable ? "Yes" : "No"],
    ];
    if (emp.timeboundApplicable) {
      if (emp.timeboundCategory) tbPdfRows.push(["Category", emp.timeboundCategory]);
      if (emp.timeboundYears) tbPdfRows.push(["Years", emp.timeboundYears]);
      if (emp.timeboundDoc) tbPdfRows.push(["Document", emp.timeboundDoc]);
      if (emp.timeboundDate) tbPdfRows.push(["Date", fmt(emp.timeboundDate)]);
    }
    addSection("3. Timebound", tbPdfRows);
    addSection("4. Service & Personal Details", [
      ["Date of Entry", fmt(emp.dateOfEntry)],
      ["Date of Birth", fmt(emp.dateOfBirth)],
      ["Gender", emp.gender],
      ["Probationary Period Completion document", emp.probationaryPeriod ? `Yes — ${emp.probationaryPeriodDoc}` : "No"],
    ]);
    // Education section
    const eduRows: [string, string][] = [];
    (emp.educationDetails || []).filter(e => e.level).forEach((e, i) => {
      eduRows.push([`#${i + 1} Level`, e.level]);
      eduRows.push([`#${i + 1} Institution`, e.institution]);
      eduRows.push([`#${i + 1} Year`, e.yearOfPassing]);
      
      if (e.documentProof) eduRows.push([`#${i + 1} Document`, e.documentProof]);
    });
    if (eduRows.length > 0) addSection("5. Education Information", eduRows);

    addSection("6. Communication Address", [
      ["Personal Address", emp.address], ["Pin Code", emp.pinCode],
      ["Email", emp.email], ["Phone", emp.phoneNumber],
      ["Telephone", emp.telephoneNumber || "—"],
      ["Office Address", emp.officeAddress], ["Office Pin Code", emp.officePinCode],
      ["Office Email", emp.officeEmail], ["Office Phone", emp.officePhoneNumber],
      ["Office Telephone", emp.officeTelephoneNumber || "—"],
    ]);
    addSection("7. Current Working Details", [
      ["Designation", emp.currentPostHeld],
      ["Group", `${emp.currentPostGroup} — ${emp.currentPostSubGroup}`],
      ["Institution", emp.currentInstitution],
      ["District", emp.currentDistrict],
      ["Taluk", emp.currentTaluk],
      ["City/Town/Village", emp.currentCityTownVillage],
      ...(emp.currentAreaType ? [["Area Type", emp.currentAreaType] as [string, string]] : []),
      ["Working Since", fmt(emp.currentWorkingSince)],
    ]);
    if (emp.pastServices.length > 0) {
      const rows: [string, string][] = [];
      emp.pastServices.forEach((ps, i) => {
        rows.push([`#${i + 1} Designation`, ps.postHeld]);
        rows.push([`#${i + 1} Institution`, ps.institution]);
        rows.push([`#${i + 1} District`, ps.district]);
        rows.push([`#${i + 1} From – To`, `${fmt(ps.fromDate)} — ${fmt(ps.toDate)}`]);
        rows.push([`#${i + 1} Tenure`, ps.tenure]);
      });
      addSection("8. Past Service Details", rows);
    }
    // Spouse Working Details
    const spouseRows: [string, string][] = [
      ["Spouse Govt Servant", emp.spouseGovtServant ? `Yes — ${emp.spouseGovtServantDoc}` : "No"],
    ];
    if (emp.spouseGovtServant) {
      if (emp.spouseDesignation) spouseRows.push(["Spouse Designation", emp.spouseDesignation]);
      if (emp.spouseDistrict) spouseRows.push(["District", emp.spouseDistrict]);
      if (emp.spouseTaluk) spouseRows.push(["Taluk", emp.spouseTaluk]);
      if (emp.spouseCityTownVillage) spouseRows.push(["City/Town/Village", emp.spouseCityTownVillage]);
    }
    addSection("9. Spouse Working Details", spouseRows);
    addSection("10. Special Conditions", [
      ["Terminal Illness", emp.terminallyIll ? `Yes — ${emp.terminallyIllDoc}` : "No"],
      ["Pregnant / Child < 1 year", emp.pregnantOrChildUnderOne ? `Yes — ${emp.pregnantOrChildUnderOneDoc}` : "No"],
      ["Retiring within 2 years", emp.retiringWithinTwoYears ? `Yes — ${emp.retiringWithinTwoYearsDoc}` : "No"],
      ["Disability 40%+", emp.childSpouseDisability ? `Yes — ${emp.childSpouseDisabilityDoc}` : "No"],
      ["Widow/Divorcee with child < 12", emp.divorceeWidowWithChild ? `Yes — ${emp.divorceeWidowWithChildDoc}` : "No"],
    ]);
    addSection("11. Elected NGO Members Details", [
      ["Elected NGO Member", emp.ngoBenefits ? `Yes — ${emp.ngoBenefitsDoc}` : "No"],
    ]);
    addSection("12. Declarations", [
      ["Employee Declaration", emp.empDeclAgreed ? "Agreed" : "Not Agreed"],
      ["Employee Name", emp.empDeclName],
      ["Employee Date", fmt(emp.empDeclDate)],
      ["Officer Declaration", emp.officerDeclAgreed ? "Agreed" : "Not Agreed"],
      ["Officer Name", emp.officerDeclName],
      ["Officer Date", fmt(emp.officerDeclDate)],
    ]);

    doc.save(`Employee_${emp.kgid || emp.name}.pdf`);
  };

  const handlePrintPDF = () => {
    handleDownloadPDF();
  };

  const SectionTitle: React.FC<{ number: string; title: string }> = ({ number, title }) => (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">{number}</span>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    </div>
  );

  const FieldError: React.FC<{ error?: string }> = ({ error }) =>
    error ? <p className="input-error mt-1">{error}</p> : null;

  const shouldShowSection = (n: number) =>
    formStep === "fill" && (editingSection === null || editingSection === n);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        {formStep === "submitted" ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Employee Created Successfully!</h1>
            <p className="text-muted-foreground text-center max-w-md">
              The record for <strong>{submittedEmp?.name}</strong> (KGID: {submittedEmp?.kgid}) has been saved. You can download or print the details below.
            </p>
            <div className="flex items-center gap-4">
              <Button onClick={handleDownloadPDF} className="gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </Button>
              <Button variant="outline" onClick={handlePrintPDF} className="gap-2">
                <Printer className="w-4 h-4" /> Print PDF
              </Button>
            </div>
            <Button variant="ghost" onClick={() => navigate("/categories")} className="mt-4">
              ← Back to Categories
            </Button>
          </div>
        ) : (
        <>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => {
            if (formStep === "fill" && editingSection !== null) {
              handleBackToPreview();
            } else if (formStep === "declare") {
              setFormStep("preview");
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              navigate("/categories");
            }
          }} className="btn-ghost flex items-center gap-2 text-sm px-3 py-2">
            <ArrowLeft className="w-4 h-4" /> {formStep === "fill" && editingSection !== null ? "Back to Preview" : formStep === "declare" ? "Back to Preview" : "Back"}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {formStep === "preview" ? "Preview Details" : formStep === "declare" ? "Declaration & Submit" : editingSection !== null ? `Edit Section ${editingSection}` : isEditMode ? "Edit Employee" : "Add New Employee"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formStep === "preview" ? "Review all details before proceeding to declaration" : formStep === "declare" ? "Sign declarations and submit" : "Fill in all required details to register an employee"}
            </p>
          </div>
        </div>

        {/* PREVIEW MODE */}
        {formStep === "preview" && (
          <FormPreview
            data={getPreviewData()}
            onEdit={handleEditSection}
            onProceed={() => { setFormStep("declare"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        )}

        <form onSubmit={handleSubmit} className={cn("space-y-6", formStep === "preview" && "hidden")}>
          {/* 1. KGID & Name */}
          <div className={cn(!shouldShowSection(1) && "hidden")} ref={el => { sectionRefs.current[1] = el; }}>
          <Card className="p-6">
            <SectionTitle number="1" title="Basic Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="input-label">KGID Number <span className="text-destructive">*</span></label>
                <input value={kgid} onChange={(e) => { setKgid(e.target.value); clearError("kgid"); }} className={`input-field ${errors.kgid || kgidDuplicate ? "border-destructive" : ""}`} placeholder="e.g. KG123456" />
                {kgidDuplicate && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    ⚠️ This KGID already exists. Please verify before proceeding.
                  </p>
                )}
                <FieldError error={errors.kgid} />
              </div>
              <div>
                <label className="input-label">Employee Name <span className="text-destructive">*</span></label>
                <input value={name} onChange={(e) => { const v = e.target.value.replace(/[^a-zA-Z\s.]/g, "").toUpperCase(); setName(v); clearError("name"); }} className={`input-field ${errors.name ? "border-destructive" : ""}`} placeholder="Full name (alphabetic only)" />
                <FieldError error={errors.name} />
              </div>
            </div>
          </Card>
          </div>

          {/* 2. Designation */}
          <div className={cn(!shouldShowSection(2) && "hidden")} ref={el => { sectionRefs.current[2] = el; }}>
          <Card className="p-6">
            <SectionTitle number="2" title="Designation" />
            <div>
              <label className="input-label">Designation <span className="text-destructive">*</span></label>
              <PositionDropdown
                value={designation}
                onChange={(pos) => {
                  setDesignation(pos?.name || "");
                  setDesignationGroup(pos?.group || "");
                  setDesignationSubGroup(pos?.subGroup || "");
                  clearError("designation");
                }}
              />
              {designation && (
                <p className="text-xs text-primary mt-1.5 font-medium">
                  {designationGroup} — {designationSubGroup}
                </p>
              )}
              <FieldError error={errors.designation} />
            </div>
            <div className="mt-4">
              <label className="input-label">Post Held</label>
              <select value={firstPostHeld} onChange={(e) => setFirstPostHeld(e.target.value)} className="input-field">
                <option value="">Select Post Held (Optional)</option>
                {FIRST_POST_HELD_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <Separator className="my-5" />
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Doctor / Nurse / Pharmacist</Label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="isDNP" checked={isDoctorNursePharmacist} onChange={() => setIsDoctorNursePharmacist(true)} className="accent-primary" /> Yes</label>
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="isDNP" checked={!isDoctorNursePharmacist} onChange={() => { setIsDoctorNursePharmacist(false); setHprId(""); setHfrId(""); }} className="accent-primary" /> No</label>
              </div>
            </div>
            {isDoctorNursePharmacist && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                <div>
                  <label className="input-label">HPR ID</label>
                  <input value={hprId} onChange={(e) => setHprId(e.target.value)} className="input-field" placeholder="Enter HPR ID" />
                </div>
                <div>
                  <label className="input-label">HFR ID</label>
                  <input value={hfrId} onChange={(e) => setHfrId(e.target.value)} className="input-field" placeholder="Enter HFR ID" />
                </div>
              </div>
            )}
          </Card>
          </div>

          {/* 3. Timebound */}
          <div className={cn(!shouldShowSection(3) && "hidden")} ref={el => { sectionRefs.current[3] = el; }}>
          <Card className="p-6">
            <SectionTitle number="3" title="Timebound" />
            <div className="space-y-5">
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium leading-snug">Is Timebound applicable?</Label>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={timeboundApplicable} onCheckedChange={(v) => { setTimeboundApplicable(v); if (!v) { setTimeboundCategory(""); setTimeboundYears(""); setTimeboundDoc(""); setTimeboundDate(undefined); } }} />
                    <span className="text-sm text-muted-foreground w-8">{timeboundApplicable ? "Yes" : "No"}</span>
                  </div>
                </div>
                {timeboundApplicable && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Category <span className="text-destructive">*</span></label>
                        <select value={timeboundCategory} onChange={(e) => { setTimeboundCategory(e.target.value); setTimeboundYears(""); }} className="input-field">
                          <option value="">Select Category</option>
                          <option value="Doctors">Doctors</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                      <div>
                        <label className="input-label">Years <span className="text-destructive">*</span></label>
                        <select value={timeboundYears} onChange={(e) => setTimeboundYears(e.target.value)} className="input-field" disabled={!timeboundCategory}>
                          <option value="">{timeboundCategory ? "Select Years" : "Select Category first"}</option>
                          {timeboundCategory === "Doctors" && (
                            <>
                              <option value="6">6 Years</option>
                              <option value="13">13 Years</option>
                              <option value="20">20 Years</option>
                            </>
                          )}
                          {timeboundCategory === "Others" && (
                            <>
                              <option value="10">10 Years</option>
                              <option value="15">15 Years</option>
                              <option value="20">20 Years</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                    <FileUploadField
                      value={timeboundDoc}
                      onChange={(name) => setTimeboundDoc(name)}
                      label="Upload Timebound Document"
                      required={false}
                    />
                    <div>
                      <label className="input-label">Timebound Date</label>
                      <DatePickerField
                        value={timeboundDate}
                        onChange={(d) => setTimeboundDate(d)}
                        placeholder="Select timebound date"
                        disabled={(d) => d > new Date()}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
          </div>

          {/* 4. Service & Personal */}
          <div className={cn(!shouldShowSection(4) && "hidden")} ref={el => { sectionRefs.current[4] = el; }}>
          <Card className="p-6">
            <SectionTitle number="4" title="Service & Personal Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="input-label">Date of Entry into Service <span className="text-destructive">*</span></label>
                <DatePickerField value={dateOfEntry} onChange={(d) => { setDateOfEntry(d); clearError("dateOfEntry"); }} placeholder="Select date" disabled={(d) => d > new Date()} />
                <FieldError error={errors.dateOfEntry} />
              </div>
              <div>
                <label className="input-label">Date of Birth <span className="text-destructive">*</span></label>
                <DatePickerField value={dateOfBirth} onChange={(d) => { setDateOfBirth(d); clearError("dateOfBirth"); }} placeholder="Select date of birth" disabled={(d) => d > new Date()} />
                <FieldError error={errors.dateOfBirth} />
              </div>
              <div>
                <label className="input-label">Gender <span className="text-destructive">*</span></label>
                <div className="flex gap-2 mt-1">
                  {["Male", "Female"].map((g) => (
                    <button key={g} type="button"
                      onClick={() => { setGender(g); clearError("gender"); }}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all",
                        gender === g ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <FieldError error={errors.gender} />
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="probation" className="text-sm font-medium">Probationary Period Completion document</Label>
                  <Switch id="probation" checked={probationaryPeriod} onCheckedChange={setProbationaryPeriod} />
                  <span className="text-sm text-muted-foreground">{probationaryPeriod ? "Yes" : "No"}</span>
                </div>
                {probationaryPeriod && (
                  <div className="space-y-3">
                    <FileUploadField
                      value={probationaryPeriodDoc}
                      onChange={(name) => { setProbationaryPeriodDoc(name); clearError("probationaryPeriodDoc"); }}
                      error={errors.probationaryPeriodDoc}
                    />
                    <div>
                      <label className="input-label">Probation Declaration Date</label>
                      <DatePickerField
                        value={probationDeclarationDate}
                        onChange={(d) => setProbationDeclarationDate(d)}
                        placeholder="Select declaration date"
                        disabled={(d) => d > new Date()}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="cltCompleted" className="text-sm font-medium">CLT Completed</Label>
                  <Switch id="cltCompleted" checked={cltCompleted} onCheckedChange={setCltCompleted} />
                  <span className="text-sm text-muted-foreground">{cltCompleted ? "Yes" : "No"}</span>
                </div>
                {cltCompleted && (
                  <FileUploadField
                    value={cltCompletedDoc}
                    onChange={(name) => setCltCompletedDoc(name)}
                    label="Upload CLT Document"
                    required={false}
                  />
                )}
              </div>
            </div>
          </Card>
          </div>

          {/* 5. Education Information */}
          <div className={cn(!shouldShowSection(5) && "hidden")} ref={el => { sectionRefs.current[5] = el; }}>
          <Card className="p-6">
            <SectionTitle number="5" title="Education Information" />
            <p className="text-sm text-muted-foreground mb-5">Add all education qualifications with supporting documents</p>
            <div className="space-y-6">
              {educationDetails.map((edu, idx) => (
                <div key={idx} className="relative bg-muted/30 rounded-xl p-5 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-foreground">Education Entry #{idx + 1}</span>
                    {educationDetails.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeEducation(idx)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Education Level <span className="text-destructive">*</span></label>
                      <select value={edu.level} onChange={(e) => { updateEducation(idx, "level", e.target.value); clearError(`edu_${idx}_level`); }} className={`input-field ${errors[`edu_${idx}_level`] ? "border-destructive" : ""}`}>
                        <option value="">Select Level</option>
                        {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <FieldError error={errors[`edu_${idx}_level`]} />
                    </div>
                    <div>
                      <label className="input-label">Name of Institution <span className="text-destructive">*</span></label>
                      <input value={edu.institution} onChange={(e) => { updateEducation(idx, "institution", e.target.value); clearError(`edu_${idx}_institution`); }} className={`input-field ${errors[`edu_${idx}_institution`] ? "border-destructive" : ""}`} placeholder="Institution / School / College name" />
                      <FieldError error={errors[`edu_${idx}_institution`]} />
                    </div>
                    <div>
                      <label className="input-label">Date of Passing <span className="text-destructive">*</span></label>
                      <DatePickerField
                        value={edu.yearOfPassing ? new Date(edu.yearOfPassing) : undefined}
                        onChange={(d) => {
                          const dateStr = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "";
                          updateEducation(idx, "yearOfPassing", dateStr);
                          clearError(`edu_${idx}_yearOfPassing`);
                        }}
                        placeholder="Select date of passing"
                        disabled={(d) => d > new Date()}
                      />
                      <FieldError error={errors[`edu_${idx}_yearOfPassing`]} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <FileUploadField
                      value={edu.documentProof}
                      onChange={(name) => { updateEducation(idx, "documentProof", name); }}
                      label="Upload Certificate / Marksheet"
                      required={false}
                      hint="Upload certificate or marksheet. Max file size: 5 MB."
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addEducation} className="w-full border-dashed border-2 border-primary/40 text-primary hover:bg-primary/5">
                <Plus className="w-4 h-4 mr-2" /> Add Another Education Entry
              </Button>
            </div>
          </Card>
          </div>

          {/* 6. Communication Address */}
          <div className={cn(!shouldShowSection(6) && "hidden")} ref={el => { sectionRefs.current[6] = el; }}>
          <Card className="p-6">
            <SectionTitle number="6" title="Communication Address" />

            {/* Personal Address */}
            <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Personal Communication Address (Current)</h4>
            <div className="space-y-4 mb-6">
              <div>
                <label className="input-label">Address <span className="text-destructive">*</span></label>
                <textarea value={address} onChange={(e) => { setAddress(e.target.value); clearError("address"); }} className={`input-field min-h-[80px] resize-y ${errors.address ? "border-destructive" : ""}`} placeholder="Full personal address" />
                <FieldError error={errors.address} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="input-label">Pin Code <span className="text-destructive">*</span></label>
                  <input value={pinCode} onChange={(e) => { setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6)); clearError("pinCode"); }} className={`input-field ${errors.pinCode ? "border-destructive" : ""}`} placeholder="6-digit" maxLength={6} />
                  <FieldError error={errors.pinCode} />
                </div>
                <div>
                  <label className="input-label">Email ID <span className="text-destructive">*</span></label>
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearError("email"); }} className={`input-field ${errors.email ? "border-destructive" : ""}`} placeholder="email@example.com" />
                  <FieldError error={errors.email} />
                </div>
                <div>
                  <label className="input-label">Phone Number <span className="text-destructive">*</span></label>
                  <input value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10)); clearError("phoneNumber"); }} className={`input-field ${errors.phoneNumber ? "border-destructive" : ""}`} placeholder="10-digit mobile" maxLength={10} />
                  <FieldError error={errors.phoneNumber} />
                </div>
                <div>
                  <label className="input-label">Telephone Number</label>
                  <input value={telephoneNumber} onChange={(e) => setTelephoneNumber(e.target.value.replace(/\D/g, "").slice(0, 12))} className="input-field" placeholder="With STD code" maxLength={12} />
                </div>
              </div>
            </div>

            <Separator className="my-5" />

            {/* Office Address */}
            <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Office Address</h4>
            <div className="space-y-4">
              <div>
                <label className="input-label">Address <span className="text-destructive">*</span></label>
                <textarea value={officeAddress} onChange={(e) => { setOfficeAddress(e.target.value); clearError("officeAddress"); }} className={`input-field min-h-[80px] resize-y ${errors.officeAddress ? "border-destructive" : ""}`} placeholder="Full office address" />
                <FieldError error={errors.officeAddress} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="input-label">Pin Code <span className="text-destructive">*</span></label>
                  <input value={officePinCode} onChange={(e) => { setOfficePinCode(e.target.value.replace(/\D/g, "").slice(0, 6)); clearError("officePinCode"); }} className={`input-field ${errors.officePinCode ? "border-destructive" : ""}`} placeholder="6-digit" maxLength={6} />
                  <FieldError error={errors.officePinCode} />
                </div>
                <div>
                  <label className="input-label">Email ID <span className="text-destructive">*</span></label>
                  <input type="email" value={officeEmail} onChange={(e) => { setOfficeEmail(e.target.value); clearError("officeEmail"); }} className={`input-field ${errors.officeEmail ? "border-destructive" : ""}`} placeholder="office@example.com" />
                  <FieldError error={errors.officeEmail} />
                </div>
                <div>
                  <label className="input-label">Phone Number <span className="text-destructive">*</span></label>
                  <input value={officePhoneNumber} onChange={(e) => { setOfficePhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10)); clearError("officePhoneNumber"); }} className={`input-field ${errors.officePhoneNumber ? "border-destructive" : ""}`} placeholder="10-digit mobile" maxLength={10} />
                  <FieldError error={errors.officePhoneNumber} />
                </div>
                <div>
                  <label className="input-label">Telephone Number</label>
                  <input value={officeTelephoneNumber} onChange={(e) => setOfficeTelephoneNumber(e.target.value.replace(/\D/g, "").slice(0, 12))} className="input-field" placeholder="With STD code" maxLength={12} />
                </div>
              </div>
            </div>
          </Card>
          </div>

          {/* 7. Current Working Details */}
          <div className={cn(!shouldShowSection(7) && "hidden")} ref={el => { sectionRefs.current[7] = el; }}>
          <Card className="p-6">
            <SectionTitle number="7" title="Current Working Details" />
            <div className="space-y-4">
              <div>
                <label className="input-label">Designation <span className="text-destructive">*</span></label>
                <PositionDropdown
                  value={currentPostHeld}
                  onChange={(pos) => {
                    setCurrentPostHeld(pos?.name || "");
                    setCurrentPostGroup(pos?.group || "");
                    setCurrentPostSubGroup(pos?.subGroup || "");
                    clearError("currentPostHeld");
                  }}
                  placeholder="Select designation..."
                />
                {currentPostHeld && <p className="text-xs text-primary mt-1 font-medium">{currentPostGroup} — {currentPostSubGroup}</p>}
                <FieldError error={errors.currentPostHeld} />
              </div>
              <div>
                <label className="input-label">Post Held</label>
                <select value={currentFirstPostHeld} onChange={(e) => setCurrentFirstPostHeld(e.target.value)} className="input-field">
                  <option value="">Select Post Held (Optional)</option>
                  {FIRST_POST_HELD_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Name of Institution <span className="text-destructive">*</span></label>
                  <input value={currentInstitution} onChange={(e) => { setCurrentInstitution(e.target.value); clearError("currentInstitution"); }} className={`input-field ${errors.currentInstitution ? "border-destructive" : ""}`} placeholder="Institution name" />
                  <FieldError error={errors.currentInstitution} />
                </div>
                <div>
                  <label className="input-label">District <span className="text-destructive">*</span></label>
                  <select value={currentDistrict} onChange={(e) => { setCurrentDistrict(e.target.value); setCurrentTaluk(""); setCurrentCityTownVillage(""); setCurrentVillageOtherMode(false); clearError("currentDistrict"); }} className={`input-field ${errors.currentDistrict ? "border-destructive" : ""}`}>
                    <option value="">Select District</option>
                    {KARNATAKA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <FieldError error={errors.currentDistrict} />
                </div>
                <div>
                  <label className="input-label">Taluk <span className="text-destructive">*</span></label>
                  <select value={currentTaluk} onChange={(e) => { setCurrentTaluk(e.target.value); setCurrentCityTownVillage(""); setCurrentVillageOtherMode(false); clearError("currentTaluk"); }} className={`input-field ${errors.currentTaluk ? "border-destructive" : ""}`} disabled={!currentDistrict}>
                    <option value="">{currentDistrict ? "Select Taluk" : "Select District first"}</option>
                    {getTaluks(currentDistrict).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <FieldError error={errors.currentTaluk} />
                </div>
                <div>
                  <label className="input-label">City / Town / Village <span className="text-destructive">*</span></label>
                  {(() => {
                    const cities = getCities(currentDistrict, currentTaluk);
                    return (
                      <>
                        <select
                          value={currentVillageOtherMode ? "__other__" : currentCityTownVillage}
                          onChange={(e) => {
                            if (e.target.value === "__other__") {
                              setCurrentVillageOtherMode(true);
                              setCurrentCityTownVillage("");
                              clearError("currentCityTownVillage");
                              setTimeout(() => document.getElementById("currentVillageOther")?.focus(), 50);
                            } else {
                              setCurrentVillageOtherMode(false);
                              setCurrentCityTownVillage(e.target.value);
                              clearError("currentCityTownVillage");
                            }
                          }}
                          className={`input-field ${errors.currentCityTownVillage ? "border-destructive" : ""}`}
                          disabled={!currentTaluk}
                        >
                          <option value="">{currentTaluk ? "Select City/Town/Village" : "Select Taluk first"}</option>
                          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                          <option value="__other__">Others (Enter manually)</option>
                        </select>
                        {currentVillageOtherMode && (
                          <input
                            id="currentVillageOther"
                            type="text"
                            value={currentCityTownVillage}
                            onChange={(e) => { setCurrentCityTownVillage(e.target.value); clearError("currentCityTownVillage"); }}
                            placeholder="Enter village/town name..."
                            className={`input-field mt-2 ${errors.currentCityTownVillage ? "border-destructive" : ""}`}
                            autoFocus
                          />
                        )}
                      </>
                    );
                  })()}
                  <FieldError error={errors.currentCityTownVillage} />
                </div>
              </div>
              <div>
                <label className="input-label">Area Type</label>
                <div className="flex gap-4 mt-2">
                  {["Rural", "Urban"].map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="currentAreaType" value={t} checked={currentAreaType === t} onChange={() => setCurrentAreaType(t)} className="accent-primary w-4 h-4" />
                      <span className="text-sm font-medium text-foreground">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="max-w-sm">
                <label className="input-label">Working in this post since <span className="text-destructive">*</span></label>
                <DatePickerField value={currentWorkingSince} onChange={(d) => { setCurrentWorkingSince(d); clearError("currentWorkingSince"); }} placeholder="Select date" disabled={(d) => d > new Date()} />
                <FieldError error={errors.currentWorkingSince} />
              </div>
              <div>
                <label className="input-label">Zone <span className="text-destructive">*</span></label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {ZONE_OPTIONS.map(zone => (
                    <label key={zone.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="currentZone" value={zone.value} checked={currentZone === zone.value} onChange={() => setCurrentZone(zone.value)} className="accent-primary w-4 h-4" />
                      <span className="text-sm font-medium text-foreground">{zone.label}</span>
                      <span className="text-xs text-muted-foreground">({zone.points} {zone.points === 1 ? "point" : "points"})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>
          </div>

          {/* 8. Past Service Details */}
          <div className={cn(!shouldShowSection(8) && "hidden")} ref={el => { sectionRefs.current[8] = el; }}>
          <Card className="p-6">
            <SectionTitle number="8" title="Past Service Details (Enter regular posts only)" />
            <p className="text-sm text-muted-foreground mb-5">Add all the transfer and promotion details since the date of Appointment (Enter regular posts only) according to Service Record</p>
            <div className="space-y-6">
              {pastServices.map((service, idx) => (
                <div key={idx} className="relative bg-muted/30 rounded-xl p-5 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-foreground">Service Entry #{idx + 1}</span>
                    {pastServices.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePastService(idx)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="input-label">Designation <span className="text-destructive">*</span></label>
                      <PositionDropdown
                        value={service.postHeld}
                        onChange={(pos) => updatePastServicePosition(idx, pos)}
                        placeholder="Select designation..."
                      />
                      {service.postHeld && <p className="text-xs text-primary mt-1 font-medium">{service.postGroup} — {service.postSubGroup}</p>}
                      <FieldError error={errors[`past_${idx}_postHeld`]} />
                    </div>
                    <div>
                      <label className="input-label">Post Held</label>
                      <select value={service.firstPostHeld || ""} onChange={(e) => updatePastService(idx, "firstPostHeld", e.target.value)} className="input-field">
                        <option value="">Select Post Held (Optional)</option>
                        {FIRST_POST_HELD_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Name of Institution <span className="text-destructive">*</span></label>
                        <input value={service.institution} onChange={(e) => updatePastService(idx, "institution", e.target.value)} className={`input-field ${errors[`past_${idx}_institution`] ? "border-destructive" : ""}`} placeholder="Institution name" />
                        <FieldError error={errors[`past_${idx}_institution`]} />
                      </div>
                      <div>
                        <label className="input-label">District <span className="text-destructive">*</span></label>
                        <select value={service.district} onChange={(e) => updatePastServiceMulti(idx, { district: e.target.value, taluk: "", cityTownVillage: "" })} className={`input-field ${errors[`past_${idx}_district`] ? "border-destructive" : ""}`}>
                          <option value="">Select District</option>
                          {KARNATAKA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <FieldError error={errors[`past_${idx}_district`]} />
                      </div>
                      <div>
                        <label className="input-label">Taluk</label>
                        <select value={service.taluk} onChange={(e) => updatePastServiceMulti(idx, { taluk: e.target.value, cityTownVillage: "" })} className="input-field" disabled={!service.district}>
                          <option value="">{service.district ? "Select Taluk" : "Select District first"}</option>
                          {getTaluks(service.district).map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="input-label">City / Town / Village</label>
                        {(() => {
                          const cities = getCities(service.district, service.taluk);
                          const isOtherMode = pastVillageOtherModes[idx] || false;
                          return (
                            <>
                              <select
                                value={isOtherMode ? "__other__" : service.cityTownVillage}
                                onChange={(e) => {
                                  if (e.target.value === "__other__") {
                                    const nm = [...pastVillageOtherModes]; nm[idx] = true; setPastVillageOtherModes(nm);
                                    updatePastService(idx, "cityTownVillage", "");
                                    setTimeout(() => document.getElementById(`pastVillageOther_${idx}`)?.focus(), 50);
                                  } else {
                                    const nm = [...pastVillageOtherModes]; nm[idx] = false; setPastVillageOtherModes(nm);
                                    updatePastService(idx, "cityTownVillage", e.target.value);
                                  }
                                }}
                                className="input-field"
                                disabled={!service.taluk}
                              >
                                <option value="">{service.taluk ? "Select City/Town/Village" : "Select Taluk first"}</option>
                                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                                <option value="__other__">Others (Enter manually)</option>
                              </select>
                              {isOtherMode && (
                                <input
                                  id={`pastVillageOther_${idx}`}
                                  type="text"
                                  value={service.cityTownVillage}
                                  onChange={(e) => updatePastService(idx, "cityTownVillage", e.target.value)}
                                  placeholder="Enter village/town name..."
                                  className="input-field mt-2"
                                  autoFocus
                                />
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="input-label">From Date <span className="text-destructive">*</span></label>
                        <DatePickerField value={pastFromDates[idx]} onChange={(d) => updatePastFromDate(idx, d)} placeholder="From" disabled={(d) => d > new Date()} />
                        <FieldError error={errors[`past_${idx}_fromDate`]} />
                      </div>
                      <div>
                        <label className="input-label">To Date <span className="text-destructive">*</span></label>
                        <DatePickerField value={pastToDates[idx]} onChange={(d) => updatePastToDate(idx, d)} placeholder="To" disabled={(d) => d > new Date()} />
                        <FieldError error={errors[`past_${idx}_toDate`]} />
                      </div>
                      <div>
                        <label className="input-label">Tenure</label>
                        <div className="input-field bg-muted/50 flex items-center text-sm font-medium text-foreground">
                          {service.tenure || "Auto-calculated"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Zone <span className="text-destructive">*</span></label>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {ZONE_OPTIONS.map(zone => (
                          <label key={zone.value} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name={`pastZone_${idx}`} value={zone.value} checked={pastZones[idx] === zone.value} onChange={() => { const nz = [...pastZones]; nz[idx] = zone.value; setPastZones(nz); }} className="accent-primary w-4 h-4" />
                            <span className="text-sm font-medium text-foreground">{zone.label}</span>
                            <span className="text-xs text-muted-foreground">({zone.points} {zone.points === 1 ? "point" : "points"})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addPastService} className="w-full border-dashed border-2 border-primary/40 text-primary hover:bg-primary/5">
                <Plus className="w-4 h-4 mr-2" /> Add Another Past Service Entry
              </Button>
            </div>

            {/* Total Zone Points */}
            <div className="mt-6 p-4 rounded-xl border-2 border-primary/30 bg-primary/5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Total Zone Points</span>
                <span className="text-2xl font-bold text-primary">{totalZonePoints}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Auto-calculated from current and past service zone selections</p>
            </div>
          </Card>
          </div>

          {/* 9. Spouse Working Details */}
          <div className={cn(!shouldShowSection(9) && "hidden")} ref={el => { sectionRefs.current[9] = el; }}>
          <Card className="p-6">
            <SectionTitle number="9" title="Spouse Working Details" />
            <div className="space-y-5">
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium leading-snug">Medical Officer or the staff being married to an employee of a Central Government or State Government or Aided Institution</Label>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={spouseGovtServant} onCheckedChange={setSpouseGovtServant} />
                    <span className="text-sm text-muted-foreground w-8">{spouseGovtServant ? "Yes" : "No"}</span>
                  </div>
                </div>
                {spouseGovtServant && (
                  <div className="space-y-4">
                    <FileUploadField
                      value={spouseGovtServantDoc}
                      onChange={(name) => { setSpouseGovtServantDoc(name); clearError("spouseGovtServantDoc"); }}
                      error={errors.spouseGovtServantDoc}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Spouse Designation</label>
                        <PositionDropdown
                          value={spouseDesignation}
                          onChange={(pos) => setSpouseDesignation(pos?.name || "")}
                          placeholder="Select designation..."
                        />
                      </div>
                      <div>
                        <label className="input-label">District</label>
                        <select value={spouseDistrict} onChange={(e) => { setSpouseDistrict(e.target.value); setSpouseTaluk(""); setSpouseCityTownVillage(""); setSpouseVillageOtherMode(false); }} className="input-field">
                          <option value="">Select District</option>
                          {KARNATAKA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="input-label">Taluk</label>
                        <select value={spouseTaluk} onChange={(e) => { setSpouseTaluk(e.target.value); setSpouseCityTownVillage(""); setSpouseVillageOtherMode(false); }} className="input-field" disabled={!spouseDistrict}>
                          <option value="">{spouseDistrict ? "Select Taluk" : "Select District first"}</option>
                          {getTaluks(spouseDistrict).map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="input-label">City / Town / Village</label>
                        {(() => {
                          const cities = getCities(spouseDistrict, spouseTaluk);
                          return (
                            <>
                              <select
                                value={spouseVillageOtherMode ? "__other__" : spouseCityTownVillage}
                                onChange={(e) => {
                                  if (e.target.value === "__other__") {
                                    setSpouseVillageOtherMode(true);
                                    setSpouseCityTownVillage("");
                                    setTimeout(() => document.getElementById("spouseVillageOther")?.focus(), 50);
                                  } else {
                                    setSpouseVillageOtherMode(false);
                                    setSpouseCityTownVillage(e.target.value);
                                  }
                                }}
                                className="input-field"
                                disabled={!spouseTaluk}
                              >
                                <option value="">{spouseTaluk ? "Select City/Town/Village" : "Select Taluk first"}</option>
                                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                                <option value="__other__">Others (Enter manually)</option>
                              </select>
                              {spouseVillageOtherMode && (
                                <input
                                  id="spouseVillageOther"
                                  type="text"
                                  value={spouseCityTownVillage}
                                  onChange={(e) => setSpouseCityTownVillage(e.target.value)}
                                  placeholder="Enter village/town name..."
                                  className="input-field mt-2"
                                  autoFocus
                                />
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
          </div>

          {/* 10. Special Conditions */}
          <div className={cn(!shouldShowSection(10) && "hidden")} ref={el => { sectionRefs.current[10] = el; }}>
          <Card className="p-6">
            <SectionTitle number="10" title="Special Conditions" />
            <div className="space-y-5">
              {/* 1. Terminal Illness */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium leading-snug">Medical officer or staff or spouse or child declared as dependent under the KCS Medical Attendance Rules is suffering from terminal illness or serious ailments for which treatment is not available at the place of work and transfer is necessary to a place where such treatment is available</Label>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={terminallyIll} onCheckedChange={setTerminallyIll} />
                    <span className="text-sm text-muted-foreground w-8">{terminallyIll ? "Yes" : "No"}</span>
                  </div>
                </div>
                {terminallyIll && (
                  <FileUploadField
                      value={terminallyIllDoc}
                      onChange={(name) => { setTerminallyIllDoc(name); clearError("terminallyIllDoc"); }}
                      error={errors.terminallyIllDoc}
                    />
                )}
              </div>

              {/* 2. Pregnant / Child under 1 */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium leading-snug">Pregnant or a female medical officer or staff with a child of less than one year of age</Label>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={pregnantOrChildUnderOne} onCheckedChange={setPregnantOrChildUnderOne} />
                    <span className="text-sm text-muted-foreground w-8">{pregnantOrChildUnderOne ? "Yes" : "No"}</span>
                  </div>
                </div>
                {pregnantOrChildUnderOne && (
                  <FileUploadField
                      value={pregnantOrChildUnderOneDoc}
                      onChange={(name) => { setPregnantOrChildUnderOneDoc(name); clearError("pregnantOrChildUnderOneDoc"); }}
                      error={errors.pregnantOrChildUnderOneDoc}
                    />
                )}
              </div>

              {/* 3. Retiring within 2 years */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium leading-snug">Medical officer or staff who are due to retire on superannuation within two years</Label>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={retiringWithinTwoYears} onCheckedChange={setRetiringWithinTwoYears} />
                    <span className="text-sm text-muted-foreground w-8">{retiringWithinTwoYears ? "Yes" : "No"}</span>
                  </div>
                </div>
                {retiringWithinTwoYears && (
                  <FileUploadField
                      value={retiringWithinTwoYearsDoc}
                      onChange={(name) => { setRetiringWithinTwoYearsDoc(name); clearError("retiringWithinTwoYearsDoc"); }}
                      error={errors.retiringWithinTwoYearsDoc}
                    />
                )}
              </div>

              {/* 4. Disability 40%+ */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium leading-snug">Medical officer/staff or spouse or child with disability of 40% or more</Label>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={childSpouseDisability} onCheckedChange={setChildSpouseDisability} />
                    <span className="text-sm text-muted-foreground w-8">{childSpouseDisability ? "Yes" : "No"}</span>
                  </div>
                </div>
                {childSpouseDisability && (
                  <FileUploadField
                      value={childSpouseDisabilityDoc}
                      onChange={(name) => { setChildSpouseDisabilityDoc(name); clearError("childSpouseDisabilityDoc"); }}
                      error={errors.childSpouseDisabilityDoc}
                    />
                )}
              </div>

              {/* 5. Widow/Widower/Divorcee with children < 12 */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium leading-snug">Widow or Widower or divorcee Medical officer or staff with children less than 12 years of age</Label>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={divorceeWidowWithChild} onCheckedChange={setDivorceeWidowWithChild} />
                    <span className="text-sm text-muted-foreground w-8">{divorceeWidowWithChild ? "Yes" : "No"}</span>
                  </div>
                </div>
                {divorceeWidowWithChild && (
                  <FileUploadField
                      value={divorceeWidowWithChildDoc}
                      onChange={(name) => { setDivorceeWidowWithChildDoc(name); clearError("divorceeWidowWithChildDoc"); }}
                      error={errors.divorceeWidowWithChildDoc}
                    />
                )}
              </div>

              
            </div>
          </Card>
          </div>

          {/* 11. NGO Benefits for Elected Members */}
          <div className={cn(!shouldShowSection(11) && "hidden")} ref={el => { sectionRefs.current[11] = el; }}>
          <Card className="p-6">
            <SectionTitle number="11" title="Elected NGO Members Details" />
            <p className="text-sm text-muted-foreground mb-5">Details related to elected NGO membership</p>
            <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium leading-snug">Are you an elected NGO member?</Label>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={ngoBenefits} onCheckedChange={setNgoBenefits} />
                  <span className="text-sm text-muted-foreground w-8">{ngoBenefits ? "Yes" : "No"}</span>
                </div>
              </div>
              {ngoBenefits && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">ಚುನಾವಣಾ ಅಧಿಕಾರಿಯ ದೃಢೀಕೃತ ಪ್ರಮಾಣಪತ್ರ — Duly certified by the Election Officer</p>
                  <FileUploadField
                    value={ngoBenefitsDoc}
                    onChange={(name) => { setNgoBenefitsDoc(name); clearError("ngoBenefitsDoc"); }}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.csv"
                    error={errors.ngoBenefitsDoc}
                  />
                </div>
              )}
            </div>
          </Card>
          </div>

          {/* Preview & Print button — shown when filling, not editing a single section */}
          {formStep === "fill" && editingSection === null && (
            <div className="flex items-center justify-end gap-3 pb-8">
              <button type="button" onClick={() => navigate("/categories")} className="btn-ghost px-8 py-3">Cancel</button>
              <button type="button" onClick={handlePreview} className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
                Preview & Print
              </button>
            </div>
          )}

          {/* Back to Preview button — shown when editing a single section */}
          {formStep === "fill" && editingSection !== null && (
            <div className="flex items-center justify-end gap-3 pb-8">
              <button type="button" onClick={handleBackToPreview} className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
                Save & Back to Preview
              </button>
            </div>
          )}

          {/* 12. Declaration — only shown in declare step */}
          <div className={cn(formStep !== "declare" && "hidden")}>
          <Card className="p-6">
            <SectionTitle number="12" title="Declaration" />

            {/* Employee Declaration */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-foreground mb-3">Employee Declaration</h4>
              <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground leading-relaxed">
                  I hereby declare that the details provided in this form are true and correct to the best of my knowledge. If false information is provided, I shall be liable for disciplinary action attracting major penalty as per the provisions of the <span className="font-semibold">Karnataka Civil Services (Classification, Control and Appeal) Rules, 1957</span>.
                </p>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Switch checked={empDeclAgreed} onCheckedChange={setEmpDeclAgreed} id="empDeclAgreed" />
                <Label htmlFor="empDeclAgreed" className="text-sm font-medium cursor-pointer">I agree to the above declaration</Label>
              </div>
              {errors.empDeclAgreed && <p className="text-sm text-destructive mb-3">{errors.empDeclAgreed}</p>}
              {empDeclAgreed && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-1 border-l-2 border-primary/30 ml-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Signature (Full Name) <span className="text-destructive">*</span></Label>
                    <input value={empDeclName} onChange={e => { setEmpDeclName(e.target.value.toUpperCase()); clearError("empDeclName"); }} placeholder="Enter full name" className={cn("w-full h-12 px-4 text-sm bg-card border rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary hover:shadow-md hover:border-primary hover:bg-primary/5", errors.empDeclName ? "border-destructive" : "border-border")} />
                    {errors.empDeclName && <p className="text-sm text-destructive mt-1">{errors.empDeclName}</p>}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Date <span className="text-destructive">*</span></Label>
                    <DatePickerField value={empDeclDate} onChange={d => { setEmpDeclDate(d); clearError("empDeclDate"); }} placeholder="Select date" />
                    {errors.empDeclDate && <p className="text-sm text-destructive mt-1">{errors.empDeclDate}</p>}
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Reporting Officer Declaration */}
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">Declaration by Reporting Officer</h4>
              <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground leading-relaxed">
                  I have verified the details filled up by the employee with the service records available in this office and have found that the details are true and correct to the best of my knowledge and belief. I am aware that if false declaration is made or false information is provided, I shall be liable for disciplinary action attracting major penalty as per the provisions of the <span className="font-semibold">Karnataka Civil Services (Classification, Control and Appeal) Rules, 1957</span>.
                </p>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Switch checked={officerDeclAgreed} onCheckedChange={setOfficerDeclAgreed} id="officerDeclAgreed" />
                <Label htmlFor="officerDeclAgreed" className="text-sm font-medium cursor-pointer">I agree to the above declaration</Label>
              </div>
              {errors.officerDeclAgreed && <p className="text-sm text-destructive mb-3">{errors.officerDeclAgreed}</p>}
              {officerDeclAgreed && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-1 border-l-2 border-primary/30 ml-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Signature (Full Name) <span className="text-destructive">*</span></Label>
                    <input value={officerDeclName} onChange={e => { setOfficerDeclName(e.target.value.toUpperCase()); clearError("officerDeclName"); }} placeholder="Enter full name" className={cn("w-full h-12 px-4 text-sm bg-card border rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-primary/40 focus:border-primary hover:shadow-md hover:border-primary hover:bg-primary/5", errors.officerDeclName ? "border-destructive" : "border-border")} />
                    {errors.officerDeclName && <p className="text-sm text-destructive mt-1">{errors.officerDeclName}</p>}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Date <span className="text-destructive">*</span></Label>
                    <DatePickerField value={officerDeclDate} onChange={d => { setOfficerDeclDate(d); clearError("officerDeclDate"); }} placeholder="Select date" />
                    {errors.officerDeclDate && <p className="text-sm text-destructive mt-1">{errors.officerDeclDate}</p>}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3 pb-8">
            <button type="button" onClick={() => { setFormStep("preview"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn-ghost px-8 py-3">Back to Preview</button>
            <button type="submit" className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
              <Save className="w-5 h-5" /> Submit Employee Details
            </button>
          </div>
          </div>
        </form>
        </>
        )}
      </main>

      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
    </div>
  );
};

export default EmployeeCreate;
