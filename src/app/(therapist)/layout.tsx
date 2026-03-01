import TherapistSidebar from "@/components/layout/TherapistSidebar";

export default function TherapistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--mc-surface)" }}>
      <TherapistSidebar />
      <main className="dashboard-main" style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
