import { Check, X } from "lucide-react";
import { PasswordValidation } from "@/hooks/useFormValidation";

interface Props {
  validation: PasswordValidation;
  visible: boolean;
}

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-sm ${met ? "text-green-600" : "text-destructive"}`}>
      {met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </div>
  );
}

export function PasswordRequirements({ validation, visible }: Props) {
  if (!visible) return null;

  return (
    <div className="mt-1.5 space-y-1 p-3 rounded-lg bg-muted/50 border border-border">
      <p className="text-xs font-semibold text-muted-foreground mb-1">Password must have:</p>
      <Req met={validation.hasMinLength} label="At least 8 characters" />
      <Req met={validation.hasLetter} label="At least one letter (a-z)" />
      <Req met={validation.hasNumber} label="At least one number (0-9)" />
      <Req met={validation.hasSpecial} label="Special character recommended (!@#$...)" />
    </div>
  );
}
