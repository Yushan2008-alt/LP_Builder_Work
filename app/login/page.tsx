"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function mapAuthError(message: string) {
  if (message === "Failed to fetch") {
    return "Tidak bisa terhubung ke server autentikasi. Cek koneksi internet atau konfigurasi Supabase.";
  }
  if (
    message === "Signups not allowed for otp" ||
    message.toLowerCase().includes("signups not allowed")
  ) {
    return "Email ini belum terdaftar. Hubungi admin untuk mendapatkan akses.";
  }
  if (
    message === "Invalid login credentials" ||
    message.toLowerCase().includes("invalid login")
  ) {
    return "Email atau password salah. Silakan coba lagi.";
  }
  if (message.toLowerCase().includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Cek inbox email kamu.";
  }
  if (message.toLowerCase().includes("too many requests")) {
    return "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.";
  }
  return message;
}

function LoginForm() {
  const { signIn, user, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [magicLinkMessage, setMagicLinkMessage] = useState("");
  const [redirectAfterAuth, setRedirectAfterAuth] = useState("/products");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("error");
    if (authError) {
      setError(authError);
    }
    const candidate = params.get("next") ?? params.get("redirectedFrom");
    if (!candidate) {
      setRedirectAfterAuth("/products");
      return;
    }
    if (!candidate.startsWith("/") || candidate.startsWith("//")) {
      setRedirectAfterAuth("/products");
      return;
    }
    setRedirectAfterAuth(candidate);
  }, []);

  useEffect(() => {
    if (!isLoading && user) router.replace(redirectAfterAuth);
  }, [user, isLoading, router, redirectAfterAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) { setError("Email dan password wajib diisi."); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter."); return; }
    setIsSubmitting(true);
    try {
      const { error } = await signIn(normalizedEmail, password);
      if (error) { setError(mapAuthError(error)); return; }
      router.replace(redirectAfterAuth);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMagicLink = async () => {
    setError("");
    setMagicLinkMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Email wajib diisi untuk kirim magic link.");
      return;
    }

    setIsSendingMagicLink(true);
    try {
      // Must call from CLIENT-SIDE so Supabase can store the
      // PKCE code verifier in browser cookies (not server-side).
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          // Redirect to /auth/callback after clicking the link in email
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: false, // only for existing users
        },
      });

      if (otpError) {
        setError(mapAuthError(otpError.message));
        return;
      }

      setMagicLinkMessage("✅ Magic link berhasil dikirim! Cek inbox email kamu.");
    } catch {
      setError("Tidak bisa mengirim magic link saat ini.");
    } finally {
      setIsSendingMagicLink(false);
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
              placeholder="Masukkan password"
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
              Masuk
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              isLoading={isSendingMagicLink}
              onClick={handleSendMagicLink}
            >
              Kirim Magic Link
            </Button>
            {magicLinkMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                {magicLinkMessage}
              </div>
            )}
          </form>
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
