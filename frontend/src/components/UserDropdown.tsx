import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gear, SignOut, User, Shield, CaretDown } from "@phosphor-icons/react";
import { useMe, useLogout } from "@/hooks/useAuth";

export function UserDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useMe();
  const logout = useLogout();
  const navigate = useNavigate();

  const user = data?.data?.data?.user;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isLoading) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
    );
  }

  if (!user) return null;

  const initials = user.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const roleColor =
    user.role === "admin"
      ? "bg-purple-100 text-purple-700"
      : user.role === "moderator"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-slate-100 transition-colors"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {initials}
          </div>
        )}
        <span className="hidden text-sm font-semibold text-slate-900 sm:block">{user.name}</span>
        <CaretDown className={`h-3 w-3 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center gap-3 px-3 py-2">
            {user.image ? (
              <img src={user.image} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="my-2 border-t border-slate-100" />

          <div className="px-3 py-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${roleColor}`}>
              <Shield className="h-3 w-3" weight="fill" />
              {user.role}
            </span>
          </div>

          <div className="my-2 border-t border-slate-100" />

          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <Link
            to="/change-password"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Gear className="h-4 w-4" />
            Settings
          </Link>

          <div className="my-2 border-t border-slate-100" />

          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <SignOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}