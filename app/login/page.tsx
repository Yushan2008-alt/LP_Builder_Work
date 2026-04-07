"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const { signIn, signUp, user, isLoading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!isLoading && user) router.replace("/products");
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email || !password) { setError("Email dan password wajib diisi."); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter."); return; }
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) { setError(error); return; }
        router.replace("/products");
      } else {
        const { error } = await signUp(email, password);
        if (error) { setError(error); return; }
        setSuccessMsg("Akun berhasil dibuat! Cek email kamu untuk konfirmasi, lalu login.");
        setMode("login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">LP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">LP Block Builder</h1>
          <p className="text-sm text-gray-500 mt-1">AI-Powered Landing Page Generator</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
            <button onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              Masuk
            </button>
            <button onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "signup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              Daftar
            </button>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@kamu.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "Minimal 6 karakter" : "Masukkan password"}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
              {mode === "login" ? "Masuk" : "Buat Akun"}
            </Button>
          </form>

          {mode === "login" && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Belum punya akun?{" "}
              <button onClick={() => setMode("signup")} className="text-blue-600 hover:underline font-medium">
                Daftar sekarang
              </button>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Data kamu aman & terenkripsi oleh Supabase
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
