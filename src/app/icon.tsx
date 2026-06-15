import { ImageResponse } from "next/og";
import { BRAND_BLUE } from "@/lib/brand";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 102,
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 300,
            fontWeight: 700,
            fontFamily: "Arial, Helvetica, sans-serif",
            lineHeight: 1,
            marginTop: -16,
          }}
        >
          S
        </div>
      </div>
    ),
    { ...size }
  );
}
