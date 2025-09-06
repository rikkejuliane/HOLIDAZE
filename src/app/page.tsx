import HeroHome from "@/features/home/components/HeroHome";
import RefinedFiltering from "@/features/home/components/refined/RefinedFiltering";
import HomeListingsSection from "@/features/home/components/HomeListingsSection";

export default function Home() {
  return (
    <>
    <section>
      <HeroHome/>
    </section>
      <RefinedFiltering/>
      <HomeListingsSection />
    </>
  );
}
