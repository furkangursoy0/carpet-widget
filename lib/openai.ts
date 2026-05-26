// ═══════════════════════════════════════════════════════════════════
// OpenAI client + image visualization helper
//
// We use gpt-image-1 (latest image model, April 2025+) via images.edit
// to composite the product rug into the shopper's uploaded room photo.
// ═══════════════════════════════════════════════════════════════════

import OpenAI from 'openai';

let _openai: OpenAI | null = null;

export function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
}

export type VisualizeArgs = {
  roomImageBase64: string;       // user's uploaded photo (raw base64, no prefix)
  productImageUrl: string;       // detected from the host page
  productTitle?: string;
  size?: '1024x1024' | '1536x1024' | '1024x1536';
};

export type VisualizeResult = {
  imageBase64: string;           // generated image (base64 PNG)
  prompt: string;                // for logging
  model: string;
  durationMs: number;
};

/**
 * Generate a room-with-rug composite.
 *
 * Implementation note (read me, future Furkan):
 *   gpt-image-1 supports multi-image inputs via the `images.edit` endpoint
 *   when called with multiple reference images. We pass:
 *     1) the room photo (the canvas to edit)
 *     2) the rug product photo (the reference for what to place)
 *   plus a prompt that instructs the model to compose them realistically.
 *
 *   If quality is bad after Day 1 testing, fallback options:
 *     - swap to Replicate `flux-kontext` (designed for image editing)
 *     - swap to `fal-ai/flux-pulid` style composition
 *     - downgrade scope: text-to-image only (no real room compositing)
 */
export async function visualizeRoomWithRug({
  roomImageBase64,
  productImageUrl,
  productTitle,
  size = '1024x1024',
}: VisualizeArgs): Promise<VisualizeResult> {
  const openai = getOpenAI();
  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
  const startedAt = Date.now();

  // Fetch the product image and convert to base64 (gpt-image edit wants files/buffers)
  const productImg = await fetch(productImageUrl);
  if (!productImg.ok) throw new Error(`Product image fetch failed: ${productImg.status}`);
  const productBuf = Buffer.from(await productImg.arrayBuffer());
  const roomBuf = Buffer.from(roomImageBase64, 'base64');

  const prompt = [
    `Edit the first image (a room photo) to add the rug shown in the second image onto the visible floor area.`,
    productTitle ? `The rug is a "${productTitle}".` : null,
    `Match the room's perspective, lighting, and shadows so the rug looks naturally placed.`,
    `Keep all other elements of the room — furniture, walls, decor, plants — exactly as they are.`,
    `Preserve the rug's pattern and colors faithfully from the reference.`,
    `Produce a photorealistic result.`,
  ].filter(Boolean).join(' ');

  // gpt-image-1 supports multi-image edit via the `image` array parameter
  // (SDK type currently expects a single file; we pass an array via `as any`)
  const response = await openai.images.edit({
    model,
    image: [
      await OpenAI.toFile(roomBuf, 'room.png', { type: 'image/png' }),
      await OpenAI.toFile(productBuf, 'product.png', { type: 'image/png' }),
    ] as any,
    prompt,
    size,
    n: 1,
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI returned no image data');

  return {
    imageBase64: b64,
    prompt,
    model,
    durationMs: Date.now() - startedAt,
  };
}
