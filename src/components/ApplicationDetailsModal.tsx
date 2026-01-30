import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar,
  DollarSign,
  Tag,
  Download,
  ExternalLink
} from "lucide-react";
import { exportSingleApplicationToPDF } from "@/lib/pdfExport";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  status: string;
  created_at: string;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  notes?: string | null;
  application_data?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    additionalInfo?: string;
  } | null;
  programs: {
    title: string;
    amount: string;
    category: string;
    description?: string;
    timeline?: string;
  };
}

interface ApplicationDetailsModalProps {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
  userEmail?: string;
}

const statusConfig = {
  draft: { label: "Draft", icon: FileText, color: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", icon: Clock, color: "bg-primary/10 text-primary" },
  in_review: { label: "In Review", icon: AlertCircle, color: "bg-secondary/10 text-secondary" },
  approved: { label: "Approved", icon: CheckCircle2, color: "bg-green-100 text-green-700" },
  denied: { label: "Denied", icon: AlertCircle, color: "bg-destructive/10 text-destructive" },
  expired: { label: "Expired", icon: Clock, color: "bg-muted text-muted-foreground" },
};

const ApplicationDetailsModal = ({ 
  application, 
  open, 
  onOpenChange,
  userName = "User",
  userEmail = ""
}: ApplicationDetailsModalProps) => {
  const { toast } = useToast();

  if (!application) return null;

  const config = statusConfig[application.status as keyof typeof statusConfig] || statusConfig.draft;
  const Icon = config.icon;

  const handleExport = () => {
    exportSingleApplicationToPDF(application, userName, userEmail);
    toast({
      title: "PDF Downloaded",
      description: "Application exported successfully.",
    });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl">{application.programs?.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Application ID: {application.id.slice(0, 8)}...
              </p>
            </div>
            <Badge className={config.color}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Program Details */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Program Details
            </h3>
            <div className="grid gap-3 p-4 rounded-lg bg-muted/30">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{application.programs?.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Benefit Amount</span>
                <span className="font-medium text-primary">{application.programs?.amount}</span>
              </div>
              {application.programs?.timeline && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timeline</span>
                  <span className="font-medium">{application.programs.timeline}</span>
                </div>
              )}
              {application.programs?.description && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">{application.programs.description}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Application Timeline
            </h3>
            <div className="grid gap-3 p-4 rounded-lg bg-muted/30">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDate(application.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted</span>
                <span className="font-medium">{formatDate(application.submitted_at)}</span>
              </div>
              {application.reviewed_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reviewed</span>
                  <span className="font-medium">{formatDate(application.reviewed_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Application Data */}
          {application.application_data && Object.keys(application.application_data).length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Your Information
                </h3>
                <div className="grid gap-3 p-4 rounded-lg bg-muted/30">
                  {application.application_data.fullName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Full Name</span>
                      <span className="font-medium">{application.application_data.fullName}</span>
                    </div>
                  )}
                  {application.application_data.email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{application.application_data.email}</span>
                    </div>
                  )}
                  {application.application_data.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{application.application_data.phone}</span>
                    </div>
                  )}
                  {application.application_data.address && (
                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground block mb-1">Address</span>
                      <span className="font-medium">{application.application_data.address}</span>
                    </div>
                  )}
                  {application.application_data.additionalInfo && (
                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground block mb-1">Additional Info</span>
                      <span className="text-sm">{application.application_data.additionalInfo}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Admin Notes */}
          {application.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Review Notes
                </h3>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm">{application.notes}</p>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetailsModal;
