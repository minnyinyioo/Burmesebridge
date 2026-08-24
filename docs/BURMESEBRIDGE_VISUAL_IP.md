# BurmeseBridge Visual IP

## Master character

The BurmeseBridge Guide is the fixed learning character for original vocabulary illustrations. The master sheet is stored at `public/images/brand/burmesebridge-guide-master.png`.

Locked identifiers:

- short dark wavy hair and the same facial proportions;
- deep-green jacket, cream shirt and trousers;
- cream bridge-arch chest pin;
- deep-green messenger bag with a cream `B` negative-space panel;
- muted jade, cream and restrained terracotta palette;
- controlled editorial outlines and subtle paper grain.

Do not change the character's face, hairstyle, clothing, bag, proportions or core palette between vocabulary cards. Objects may be illustrated without the character when a single-object card communicates the meaning more clearly.

## Provenance and watermark layers

1. Generated originals retain their embedded C2PA provenance metadata.
2. The public vocabulary card adds a low-opacity `BurmeseBridge · HSK N` screenshot watermark.
3. Each asset uses a unique semantic filename and is bound to exactly one vocabulary entry.
4. The source image remains in the repository so its file hash can be compared during a dispute.

The screenshot watermark is intentionally subtle. It supplements provenance metadata; it is not presented as an unbreakable DRM mechanism.

## Vocabulary image production specification

- Canvas: exactly `1254 × 1254 px` (1:1 square).
- Safe area: keep essential people, hands, objects and actions inside the central 84% of the canvas, leaving at least 8% clear space on every edge.
- Do not place text, characters, logos, flags, brands or baked-in labels in the source image.
- Use one vocabulary concept per image. The action or object must remain understandable at a 280 px display size.
- Public rendering uses a 1:1 container with `object-fit: contain`; cropping with `cover` is prohibited.
- Reject any output with cropped heads, hands, feet, learning props or primary objects before binding it to a vocabulary entry.
