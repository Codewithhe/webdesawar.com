import { ImageResponse } from "next/og";
import { SITE_NAME } from "./lib/site";

export const runtime = "edge";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #ffe59a, #f6c453)",
          borderRadius: 8,
          color: "#2a0802",
          display: "flex",
          fontSize: 18,
          fontWeight: 900,
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {SITE_NAME.slice(0, 1)}
      </div>
    ),
    size,
  );
}
