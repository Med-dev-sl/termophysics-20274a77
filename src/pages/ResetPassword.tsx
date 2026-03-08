import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Atom, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { ButtonSpinner } from "@/components/ui/loading-spinner";
import { useFeedbackModal } from "@/components/ui/feedback-modal";
import { PasswordRequirements } from "@/components/PasswordRequirements";
import { usePasswordValidation } from "@/hooks/useFormValidation";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError, FeedbackModalComponent } = useFeedbackModal();
  const { validatePassword, passwordTouched, setPasswordTouched } = usePasswordValidation();

  const pwValidation = validatePassword(password);

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Check URL hash for recovery type
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pwValidation.isValid) {
      showError("Weak Password", "Password must be at least 8 characters with letters and numbers.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Mismatch", "Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      showError("Reset Failed", error.message);
    } else {
      showSuccess("Password Updated!", "You can now log in with your new password.");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-termo-light-orange/10 via-orange-50 to-amber-50 flex items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg"
          >
            <KeyRound className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-foreground">Reset Password</h1>
          <p className="text-base sm:text-lg text-muted-foreground">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-medium text-foreground">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
              required
              className="h-13 text-base border-border focus:border-primary focus:ring-primary/20"
            />
            <PasswordRequirements validation={pwValidation} visible={passwordTouched} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-base font-medium text-foreground">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-13 text-base border-border focus:border-primary focus:ring-primary/20"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-destructive">Passwords do not match</p>
            )}
          </div>

          <Button type="submit" className="w-full h-14 text-lg font-semibold" variant="hero" disabled={loading || !pwValidation.isValid}>
            {loading && <ButtonSpinner />}
            Update Password
          </Button>
        </form>
      </motion.div>
      <FeedbackModalComponent />
    </div>
  );
};

export default ResetPassword;
