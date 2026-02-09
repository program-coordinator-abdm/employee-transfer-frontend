import React from "react";
import { FileText, Download, RefreshCw } from "lucide-react";
import { SupportingDocument } from "@/lib/constants";
import SectionCard from "./SectionCard";

interface Props {
  documents?: SupportingDocument[];
  onRefresh?: () => void;
}

const DocumentsSection: React.FC<Props> = ({ documents, onRefresh }) => {
  const handleDownload = (doc: SupportingDocument) => {
    if (doc.downloadUrl) {
      window.open(doc.downloadUrl, "_blank");
    }
  };

  return (
    <SectionCard title="Documents" icon={FileText}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-semibold text-foreground">Supporting Documents</h4>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        )}
      </div>

      {!documents || documents.length === 0 ? (
        <p className="text-muted-foreground">No supporting documents uploaded</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.sizeKB ? `${doc.sizeKB.toFixed(2)} KB` : ""}
                    {doc.sizeKB && doc.uploadedAt ? " • " : ""}
                    {doc.uploadedAt || ""}
                  </p>
                </div>
              </div>
              {doc.downloadUrl && (
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};

export default DocumentsSection;
