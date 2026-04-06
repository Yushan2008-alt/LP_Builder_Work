"use client";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrandProvider } from "@/contexts/BrandContext";
import { ToastProvider } from "@/components/ui/Toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ProtectedRoute>
          <BrandProvider>
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <main className="flex-1 min-w-0 overflow-x-hidden">
                {children}
              </main>
            </div>
          </BrandProvider>
        </ProtectedRoute>
      </ToastProvider>
    </AuthProvider>
  );
}
