import {NextStudio} from 'next-sanity/studio'
import config from '@/sanity.config'

export const dynamic = 'force-static'

export {viewport} from 'next-sanity/studio'

export const metadata = {
  title: 'lisle.land — Studio',
  robots: {index: false, follow: false},
}

export default function StudioPage() {
  return <NextStudio config={config} />
}
