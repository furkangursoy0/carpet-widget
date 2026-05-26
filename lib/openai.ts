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
  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5';
  const startedAt = Date.now();

  // Fetch the product image and convert to base64 (gpt-image edit wants files/buffers)
  const productImg = await fetch(productImageUrl);
  if (!productImg.ok) throw new Error(`Product image fetch failed: ${productImg.status}`);
  const productBuf = Buffer.from(await productImg.arrayBuffer());
  const roomBuf = Buffer.from(roomImageBase64, 'base64');

  const prompt = `Task: Perform scene-consistent inpainting to insert the exact rug from image-2 onto the floor of image-1.${productTitle ? ` The rug is a "${productTitle}".` : ''} Preserve room structure: - Do not change walls, furniture, windows, or camera angle. - Do not move or redesign any objects. Preserve rug identity: - Use the exact rug image as texture source. - Do not reinterpret or redesign the pattern. - Pattern geometry must remain identical. Photorealistic placement: - Place the rug flat on the floor plane. - Match room perspective and vanishing lines. - The rug must be larger at the bottom edge (closer to camera) and narrower at the far edge. - The rug must follow the same vanishing point as the floor lines. - Keep the entire rug fully visible; do not crop or cut any rug edge. - Leave a visible floor margin around the rug on all sides. - Rug footprint should stay moderate (not wall-to-wall, not filling most of the room). - The rug must NOT cover the entire floor. - The rug must be clearly smaller than the room floor. - Do not extend the rug to the walls. - Only adapt scale and perspective, not design. - Ensure correct real-world scale. Blending & Lighting: - Rug must inherit floor lighting, shadows, color temperature. - Floor texture must subtly affect rug edges. - Remove any mask edges, no white borders, no overlay look. - Apply minimal global luminance adjustment only if strictly necessary. - The rug texture and pattern must be treated as a photographic cutout, not re-generated. Restrictions: - No comparison. - No side-by-side. - No A/B. - Always single final render. Output: - Single realistic image.`;

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
