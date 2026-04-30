import { DPGeneratorSection } from '@/components /dp-generator-section'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DP Generator · LASU TECH X 5.0',
  description:
    'Generate your official LASU TECH X 5.0 event profile picture. Upload your photo, fit it inside the branded frame, and share it with the world.',
  openGraph: {
    title: 'LASU TECH X 5.0 — DP Generator',
    description: 'Show the world you\'re attending LASU TECH X 5.0. Generate your event DP in seconds.',
    type: 'website',
  },
}

export default function DPGeneratorPage() {
  return <DPGeneratorSection />
}
