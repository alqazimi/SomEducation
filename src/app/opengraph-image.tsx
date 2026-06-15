import { ImageResponse } from "next/og";
import { BRAND_BLUE, PLATFORM_NAME } from "@/lib/brand";

export const alt = `${PLATFORM_NAME} logo`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          gap: 48,
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: BRAND_BLUE,
            borderRadius: 40,
            color: "white",
            fontSize: 118,
            fontWeight: 700,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          S
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
        <div
          style={{
            fontSize: 72,
            fontWeight: 600,
            fontFamily: "Arial, Helvetica, sans-serif",
            color: "#0c0a09",
            display: "flex",
          }}
        >
          <span style={{ color: BRAND_BLUE }}>Som</span>
          <span>Education</span>
        </div>
          <div
            style={{
              fontSize: 28,
              color: "#57534e",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            Premium Online Learning Platform
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
