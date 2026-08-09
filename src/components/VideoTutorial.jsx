import { useMemo } from 'react';
import { Play } from 'lucide-react';

/**
 * Reusable GodwinShop video tutorial component.
 *
 * CONFIGURATION (fully optional — nothing is hardcoded):
 *
 * 1. Local / cloud MP4
 *    <VideoTutorial
 *      type="mp4"
 *      src="https://cdn.example.com/videos/how-godwinshop-works.mp4"
 *      poster="/uploads/video-poster.jpg"
 *    />
 *
 * 2. YouTube
 *    <VideoTutorial
 *      type="youtube"
 *      src="YOUTUBE_VIDEO_ID_OR_FULL_URL"
 *    />
 *
 * The steps list underneath the player is rendered from the `steps` prop and
 * explains exactly what the video shows. Add your real video file, YouTube
 * ID, or hosted URL — if none is given, a labeled placeholder is shown.
 */
export default function VideoTutorial({
  type = 'mp4',
  src = '',
  poster = '',
  title = 'How GodwinShop Works',
  steps = [
    'Create your account',
    'Verify your account',
    'Browse products',
    'Open a product',
    'Add it to your cart',
    'Place an order',
    'Receive order confirmation',
    'Check your delivery date',
    'Track your order status'
  ],
  className = ''
}) {
  const youtubeId = useMemo(() => {
    if (type !== 'youtube' || !src) return null;
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
      const url = new URL(src.includes('http') ? src : `https://${src}`);
      if (url.hostname === 'youtu.be') return url.pathname.slice(1);
      return url.searchParams.get('v');
    }
    return src;
  }, [type, src]);

  const hasVideo = type === 'mp4' ? Boolean(src) : Boolean(youtubeId);

  return (
    <section className={`rounded-2xl border border-divider bg-surface p-5 sm:p-8 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-muted">
          Watch how the whole GodwinShop experience works — from account to delivery.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-divider bg-black">
        {hasVideo ? (
          type === 'youtube' ? (
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            <video
              className="aspect-video w-full"
              controls
              preload="metadata"
              poster={poster || undefined}
              src={src}
              aria-label={title}
            />
          )
        ) : (
          <div className="relative flex aspect-video items-center justify-center bg-gradient-to-b from-base-2 to-surface">
            <div className="lex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                <Play size={26} className="ml-1" />
              </div>
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="max-w-xs px-4 text-xs text-muted">
                Add your video here — local MP4, cloud-hosted file or YouTube link
                (see <code className="text-accent">VideoTutorial</code> component props).
              </p>
            </div>
          </div>
        )}
      </div>

      <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3 rounded-lg border border-divider bg-base-2 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-black">
              {i + 1}
            </span>
            <span className="text-sm text-muted">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}