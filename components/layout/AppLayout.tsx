"use client";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrandProvider } from "@/contexts/BrandContext";
import { ToastProvider } from "@/components/ui/Toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar } from "./Sidebar";

export function AppLayout({
  children,
  fullHeight,
}: {
  children: React.ReactNode;
  fullHeight?: boolean;
}) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ProtectedRoute>
          <BrandProvider>
            <div className={`flex bg-gray-50 ${fullHeight ? "h-screen overflow-hidden" : "min-h-screen"}`}>
              <Sidebar />
              <main className={`flex-1 min-w-0 overflow-x-hidden ${fullHeight ? "flex flex-col overflow-hidden" : ""}`}>
                {children}
              </main>
            </div>
          </BrandProvider>
        </ProtectedRoute>
      </ToastProvider>
    </AuthProvider>
  );
}
