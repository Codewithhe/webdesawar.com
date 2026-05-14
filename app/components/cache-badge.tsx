type CacheBadgeProps = {
  cached: boolean;
};

export default function CacheBadge({ cached }: CacheBadgeProps) {
  return (
    <span className={`cache-badge ${cached ? "is-cached" : "is-live"}`}>
      {cached ? "Cached response" : "Live response"}
    </span>
  );
}
