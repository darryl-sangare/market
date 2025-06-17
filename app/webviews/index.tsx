// app/webviews/index.tsx
import { useLocalSearchParams } from 'expo-router';
import AmazonWebview from './AmazonWebview';
import SheinWebview from './SheinWebview';
import ZalandoWebview from './ZalandoWebview';
import AsosWebview from './AsosWebview';
import ZaraWebview from './ZaraWebview';
import HmWebview from './HmWebview';
import DefaultWebview from './DefaultWebview';

export default function WebviewWrapper() {
  const { url } = useLocalSearchParams<{ url: string }>();
  if (!url) return null;

  const host = new URL(url).hostname.toLowerCase();

  if (host.includes('amazon')) return <AmazonWebview url={url} />;
  if (host.includes('shein')) return <SheinWebview url={url} />;
  if (host.includes('zalando')) return <ZalandoWebview url={url} />;
  if (host.includes('asos')) return <AsosWebview url={url} />;
  if (host.includes('zara')) return <ZaraWebview url={url} />;
  if (host.includes('hm') || host.includes('h&m')) return <HmWebview url={url} />;

  return <DefaultWebview url={url} />;
}
