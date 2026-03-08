import { Check, AlertCircle, Mail } from "lucide-react";
import { EmailValidation } from "@/hooks/useFormValidation";

interface Props {
  validation: EmailValidation;
}

export function EmailFeedback({ validation }: Props) {
  if (validation.status === "idle") return null;

  return (
    <div className={`flex items-center gap-1.5 mt-1.5 text-sm ${
      validation.status === "valid" ? "text-green-600" : "text-destructive"
    }`}>
      {validation.status === "valid" ? (
        <Check className="w-3.5 h-3.5 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      )}
      <span>{validation.message}</span>
    </div>
  );
}
