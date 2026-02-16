import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { type NewEmployee } from "@/lib/employeeStorage";

export function exportEmployeesToPDF(employees: NewEmployee[], title: string = "Employee List") {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 25);

  const rows = employees.map((emp, i) => [
    i + 1,
    emp.name,
    emp.kgid,
    emp.designation,
    emp.designationGroup,
    emp.currentInstitution,
    emp.currentDistrict,
  ]);

  autoTable(doc, {
    startY: 30,
    head: [["#", "Name", "KGID", "Designation", "Group", "Institution", "District"]],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 128, 128] },
  });

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
}

export function exportEmployeesToExcel(employees: NewEmployee[], title: string = "Employee List") {
  const data = employees.map((emp, i) => ({
    "#": i + 1,
    Name: emp.name,
    KGID: emp.kgid,
    Designation: emp.designation,
    Group: emp.designationGroup,
    "Sub Group": emp.designationSubGroup,
    "Current Post": emp.currentPostHeld,
    Institution: emp.currentInstitution,
    District: emp.currentDistrict,
    Taluk: emp.currentTaluk,
    Gender: emp.gender,
    Email: emp.email,
    Phone: emp.phoneNumber,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees");
  XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}.xlsx`);
}
