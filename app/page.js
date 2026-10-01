import Site from './site';
import { getPublishedConfig } from './lib/content-server';

// Published content is read on the server, so search engines see the same text and title as visitors.
// Publishing in the manager refreshes this page immediately; the interval is only a safety net.
export const revalidate = 300;

export async function generateMetadata() {
  const { seo } = await getPublishedConfig();
  return { title: seo.title, description: seo.description, openGraph: { title: seo.title, description: seo.description, locale: 'pt_BR', type: 'website' } };
}

export default async function Page() {
  return <Site initialConfig={await getPublishedConfig()}/>;
}
