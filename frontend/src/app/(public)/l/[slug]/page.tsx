import { notFound } from 'next/navigation'
import LandingRenderer, { type LandingData } from '../../../../components/LandingRenderer'

async function getLanding(slug: string): Promise<LandingData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const res    = await fetch(`${apiUrl}/api/landing/public/${slug}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data
  } catch {
    return null
  }
}

export default async function LandingPage({ params }: { params: { slug: string } }) {
  const landing = await getLanding(params.slug)
  if (!landing) notFound()
  return <LandingRenderer landing={landing} />
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const landing = await getLanding(params.slug)
  if (!landing) return {}
  return {
    title:       landing.title,
    description: landing.description || landing.subtitle,
  }
}
