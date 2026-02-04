import React, { useState } from "react";
import { FileSpreadsheet, FileText, Download } from "lucide-react";
import { MOCK_EMPLOYEES } from "@/lib/constants";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ExportButtons: React.FC = () => {
  const [isExporting, setIsExporting] = useState<"csv" | "pdf" | null>(null);

  const handleExportCSV = () => {
    setIsExporting("csv");
    try {
      const headers = ["Name", "KGID", "Role", "Position", "City", "Years of Work", "DOB"];
      const rows = MOCK_EMPLOYEES.map((emp) => [
        emp.name,
        emp.kgid,
        emp.role,
        emp.currentPosition,
        emp.currentCity,
        emp.yearsOfWork.toString(),
        emp.dob,
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "employees.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("CSV export failed. Please try again.");
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPDF = () => {
    setIsExporting("pdf");
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text("Employee Directory", 14, 22);
      doc.setFontSize(10);
      doc.text("Government of Karnataka - Employee Transfer Management", 14, 30);

      // Table
      const tableData = MOCK_EMPLOYEES.map((emp) => [
        emp.name,
        emp.kgid,
        emp.role,
        emp.currentCity,
        emp.yearsOfWork.toString(),
      ]);

      autoTable(doc, {
        startY: 38,
        head: [["Name", "KGID", "Role", "City", "Years"]],
        body: tableData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [0, 128, 128] },
      });

      doc.save("employees.pdf");
    } catch (e) {
      console.error(e);
      alert("PDF export failed. Please try again.");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="bg-surface rounded-xl p-4 sm:p-6 shadow-elegant border border-border/50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Export Employee Data</h3>
            <p className="text-sm text-muted-foreground">Download the complete employee list</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            disabled={isExporting !== null}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-success/10 text-success hover:bg-success hover:text-success-foreground rounded-lg font-medium transition-all duration-200 border border-success/20 hover:border-success disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {isExporting === "csv" ? "Exporting..." : "Export CSV"}
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting !== null}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-danger/10 text-danger hover:bg-danger hover:text-danger-foreground rounded-lg font-medium transition-all duration-200 border border-danger/20 hover:border-danger disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            {isExporting === "pdf" ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportButtons;
