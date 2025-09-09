import { Toaster } from "@/components/ui/toaster";

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen">
      {children}
      <Toaster />
    </div>
  );
}