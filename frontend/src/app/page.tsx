import { HeroSection } from '@/features/landing/components/hero-section';
import {
  FeatureGrid,
  CtaSection,
} from '@/features/landing/components/feature-grid';

/**
 * Landing page — showcases the product with 3D hero,
 * feature grid, and CTA. Mostly server-rendered with
 * selective client islands for interactivity.
 */
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
      <CtaSection />
    </>
  );
}
