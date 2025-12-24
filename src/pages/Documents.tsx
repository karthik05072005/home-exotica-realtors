import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDocuments, useUploadDocument, useDeleteDocument, Document, DocumentType } from "@/hooks/useDocuments";
import {
  Plus,
  FileText,
  Loader2,
  Trash2,
  Upload,
  FolderOpen,
  CreditCard,
  FileCheck,
  Receipt,
  File,
  Home,
  Download,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const documentTypeConfig: Record<DocumentType, { label: string; icon: React.ReactNode }> = {
  aadhar: { label: "Aadhar Card", icon: <CreditCard className="w-5 h-5" /> },
  pan: { label: "PAN Card", icon: <CreditCard className="w-5 h-5" /> },
  address_proof: { label: "Address Proof", icon: <Home className="w-5 h-5" /> },
  booking_form: { label: "Booking Form", icon: <FileCheck className="w-5 h-5" /> },
  sale_agreement: { label: "Sale Agreement", icon: <FileText className="w-5 h-5" /> },
  payment_receipt: { label: "Payment Receipt", icon: <Receipt className="w-5 h-5" /> },
  property_document: { label: "Property Document", icon: <Home className="w-5 h-5" /> },
  other: { label: "Other", icon: <File className="w-5 h-5" /> },
};

export default function Documents() {
  const { data: documents = [], isLoading } = useDocuments();
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({
    document_name: "",
    document_type: "other" as DocumentType,
    notes: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!newDoc.document_name) {
        setNewDoc({ ...newDoc, document_name: file.name.split(".")[0] });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!newDoc.document_name) {
      toast.error("Please enter a document name");
      return;
    }

    await uploadDocument.mutateAsync({
      document_type: newDoc.document_type,
      document_name: newDoc.document_name,
      file: selectedFile,
      notes: newDoc.notes || undefined,
    });

    setNewDoc({ document_name: "", document_type: "other", notes: "" });
    setSelectedFile(null);
    setIsAddOpen(false);
  };

  const handleDelete = async (doc: Document) => {
    await deleteDocument.mutateAsync({ id: doc.id, filePath: doc.file_path });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Home Exotica - Property Documents"
        subtitle="Store property documents & agreements"
        action={
          <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Upload
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
              <SheetHeader className="mb-6">
                <SheetTitle>Upload Property Document</SheetTitle>
              </SheetHeader>
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors",
                    selectedFile
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  )}
                >
                  {selectedFile ? (
                    <>
                      <FileCheck className="w-8 h-8 text-primary" />
                      <p className="text-sm font-medium text-primary">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to select a file</p>
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DOC (max 20MB)</p>
                    </>
                  )}
                </button>

                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select
                    value={newDoc.document_type}
                    onValueChange={(v) => setNewDoc({ ...newDoc, document_type: v as DocumentType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aadhar">Aadhar Card</SelectItem>
                      <SelectItem value="pan">PAN Card</SelectItem>
                      <SelectItem value="address_proof">Address Proof</SelectItem>
                      <SelectItem value="booking_form">Booking Form</SelectItem>
                      <SelectItem value="sale_agreement">Sale Agreement</SelectItem>
                      <SelectItem value="payment_receipt">Payment Receipt</SelectItem>
                      <SelectItem value="property_document">Property Document</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Document Name *</Label>
                  <Input
                    placeholder="Enter document name"
                    value={newDoc.document_name}
                    onChange={(e) => setNewDoc({ ...newDoc, document_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Add notes about this document..."
                    value={newDoc.notes}
                    onChange={(e) => setNewDoc({ ...newDoc, notes: e.target.value })}
                  />
                </div>

                <Button 
                  onClick={handleUpload} 
                  className="w-full"
                  disabled={uploadDocument.isPending}
                >
                  {uploadDocument.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Upload Property Document"
                  )}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {documents.length > 0 ? (
            documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                className="p-4 bg-card rounded-xl border shadow-soft"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {documentTypeConfig[doc.document_type]?.icon || <File className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.document_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {documentTypeConfig[doc.document_type]?.label || "Document"}
                      </p>
                      {doc.notes && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          {doc.notes}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(parseISO(doc.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.file_url, "_blank")}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc)}
                      disabled={deleteDocument.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-card rounded-xl border"
            >
              <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No property documents yet</p>
              <p className="text-sm text-muted-foreground">
                Upload property agreements, receipts, and documents
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
