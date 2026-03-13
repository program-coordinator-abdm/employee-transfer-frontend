import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit2, ArrowLeft } from "lucide-react";
import { getTransfers, type TransferRecord } from "@/lib/transfersApi";
import Toast, { useToastState } from "@/components/Toast";
import { format } from "date-fns";

const TransfersList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToastState();
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTransfers()
      .then(setTransfers)
      .catch((err) => {
        console.error("Failed to fetch transfers:", err);
        showToast(err.message || "Failed to load transfers", "error");
        setTransfers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/categories")} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Transfer Applications</h1>
              <p className="text-sm text-muted-foreground">Manage employee transfer requests</p>
            </div>
          </div>
          <Button className="btn-primary gap-2" onClick={() => navigate("/transfer-create")}>
            <Plus className="w-4 h-4" /> Create Transfer
          </Button>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transfers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p className="text-lg font-medium">No transfer applications found</p>
              <p className="text-sm mt-1">Click "Create Transfer" to start a new application</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Sl. No.</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>KGID Number</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((t, idx) => (
                  <TableRow key={t.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{t.name || "—"}</TableCell>
                    <TableCell>{t.kgidNumber || "—"}</TableCell>
                    <TableCell>{t.group || "—"}</TableCell>
                    <TableCell>{t.designation || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === "submitted" ? "default" : "secondary"}>
                        {t.status === "submitted" ? "Submitted" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {t.createdAt ? format(new Date(t.createdAt), "dd MMM yyyy") : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {t.status === "draft" ? (
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate(`/transfer-create?edit=${t.id}`)}>
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate(`/transfers/edit/${t.id}`)}>
                            <Eye className="w-3.5 h-3.5" /> View
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>
    </div>
  );
};

export default TransfersList;
