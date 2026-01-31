import React from "react";
import { FileSpreadsheet, FileText, Download } from "lucide-react";
import { downloadEmployeesCSV, downloadEmployeesPDF } from "@/lib/api";

const ExportButtons: React.FC = () => {
    const handleExport = async (type: "csv" | "pdf") => {
    try {
      if (type === "csv") {
        await downloadEmployeesCSV();
      } else {
        await downloadEmployeesPDF();
      }
    } catch (e) {
      console.error(e);
      alert("Export failed. Please make sure you are logged in and try again.");
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
            onClick={() => handleExport("csv")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-success/10 text-success hover:bg-success hover:text-success-foreground rounded-lg font-medium transition-all duration-200 border border-success/20 hover:border-success"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-danger/10 text-danger hover:bg-danger hover:text-danger-foreground rounded-lg font-medium transition-all duration-200 border border-danger/20 hover:border-danger"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportButtons;
