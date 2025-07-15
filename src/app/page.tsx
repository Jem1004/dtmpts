import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import NewsSection from '@/components/NewsSection';
import GallerySection from '@/components/GallerySection';
import FeedbackBanner from '@/components/FeedbackBanner';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <NewsSection />
      <GallerySection />
      <FeedbackBanner />
      <Footer />
    </main>
  );
}