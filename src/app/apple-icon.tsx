import { ImageResponse } from "next/og";
import { BRAND_BLUE } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND_BLUE,
          borderRadius: 36,
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 108,
            fontWeight: 700,
            fontFamily: "Arial, Helvetica, sans-serif",
            lineHeight: 1,
            marginTop: -6,
          }}
        >
          S
        </div>
      </div>
    ),
    { ...size }
  );
}
