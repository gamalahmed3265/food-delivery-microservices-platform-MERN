
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Envelope, PaperPlaneRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { authApi } from "@/api/auth";
import { useState } from "react";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

type FormData = z.infer<typeof schema>;

export function ResendVerificationPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setError("");
      await authApi.resendVerification(data.email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <Envelope className="h-5 w-5 text-slate-700" weight="bold" />
          </div>
          <CardTitle className="text-xl font-bold text-center">Resend Verification</CardTitle>
          <CardDescription className="text-center">Enter your email to receive a new verification link</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <div className="rounded-md bg-emerald-50 p-4 text-center border border-emerald-200">
              <PaperPlaneRight className="mx-auto mb-2 h-6 w-6 text-emerald-600" weight="fill" />
              <p className="text-sm font-medium text-emerald-800">Verification email sent! Check your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="name@example.com"
                error={errors.email?.message}
                {...register("email")}
              />
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Resend Email"}
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