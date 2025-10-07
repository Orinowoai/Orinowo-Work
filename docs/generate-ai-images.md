# Generating Photorealistic Fallback Images — Simple Guide

Goal
- Create consistent fallback images and logo variants so every place that needs a picture shows one.

What is included in this branch
- Two ready-to-use SVG placeholders (good for immediate use).
- Example prompts you can paste into an image generator or give to a designer.
- Simple scripts and an optional GitHub Action workflow your developer can use to automatically generate images (requires an API key).
- A tiny server example showing how to serve a generated fallback image if a remote image is missing.

Quick, non‑technical options
1. Non‑technical (recommended if you don’t want to manage keys):
   - Copy the prompt(s) below and paste them into an online image generator or give them to a designer.
   - Download the produced images and upload them to the repository at `assets/generated/` via the GitHub website (Add file → Upload files).
2. Technical / automated:
   - Use the scripts in `scripts/` and the workflow in `.github/workflows/` to generate images automatically. This requires adding an API key as a secret in the repository.

Logo description (use this exact text for best results)
- "A clean vector logo of a smiling baby Buddha wearing shiny golden headphones. Friendly smiling face, simple flat shapes, bold outline, warm golden and coral color palette, transparent background, scalable for use as an app icon and favicon. No text or watermark."

Simple copy/paste prompts (use these exactly)
- Logo (vector):
  "Create a clean vector logo: a smiling baby Buddha wearing shiny golden headphones, friendly smiling face, simple flat shapes, bold outline, warm golden and coral color palette, transparent background, scalable for use as an app icon and favicon. No text or watermark."
- Avatar (photorealistic):
  "Photorealistic headshot of a friendly adult person, neutral background, soft studio lighting, high detail, no text or logos."
- Hero/banner:
  "Photorealistic modern workspace with neutral palette, soft natural lighting, 16:9 aspect ratio, high detail, professional photography."
- Generic placeholder:
  "Clean studio photo of a modern object on a white background, minimal style, 16:9 aspect ratio, high detail."

If you want me to proceed
- Say: “Yes, open PR” to have me commit these files to `add/ai-image-generation` and open a pull request against `main` (or tell me another base branch).
- If you want the actual AI-generated images added automatically, say you want automation and I will explain simply how to add an API key (or guide your admin) and enable the workflow.
