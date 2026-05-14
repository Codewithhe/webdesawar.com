import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "./lib/site";

export const runtime = "edge";
export const alt = SITE_TITLE;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #160905 0%, #2a0808 46%, #080302 100%)",
          color: "#fff7df",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: "64px",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#ffe59a",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            marginBottom: 24,
          }}
        >
          {SITE_NAME}
        </div>
        <p
          style={{
            color: "#d8b984",
            fontSize: 34,
            lineHeight: 1.35,
            margin: 0,
            maxWidth: 900,
          }}
        >
          {SITE_DESCRIPTION}
        </p>
      </div>
    ),
    size,
  );
}
