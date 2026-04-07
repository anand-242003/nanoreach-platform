import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signup, googleAuth, clearError } from "@/store/authSlice";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { Loader2, Eye, EyeOff, Zap, Building2, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
  role: z.enum(["INFLUENCER", "BRAND"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const FEATURES = [
  "Verified brands & creators only",
  "Instant payouts within 24 hours",
  "AI-powered campaign matching",
  "Full escrow payment protection",
];

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate("/onboarding");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!error) return;
    toast({ title: "Signup Failed", description: error, variant: "destructive" });
    dispatch(clearError());
    setIsSubmitting(false);
  }, [error, toast, dispatch]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "INFLUENCER" },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await dispatch(signup({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      })).unwrap();
      toast({ title: "Welcome to NanoReach!", description: "Account created successfully." });
      navigate("/onboarding");
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async (response) => {
    if (!response?.credential) {
      toast({ title: "Signup Failed", description: "Google authentication failed", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(googleAuth({ credential: response.credential, role: selectedRole })).unwrap();
      toast({ title: "Welcome to NanoReach!", description: "Signed in with Google." });
      navigate("/onboarding");
    } catch {
      setIsSubmitting(false);
    }
  };

  const selectedRole = form.watch("role");

  return (
    <div className="relative flex min-h-screen w-full flex-col md:flex-row">
      <div className="relative hidden md:flex md:w-2/5 flex-col bg-foreground overflow-hidden">
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link to="/">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">DRK<span className="text-primary">/</span>MTTR</span>
            </div>
          </Link>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm"
            >
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              10,000+ Active Users
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold leading-tight"
            >
              Join the future of<br />
              <span className="text-primary">creator partnerships</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              {FEATURES.map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/20 text-primary">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm font-medium text-white">{text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <p className="text-xs text-white/30">© {new Date().getFullYear()} DRK/MTTR</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-background p-8">
        <div className="w-full max-w-md">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-2 md:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold">DRK<span className="text-primary">/</span>MTTR</span>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Create your account
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started — it&apos;s free
              </p>
            </motion.div>

            <Form {...form}>
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSignup}
                    onError={() => {
                      toast({ title: "Signup Failed", description: "Google authentication failed", variant: "destructive" });
                    }}
                    text="signup_with"
                    shape="pill"
                  />
                </div>
                <div className="relative text-center text-xs uppercase tracking-wide text-muted-foreground">
                  <span className="bg-background px-2 relative z-10">or continue with email</span>
                  <div className="absolute top-1/2 left-0 right-0 border-t border-border -z-0" />
                </div>
              </motion.div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <motion.div variants={itemVariants}>
                  <p className="text-sm font-medium text-foreground mb-2">I am a…</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "INFLUENCER", icon: Sparkles, label: "Creator / Influencer", sub: "Earn from campaigns" },
                      { value: "BRAND", icon: Building2, label: "Brand", sub: "Run campaigns" },
                    ].map(({ value, icon: Icon, label, sub }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => form.setValue("role", value)}
                        className={`flex flex-col items-start gap-1 rounded border-2 p-3 text-left transition-colors ${
                          selectedRole === value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border/80 hover:bg-muted/50"
                        }`}
                      >
                        <div className={`flex h-7 w-7 items-center justify-center rounded ${
                          selectedRole === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">{label}</span>
                        <span className="text-xs text-muted-foreground">{sub}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Smith" disabled={loading || isSubmitting} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" disabled={loading || isSubmitting} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Min. 8 characters"
                              className="pr-10"
                              disabled={loading || isSubmitting}
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((value) => !value)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirm ? "text" : "password"}
                              placeholder="Re-enter password"
                              className="pr-10"
                              disabled={loading || isSubmitting}
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm((value) => !value)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              tabIndex={-1}
                            >
                              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <p className="text-xs text-muted-foreground mb-3">
                    By creating an account you agree to our{" "}
                    <Link to="/terms" className="text-primary hover:underline">Terms</Link>
                    {" "}and{" "}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                  </p>
                  <Button type="submit" className="w-full" disabled={loading || isSubmitting}>
                    {(loading || isSubmitting) ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account…</>
                    ) : (
                      "Sign up for free"
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>

            <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
