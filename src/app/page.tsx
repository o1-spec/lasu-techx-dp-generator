import { DPGeneratorSection } from '@/components /dp-generator-section'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DP Generator · LASU TECH X 5.0',
  description:
    'Official DP Generator for LASU TECH X 5.0. Generate your branded event profile picture, fit it inside the official frame, and share it with the world.',
  openGraph: {
    title: 'LASU TECH X 5.0 — DP Generator',
    description: 'Generate your official LASU TECH X 5.0 event profile picture in seconds.',
    type: 'website',
  },
}

export default function DPGeneratorPage() {
  return <DPGeneratorSection />
}
