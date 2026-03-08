import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Atom } from "lucide-react";
import { motion } from "framer-motion";
import { ButtonSpinner } from "@/components/ui/loading-spinner";
import { useFeedbackModal } from "@/components/ui/feedback-modal";
import { supabase } from "@/integrations/supabase/client";
import { EmailFeedback } from "@/components/EmailFeedback";
import { useEmailValidation } from "@/hooks/useFormValidation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, FeedbackModalComponent } = useFeedbackModal();
  const { validateEmail, emailTouched, setEmailTouched } = useEmailValidation();

  const emailValidation = validateEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    setLoading(false);

    if (error) {
      showError("Login Failed", error.message);
    } else {
      showSuccess("Welcome Back!", "Your conversations are ready.");
      setTimeout(() => navigate("/dashboard"), 1500);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showError("Email Required", "Please enter your email address first.");
      return;
    }
    if (!emailValidation.isValid) {
      showError("Invalid Email", "Please enter a valid email address.");
      return;
    }
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotLoading(false);

    if (error) {
      showError("Reset Failed", error.message);
    } else {
      showSuccess("Email Sent!", "Check your inbox for a password reset link.");
      setShowForgot(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-termo-light-orange/10 via-orange-50 to-amber-50 flex flex-col md:flex-row">
      {/* Form Side */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex items-center justify-center px-5 py-10 sm:p-8 relative overflow-hidden min-h-screen md:min-h-0"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-termo-light-orange/20 animate-pulse" />
          <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-termo-light-orange/30 animate-pulse delay-1000" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="md:hidden w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg"
            >
              <Atom className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl sm:text-4xl font-bold mb-2 text-foreground"
            >
              Welcome Back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg text-muted-foreground"
            >
              Login to your account
            </motion.p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }}
                onBlur={() => setEmailTouched(true)}
                required
                className={`h-13 text-base border-border focus:border-primary focus:ring-primary/20 ${
                  emailTouched && emailValidation.status === "valid" ? "border-green-500" :
                  emailTouched && emailValidation.status === "invalid" ? "border-destructive" : ""
                }`}
              />
              <EmailFeedback validation={emailValidation} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base font-medium text-foreground">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-13 text-base border-border focus:border-primary focus:ring-primary/20"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold"
              variant="hero"
              disabled={loading}
            >
              {loading && <ButtonSpinner />}
              Login
            </Button>
          </motion.form>

          {/* Forgot password inline */}
          {showForgot && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 p-4 rounded-lg bg-muted/50 border border-border space-y-3"
            >
              <p className="text-sm text-muted-foreground">
                Enter your email above and click below. We'll send you a link to reset your password.
              </p>
              <Button
                type="button"
                onClick={handleForgotPassword}
                variant="outline"
                className="w-full"
                disabled={forgotLoading}
              >
                {forgotLoading && <ButtonSpinner />}
                Send Reset Link
              </Button>
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="w-full text-sm text-muted-foreground hover:underline"
              >
                Cancel
              </button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-base text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-semibold"
              >
                Register
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Brand (hidden on mobile) */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="hidden md:flex flex-1 relative overflow-hidden"
        style={{
          clipPath: "polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)",
          background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 50%, hsl(var(--primary) / 0.6) 100%)",
        }}
      >
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/10 animate-pulse" />
          <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-white/5 animate-pulse delay-700" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotateY: [0, 360], scale: [1, 1.1, 1] }}
            transition={{
              rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <Atom className="w-16 h-16 text-white" />
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-20 left-20 text-white">
          <motion.h2
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-5xl font-bold mb-2"
          >
            Termo<span className="text-orange-200">Physics</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-orange-100 text-lg"
          >
            AI-Powered Physics Learning
          </motion.p>
        </div>
      </motion.div>
      <FeedbackModalComponent />
    </div>
  );
};

export default Login;
