import { AnnouncementBar } from "@/components/storefront/AnnouncementBar";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      {children}
      <Footer />
    </>
  );
}
