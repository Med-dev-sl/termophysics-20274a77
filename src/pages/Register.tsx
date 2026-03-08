import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { Atom } from "lucide-react";
import { motion } from "framer-motion";
import { ButtonSpinner } from "@/components/ui/loading-spinner";
import { useFeedbackModal } from "@/components/ui/feedback-modal";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, FeedbackModalComponent } = useFeedbackModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      showError("Role Required", "Please select whether you are a learner or teacher.");
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, role);

    setLoading(false);

    if (error) {
      showError("Registration Failed", error.message);
    } else {
      showSuccess("Account Created!", "You can now save your chat history.");
      setTimeout(() => navigate("/dashboard"), 1500);
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
            {/* Mobile brand icon */}
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
              Create Account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg text-muted-foreground"
            >
              Join us to save your conversations
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
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-13 text-base border-border focus:border-primary focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium text-foreground">Password</Label>
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

            <div className="space-y-2">
              <Label htmlFor="role" className="text-base font-medium text-foreground">I am a</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger className="h-13 text-base border-border focus:border-primary focus:ring-primary/20">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learner" className="text-base">Learner</SelectItem>
                  <SelectItem value="teacher" className="text-base">Teacher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold"
              variant="hero"
              disabled={loading}
            >
              {loading && <ButtonSpinner />}
              Register
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-base text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-semibold"
              >
                Login
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

export default Register;
