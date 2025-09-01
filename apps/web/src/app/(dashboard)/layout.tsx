import Header from "@/features/layout/components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div>{children}</div>
    </>
  );
}
