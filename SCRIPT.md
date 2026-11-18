# Hash Maps in 90 Seconds — Script

A short explainer video about how a hash map works: from the problem it solves, through hashing and buckets, to collisions and resizing.

## Format

| | |
|---|---|
| Length | about 90 seconds (8 scenes) |
| Resolution | 1920 × 1080, 30 fps |
| Animation | Remotion (React), one component per scene |
| Narration | Kokoro TTS (voice `af_heart` or `am_michael`), one audio file per scene |
| Mixing | ffmpeg: narration under the video, export H.264 MP4 |

Scene lengths below are targets. After generating the narration, set each scene's length to its audio length plus about 0.5 seconds of padding.

## Visual style

- Dark background `#0f172a`, white text, one accent per idea:
  - keys: amber `#f59e0b`
  - hash function: violet `#8b5cf6`
  - buckets / array slots: slate outline `#475569`, teal fill `#14b8a6` when occupied
  - collisions / warnings: rose `#f43f5e`
- Monospace font (JetBrains Mono or Fira Code) for keys, values and code. Sans-serif (Inter) for titles.
- The bucket array always sits in the same place (lower half of the screen), so viewers can track it from scene to scene.
- Motion: elements spring in (Remotion `spring()`), keys travel along curved paths into buckets. Nothing moves while the narration is explaining it. Movement comes first, then the explanation, or the other way round.

## Running example

A phone book: names → phone numbers.

| Key | Value | Bucket (of 8) |
|---|---|---|
| `"Alice"` | `555-1234` | 3 |
| `"Bob"` | `555-8765` | 6 |
| `"Carol"` | `555-2468` | 1 |
| `"Dave"` | `555-1357` | 3 ← collides with Alice |

(The bucket numbers are chosen for the story. They do not come from a real hash function, and the video never claims they do.)

---

## Scene 1 — The problem (0:00–0:10)

**On screen**
- Title card fades in: **"Hash Maps"**, subtitle *"finding things instantly"*. Holds 1.5 s, then slides up and out.
- A long vertical list of 12 name/number cards appears. A magnifying-glass highlight steps down the list one card at a time, looking for "Dave". A counter in the corner ticks up: *checked: 1, 2, 3 … 11*.
- Dave is found at the bottom. The counter flashes rose.

**Narration**
> Say you have a phone book and you want Dave's number. If the names are just in a list, you check them one by one. With a million names, that's up to a million checks. A hash map can find it in about one step.

---

## Scene 2 — The idea: an array with a shortcut (0:10–0:20)

**On screen**
- The list fades out. A row of 8 empty boxes (buckets) draws in, labelled with indexes `0` to `7` underneath.
- A small caption above: *"arrays are fast if you know the index"*.
- An arrow jumps straight to box `5` and it lights up. Text: `array[5]` → *1 step*.

**Narration**
> Arrays are fast when you know the index. Jumping to slot five takes one step, no matter how big the array is. So the trick is to turn each key into an index.

---

## Scene 3 — The hash function (0:20–0:32)

**On screen**
- A violet box labelled **hash( )** appears in the middle of the screen, above the buckets.
- The key `"Alice"` (amber) slides in from the left into the box. The box pulses and shows a big number: `2,083,571`.
- Below it, the operation `2,083,571 % 8 = 3` writes itself out.
- The number `3` drops down and points at bucket 3.

**Narration**
> That's the job of a hash function. It takes a key, like the name Alice, and turns it into a number. The same key always gives the same number. Then we take that number modulo the array size, to get an index between zero and seven. Alice goes in bucket three.

---

## Scene 4 — Put and get (0:32–0:45)

**On screen**
- **Put:** the card `"Alice" → 555-1234` flies into bucket 3, which fills teal. Then `"Bob"` goes through the hash box into bucket 6, and `"Carol"` into bucket 1, a little faster each time.
- A caption in the top left records the operations: `put("Alice", …)`, `put("Bob", …)`, `put("Carol", …)`.
- **Get:** caption `get("Bob")`. The key `"Bob"` goes through the hash box again, gives `6`, and an arrow jumps straight to bucket 6. The value `555-8765` lifts out and glows.

**Narration**
> To store a pair, we hash the key and put the value in that bucket. Bob goes in six, Carol in one. To look up Bob later, we hash Bob again, get six, and go straight there. No searching.

---

## Scene 5 — Collisions (0:45–1:00)

