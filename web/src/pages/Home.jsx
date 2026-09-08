import HeroSection from '../components/home/HeroSection';
import BenefitsSection from '../components/home/BenefitsSection';
import CategoriesSection from '../components/home/CategoriesSection';
import FeaturedSection from '../components/home/FeaturedSection';
import TestimonialsSection from '../components/home/TestimonialsSection';

export default function Home() {
  return (
    <div className="page-home">
      <HeroSection />
      <BenefitsSection />
      <CategoriesSection />
      <FeaturedSection />
      <TestimonialsSection />
    </div>
  );
}
