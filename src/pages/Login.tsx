import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Atom } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "Your conversations are ready.",
      });
      navigate("/chat");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-termo-light-orange/10 via-orange-50 to-amber-50 flex">
      {/* Left Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex items-center justify-center p-8 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-termo-light-orange/20 animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-termo-light-orange/30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-termo-light-orange/25 animate-pulse delay-500"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-bold mb-2 text-gray-900"
            >
              Welcome Back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-muted-foreground"
            >
              Login to your account
            </motion.p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-gray-200 focus:border-termo-light-orange focus:ring-termo-light-orange/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 border-gray-200 focus:border-termo-light-orange focus:ring-termo-light-orange/20"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              variant="hero"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-termo-light-orange hover:underline font-medium"
              >
                Register
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Brand */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex-1 relative overflow-hidden"
        style={{
          clipPath: "polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)",
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/10 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-white/5 animate-pulse delay-700"></div>
          <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-white/8 animate-pulse delay-300"></div>
          <div className="absolute bottom-1/3 left-1/3 w-24 h-24 rounded-full bg-white/6 animate-pulse delay-1000"></div>
        </div>

        {/* Geometric Shapes */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              rotateY: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <Atom className="w-16 h-16 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Brand Text */}
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

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 right-32 w-16 h-16 rounded-lg bg-white/10 backdrop-blur-sm"
        ></motion.div>

        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-40 right-20 w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm"
        ></motion.div>
      </motion.div>
    </div>
  );
};

export default Login;