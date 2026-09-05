# BurmeseBridge HSK Vocabulary Image Plan

This file records the stable production rules for all HSK vocabulary illustrations.
It is the source of truth for future batches.

## Goal

Every HSK vocabulary item must have one matching original illustration. The image should help Burmese learners understand the Chinese word without relying only on text.

## Brand Character: IP V2

- Use the BurmeseBridge V2 guide character as the recurring brand IP.
- Character identity must stay consistent:
  - young friendly male guide;
  - soft black wavy hair;
  - warm expressive face;
  - emerald green jacket or shirt;
  - cream or light trousers when full body is visible;
  - clean green/cream BurmeseBridge visual style.
- Clothing must visibly include the BurmeseBridge `B` logo patch.
- The crossbody bag is optional. Use it only when it fits the scene. Do not force it into every image.
- Do not invent a different mascot, face, outfit color, or unrelated brand style.

## Logo And Watermark

- The visible brand mark should be the same `B` logo style used by the website.
- Each final image must include a subtle BurmeseBridge watermark.
- Watermark text may be subtle, such as `BurmeseBridge · HSK`, but it must not distract from the learning scene.
- Do not put large Chinese/Burmese/English words inside the illustration. The vocabulary card already provides text outside the image, and generated text can be wrong.

## Style

- Continue future batches in a polished 4D-rendered educational illustration style.
- Keep the style warm, original, clean, and suitable for a learning platform.
- Use soft lighting, clear objects, friendly expressions, and realistic-but-stylized proportions.
- Avoid low-quality anatomy, extra limbs, distorted hands, duplicate faces, unreadable objects, or crowded scenes.

## Size And Cropping

- Generate a fixed landscape vocabulary-card image.
- Keep the main subject fully inside the safe area.
- Do not place important details at the edges.
- Leave comfortable padding around the head, hands, feet, and key objects.
- The image must remain readable after being displayed inside the vocabulary card.

## Vocabulary Matching

- One vocabulary item equals one custom scene.
- The scene must directly express the target meaning, not a vague nearby idea.
- For nouns, show the object clearly.
- For verbs, show the action clearly.
- For adjectives, show a simple visual contrast or a strong situational cue.
- For abstract grammar words, use a clear everyday scene that demonstrates the function without adding generated text.
- If one Chinese word has multiple HSK meanings, choose the meaning used by the current vocabulary entry.

## Quality Gate

Before using an image in the site:

- Confirm the target word is visually represented.
- Confirm the V2 IP character remains on-brand.
- Confirm the clothing includes the `B` logo patch when the character appears.
- Confirm there are no obvious anatomy errors, especially extra legs, extra hands, broken fingers, or duplicated limbs.
- Confirm no generated text is present except subtle watermark/brand mark.
- Confirm the composition will not be cropped by the card.

## Current Batch Convention

- Work in small batches, usually 10 images unless the user asks for another number.
- Save accepted images under `public/images/hsk/vocabulary/`.
- Update the matching `lib/hskVocabularyMyHsk*.ts` entry with:
  - `image`;
  - `imageAltMy`;
  - `imageStatus: "generated"`.

