import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function setInitialPasswordAction(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password || !confirmPassword) {
    redirect("/settings/set-password?error=Password wajib diisi.");
  }

  if (password.length < 8) {
    redirect("/settings/set-password?error=Password minimal 8 karakter.");
  }

  if (password !== confirmPassword) {
    redirect("/settings/set-password?error=Konfirmasi password tidak sama.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/settings/set-password");
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) {
    redirect(`/settings/set-password?error=${encodeURIComponent(updateError.message)}`);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: user.id,
        has_password: true,
        tier: "baseline",
      },
      { onConflict: "user_id" }
    );

  if (profileError) {
    redirect("/settings/set-password?error=Gagal update status password.");
  }

  redirect("/dashboard");
}

type SetPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SetPasswordPage({ searchParams }: SetPasswordPageProps) {
  const params = await searchParams;
  const error = params.error;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/settings/set-password");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Set Password Pertama</h1>
          <p className="text-sm text-slate-600">
            Buat password untuk login berikutnya tanpa magic link.
          </p>
        </div>

        <form action={setInitialPasswordAction} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password Baru
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Minimal 8 karakter"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ulangi password"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Simpan Password
          </button>
        </form>
      </div>
    </div>
  );
}
