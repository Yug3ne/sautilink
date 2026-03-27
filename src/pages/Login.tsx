import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link2, Loader2, Eye, EyeOff } from "lucide-react";

function KenyaFlagStripe() {
  return (
    <div className="flex h-[3px] w-full">
      <div className="h-full flex-1 bg-black" />
      <div className="h-full flex-1 bg-red-600" />
      <div className="h-full flex-1 bg-green-700" />
    </div>
  );
}

function SautiLogo() {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <div className="absolute inset-0 rounded-xl bg-primary" />
      <div
        className="absolute -bottom-1.5 left-2 h-4 w-4 rotate-45 bg-primary"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
      <Link2
        className="relative z-10 h-5 w-5 text-primary-foreground"
        strokeWidth={2.5}
      />
    </div>
  );
}

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <KenyaFlagStripe />

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Logo + branding */}
          <div className="mb-8 flex flex-col items-center text-center">
            <SautiLogo />
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              Sauti-Link
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Connecting Citizens to their MCAs
            </p>
          </div>

          <Card>
            <KenyaFlagStripe />
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Admin Portal</CardTitle>
              <CardDescription>
                Sign in with your MCA credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error */}
                {error && (
                  <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@sauti.ke"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium leading-none"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo credentials hint */}
          <div className="mt-4 text-center">
            <Badge variant="secondary" className="text-xs font-normal">
              Demo: peter@sauti.ke / password123
            </Badge>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Sauti-Link &copy; 2026 &mdash; Republic of Kenya
          </p>
        </div>
      </div>
    </div>
  );
}
