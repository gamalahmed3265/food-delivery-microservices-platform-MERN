import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Spinner  } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/api/auth";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    authApi
      .verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Failed to verify email.");
      });
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-sm text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto mb-4">
            {status === "loading" && <Spinner  className="h-12 w-12 animate-spin text-slate-400" />}
            {status === "success" && <CheckCircle className="h-12 w-12 text-emerald-500" weight="fill" />}
            {status === "error" && <XCircle className="h-12 w-12 text-red-500" weight="fill" />}
          </div>
          <CardTitle className="text-xl font-bold">
            {status === "loading" && "Verifying..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">{message}</p>
          {status !== "loading" && (
            <Button  className="w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}