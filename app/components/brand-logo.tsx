type BrandLogoProps = {
  siteName: string;
};

export default function BrandLogo({ siteName }: BrandLogoProps) {
  return (
    <>
      <span aria-hidden="true" className="crown">
        ♛
      </span>
      <span className="brand-title">{siteName}</span>
    </>
  );
}
