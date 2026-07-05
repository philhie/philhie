import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#1d1d1f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: 92,
            fontWeight: 500,
            letterSpacing: "-4px",
            marginTop: -6,
          }}
        >
          ph
        </span>
      </div>
    ),
    { ...size },
  );
}
