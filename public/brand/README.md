# SomEducation brand assets for Clerk

Upload these files to the **Clerk Dashboard** (production instance).

## Recommended file

| File | Size | Use |
|------|------|-----|
| **`clerk-logo.png`** | 512×512 | **Upload this** — sign-in / sign-up logo |
| `clerk-logo-1024.png` | 1024×1024 | High-resolution alternative |
| `clerk-logo-wordmark.png` | 640×160 | Wide logo with “SomEducation” text |

## How to upload in Clerk

1. Open [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your **production** application (not Development)
3. Go to **Configure** → **Customization** (or **Branding**)
4. Under **Logo**, click **Upload** and choose `clerk-logo.png`
5. Save changes

Clerk accepts **PNG, JPEG, GIF, or WebP** up to **10 MB**.

## Regenerate PNG files

If you change the SVG source:

```bash
node scripts/generate-clerk-logos.mjs
```

Sources: `clerk-logo.svg`, `clerk-logo-wordmark.svg`
