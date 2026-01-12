import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, FileText, Sparkles, Camera } from "lucide-react";

interface ExtractedData {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  dateOfBirth: string | null;
  idNumber: string | null;
}

interface DocumentOCRProps {
  onDataExtracted: (data: ExtractedData) => void;
}

const DocumentOCR = ({ onDataExtracted }: DocumentOCRProps) => {
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, WebP, or PDF file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const processDocument = async () => {
    if (!previewUrl || !documentType) {
      toast({
        title: "Missing information",
        description: "Please select a document type and upload a file.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setExtractedData(null);

    try {
      const { data, error } = await supabase.functions.invoke("ocr-document", {
        body: {
          imageBase64: previewUrl,
          documentType,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.success && data.data) {
        setExtractedData(data.data);
        toast({
          title: "Document processed!",
          description: "We've extracted the information. Review and apply to your form.",
        });
      }
    } catch (error: any) {
      console.error("OCR Error:", error);
      toast({
        title: "Processing failed",
        description: error.message || "Failed to process document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyExtractedData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      toast({
        title: "Data applied!",
        description: "The extracted information has been added to your form.",
      });
    }
  };

  const reset = () => {
    setPreviewUrl(null);
    setExtractedData(null);
    setDocumentType("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="border-dashed border-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Smart Document Scanner
        </CardTitle>
        <CardDescription>
          Upload an ID, utility bill, or other document to auto-fill your application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!previewUrl ? (
          <>
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="What are you uploading?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="state_id">State ID</SelectItem>
                  <SelectItem value="utility_bill">Utility Bill</SelectItem>
                  <SelectItem value="bank_statement">Bank Statement</SelectItem>
                  <SelectItem value="pay_stub">Pay Stub</SelectItem>
                  <SelectItem value="other">Other Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileSelect}
              />
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP, or PDF (max 10MB)
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative">
              <img
                src={previewUrl}
                alt="Document preview"
                className="w-full max-h-48 object-contain rounded-lg bg-muted"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={reset}
              >
                Change
              </Button>
            </div>

            {/* Extract Button */}
            {!extractedData && (
              <Button
                onClick={processDocument}
                disabled={loading || !documentType}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing document...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Extract Information
                  </>
                )}
              </Button>
            )}

            {/* Extracted Data Preview */}
            {extractedData && (
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Extracted Information
                  </p>
                  <div className="grid gap-1 text-sm">
                    {extractedData.fullName && (
                      <p><span className="text-muted-foreground">Name:</span> {extractedData.fullName}</p>
                    )}
                    {extractedData.email && (
                      <p><span className="text-muted-foreground">Email:</span> {extractedData.email}</p>
                    )}
                    {extractedData.phone && (
                      <p><span className="text-muted-foreground">Phone:</span> {extractedData.phone}</p>
                    )}
                    {extractedData.address && (
                      <p><span className="text-muted-foreground">Address:</span> {extractedData.address}</p>
                    )}
                    {!extractedData.fullName && !extractedData.email && !extractedData.phone && !extractedData.address && (
                      <p className="text-muted-foreground">No information could be extracted from this document.</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={applyExtractedData} className="flex-1">
                    Apply to Form
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    Try Another
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentOCR;
