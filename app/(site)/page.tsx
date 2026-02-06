import Hero from "@/components/home/Hero";
import FeaturedGrid from "@/components/home/FeaturedGrid";
import ProductSpotlight from "@/components/home/ProductSpotlight";
import SystemHighlight from "@/components/home/SystemHighlight";
import Solutions from "@/components/home/Solutions";
import News from "@/components/home/News";
import Partners from "@/components/home/Partners";
import ContactForm from "@/components/home/ContactForm";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      {/* <FeaturedGrid /> */}
      <ProductSpotlight />
      <SystemHighlight />
      <Solutions />
      <News />
      <Partners />
      <ContactForm />
    </div>
  );
}
