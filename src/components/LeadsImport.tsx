import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, Loader2, Check, AlertCircle, Link } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { LeadSource } from "@/hooks/useLeads";

type ImportedLead = {
  customerName: string;
  phone: string;
  source: LeadSource;
  notes?: string;
};

type PreviewLead = ImportedLead & { valid: boolean; error?: string };

export function LeadsImport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewLeads, setPreviewLeads] = useState<PreviewLead[]>([]);
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");

  const parseExcelData = (data: any[]): PreviewLead[] => {
    return data.map((row) => {
      const customerName = row["Name"] || row["name"] || row["Customer Name"] || row["customer_name"] || "";
      const phone = String(row["Phone"] || row["phone"] || row["Phone Number"] || row["phone_number"] || "");
      const source = (row["Source"] || row["source"] || "manual").toLowerCase() as LeadSource;
      const notes = row["Notes"] || row["notes"] || "";

      const valid = !!customerName && !!phone;
      const error = !customerName ? "Missing name" : !phone ? "Missing phone" : undefined;

      return {
        customerName,
        phone,
        source: ["whatsapp", "phone", "website", "instagram", "manual"].includes(source) ? source : "manual",
        notes,
        valid,
        error,
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (jsonData.length === 0) {
          toast.error("No data found in the file");
          return;
        }

        const leads = parseExcelData(jsonData);
        setPreviewLeads(leads);
        setIsPreviewOpen(true);
        setIsOpen(false);
      } catch (error) {
        toast.error("Failed to parse file. Please check the format.");
      }
    };
    reader.readAsArrayBuffer(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGoogleSheetImport = async () => {
    if (!googleSheetUrl) {
      toast.error("Please enter a Google Sheets URL");
      return;
    }

    // Extract sheet ID from various URL formats
    const match = googleSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      toast.error("Invalid Google Sheets URL");
      return;
    }

    const sheetId = match[1];
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    try {
      setIsImporting(true);
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        throw new Error("Failed to fetch sheet. Make sure it's publicly accessible.");
      }

      const csvText = await response.text();
      const workbook = XLSX.read(csvText, { type: "string" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      if (jsonData.length === 0) {
        toast.error("No data found in the sheet");
        return;
      }

      const leads = parseExcelData(jsonData);
      setPreviewLeads(leads);
      setIsPreviewOpen(true);
      setIsOpen(false);
      setGoogleSheetUrl("");
    } catch (error: any) {
      toast.error(error.message || "Failed to import from Google Sheets");
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    const validLeads = previewLeads.filter((lead) => lead.valid);

    if (validLeads.length === 0) {
      toast.error("No valid leads to import");
      return;
    }

    setIsImporting(true);

    try {
      const { error } = await supabase.from("leads").insert(
        validLeads.map((lead) => ({
          user_id: user!.id,
          customer_name: lead.customerName,
          phone: lead.phone,
          source: lead.source,
          notes: lead.notes || null,
        }))
      );

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(`Successfully imported ${validLeads.length} leads`);
      setIsPreviewOpen(false);
      setPreviewLeads([]);
    } catch (error) {
      toast.error("Failed to import leads");
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = previewLeads.filter((l) => l.valid).length;
  const invalidCount = previewLeads.filter((l) => !l.valid).length;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Upload className="w-4 h-4" />
            Import
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl">
          <SheetHeader className="mb-6">
            <SheetTitle>Import Leads</SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            {/* Excel/CSV Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">From Excel / CSV file</Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-dashed flex flex-col gap-2"
              >
                <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload Excel or CSV file
                </span>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Google Sheets */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">From Google Sheets</Label>
              <p className="text-xs text-muted-foreground">
                Make sure your sheet is publicly accessible (Anyone with the link can view)
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste Google Sheets URL"
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                />
                <Button onClick={handleGoogleSheetImport} disabled={isImporting}>
                  {isImporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Link className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Expected columns:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>Name</strong> (required): Customer name</li>
                <li>• <strong>Phone</strong> (required): Phone number</li>
                <li>• <strong>Source</strong> (optional): whatsapp, phone, website, instagram, manual</li>
                <li>• <strong>Notes</strong> (optional): Additional notes</li>
              </ul>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Import</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{validCount} valid</span>
              </div>
              {invalidCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-rose-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{invalidCount} invalid</span>
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {previewLeads.map((lead, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border text-sm ${
                    lead.valid ? "bg-card" : "bg-rose-50 border-rose-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{lead.customerName || "(No name)"}</p>
                      <p className="text-muted-foreground">{lead.phone || "(No phone)"}</p>
                    </div>
                    {!lead.valid && (
                      <span className="text-xs text-rose-600">{lead.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsPreviewOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmImport}
                disabled={isImporting || validCount === 0}
                className="flex-1"
              >
                {isImporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  `Import ${validCount} Leads`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
