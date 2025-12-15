import { SubHeader } from "@/features/layout/components/sub-header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SubHeader />
      {children}
    </>
  );
}
