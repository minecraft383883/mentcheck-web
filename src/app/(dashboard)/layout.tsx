import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--mc-surface)" }}>
      <Sidebar />
      <main className="dashboard-main" style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
