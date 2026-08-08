import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LockKey } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { authApi } from "@/api/auth";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token.");
  }, [token]);

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    try {
      setError("");
      await authApi.resetPassword(token, data.password);
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <LockKey className="h-5 w-5 text-slate-700" weight="bold" />
          </div>
          <CardTitle className="text-xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {done ? (
            <div className="rounded-md bg-emerald-50 p-4 text-center border border-emerald-200">
              <p className="text-sm font-medium text-emerald-800">Password reset successfully! Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                title="New Password"
                type="password"
                placeholder="••••••"
                    error={errors.password?.message}
                {...register("password")}
              />
              <Input
                title="Confirm Password"
                type="password"
                placeholder="••••••"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting || !token}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
          <p className="text-center text-sm text-slate-500">
            <Link to="/login" className="font-semibold text-slate-900 hover:underline">
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}