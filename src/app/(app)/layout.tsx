import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <main
        className="mx-auto max-w-lg overflow-y-auto px-4"
        style={{
          paddingTop: "calc(56px + env(safe-area-inset-top, 0px))",
          paddingBottom: "calc(60px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {children}
      </main>
      <BottomNav />
    </>
  );
}
