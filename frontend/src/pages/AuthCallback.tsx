import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      navigate(`/login?error=${error}`);
      return;
    }

    if (token) {
      localStorage.setItem("token", token);
      navigate("/");
    } else {
      navigate("/login?error=no_token");
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 mx-auto" />
        <p className="mt-4 text-sm text-slate-500">Completing sign in...</p>
      </div>
    </div>
  );
}