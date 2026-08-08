import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { LockKey, ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { authApi } from "@/api/auth";
import { useState } from "react";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setError("");
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1">
          <button
            onClick={() => navigate(-1)}
            className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <LockKey className="h-5 w-5 text-slate-700" weight="bold" />
          </div>
          <CardTitle className="text-xl font-bold">Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success && (
            <div className="rounded-md bg-emerald-50 p-3 text-sm font-medium text-emerald-700 border border-emerald-200">
              Password updated successfully.
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••"
              error={errors.currentPassword?.message}
              {...register("currentPassword")}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <Input
              label="Confirm New Password"
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}