**On screen**
- Caption: `put("Dave", …)`. `"Dave"` enters the hash box. It gives `3`.
- Dave's card flies toward bucket 3, which already holds Alice. Bucket 3 flashes rose and the word **Collision!** pops above it.
- Alice's card slides up a little and Dave's card attaches below it with a small arrow, forming a short chain: `Alice → Dave`.
- Caption updates: *"separate chaining: each bucket holds a small list"*.
- Quick replay of `get("Dave")`: hash → bucket 3 → check Alice (no, shown with a small ✕) → check Dave (yes, ✓).

**Narration**
> But what if two keys land in the same bucket? Dave also hashes to three. That's called a collision, and it's normal. One common fix is chaining: each bucket keeps a small list. To find Dave, we go to bucket three and check the few entries there. That's still much faster than checking everything.

---

## Scene 6 — Load factor and resizing (1:00–1:15)

**On screen**
- Many more keys rain into the buckets. The chains get longer. A gauge in the corner shows **load factor = entries ÷ buckets**, rising: `0.5 … 0.75`. At `0.75` it turns rose.
- The array stretches from 8 to 16 buckets. All entries lift out, go through the hash box again (shown in a quick blur), and settle into new, mostly single-entry buckets. The gauge drops back to `0.375` and turns teal.

**Narration**
> As the map fills up, chains get longer and lookups slow down. So hash maps watch their load factor: entries divided by buckets. When it gets too high, often around three quarters, the map doubles its array and re-hashes every key into the new space. The chains become short again.

---

## Scene 7 — Why it matters (1:15–1:25)

**On screen**
- A simple comparison table builds row by row:

  | | List | Hash map |
  |---|---|---|
  | Find | O(n) | O(1) on average |
  | Insert | O(1) | O(1) on average |
  | Delete | O(n) | O(1) on average |

- Below, three small logos/labels appear side by side: Python `dict`, Java `HashMap`, JavaScript `Map`.

**Narration**
> On average, finding, adding and removing all take constant time, "O of one", however big the map gets. That's why hash maps are everywhere: Python dictionaries, Java's HashMap, and JavaScript objects and maps all work this way.

---

## Scene 8 — Recap (1:25–1:32)

**On screen**
- Three lines appear one after another, each with its accent colour:
  1. **Hash** the key → a number (violet)
  2. **Modulo** the size → a bucket (teal)
  3. **Collisions** → chain; **too full** → resize (rose)
- Closing card: **"Hash Maps"** with the 8-bucket row underneath, fading out.

**Narration**
> So, to recap: hash the key, use it to pick a bucket, handle collisions, and resize when it gets crowded. That's a hash map.

---

## Narration text only (for Kokoro)

One line per scene, so each can be generated as its own file (`audio/scene1.wav` … `audio/scene8.wav`).

1. Say you have a phone book and you want Dave's number. If the names are just in a list, you check them one by one. With a million names, that's up to a million checks. A hash map can find it in about one step.
2. Arrays are fast when you know the index. Jumping to slot five takes one step, no matter how big the array is. So the trick is to turn each key into an index.
3. That's the job of a hash function. It takes a key, like the name Alice, and turns it into a number. The same key always gives the same number. Then we take that number modulo the array size, to get an index between zero and seven. Alice goes in bucket three.
4. To store a pair, we hash the key and put the value in that bucket. Bob goes in six, Carol in one. To look up Bob later, we hash Bob again, get six, and go straight there. No searching.
5. But what if two keys land in the same bucket? Dave also hashes to three. That's called a collision, and it's normal. One common fix is chaining: each bucket keeps a small list. To find Dave, we go to bucket three and check the few entries there. That's still much faster than checking everything.
6. As the map fills up, chains get longer and lookups slow down. So hash maps watch their load factor: entries divided by buckets. When it gets too high, often around three quarters, the map doubles its array and re-hashes every key into the new space. The chains become short again.
7. On average, finding, adding and removing all take constant time, O of one, however big the map gets. That's why hash maps are everywhere: Python dictionaries, Java's HashMap, and JavaScript objects and maps all work this way.
8. So, to recap: hash the key, use it to pick a bucket, handle collisions, and resize when it gets crowded. That's a hash map.

Notes for TTS:
- Numbers and symbols are written as words ("modulo", "O of one", "three quarters") so Kokoro reads them naturally.
- If "HashMap" sounds wrong, try "Hash Map" with a space.

## Production checklist

1. Generate `audio/scene1.wav` … `audio/scene8.wav` with Kokoro and measure each length.
2. Set each Remotion scene's `durationInFrames` to `ceil((audio seconds + 0.5) × 30)`.
3. Build the scenes in Remotion and check them in Studio.
4. Render the silent video: `npx remotion render HashMap out/video.mp4`.
5. Join the narration files and mix them under the video with ffmpeg, compressing to H.264 / AAC.
