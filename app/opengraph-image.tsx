import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Phil Hie";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 21,
            letterSpacing: "5px",
            color: "#6e6e73",
            textTransform: "uppercase",
          }}
        >
          Phil Hie
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: "#1d1d1f",
              fontSize: 184,
              fontWeight: 500,
              lineHeight: 0.95,
              letterSpacing: "-6px",
            }}
          >
            Phil Hie
          </div>
          <div
            style={{
              display: "flex",
              color: "#6e6e73",
              fontSize: 40,
              fontWeight: 300,
              marginTop: 24,
            }}
          >
            Building.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 20,
            letterSpacing: "4px",
            color: "#6e6e73",
            textTransform: "uppercase",
          }}
        >
          philhie.com
        </div>
      </div>
    ),
    { ...size },
  );
}
