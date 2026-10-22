"use strict";

// Runs the gallery photography through TinyPNG (tinify).
//
//   TINIFY_API_KEY=xxxx npm run optimize:images -- --dry
//   TINIFY_API_KEY=xxxx npm run optimize:images
//
// PNGs are converted to JPEG on the way through rather than being compressed
// as PNGs. These are photographs, and the format change is worth far more than
// any PNG quantiser: locally, mozjpeg alone already takes the 24 iron PNGs from
// 16.1 MB to 1.7 MB. TinyPNG's value is the extra squeeze on top of that, so
// the two are stacked rather than treated as alternatives.
//
// Note this uploads each image to TinyPNG's servers. These are photographs
// already destined to be public on the site, but it is a third-party upload.
//
// Free tier is 500 images/month; the whole gallery is well under that.

const fs = require("fs/promises");
const fssync = require("fs");
const path = require("path");
const tinify = require("tinify");

const root = path.join(__dirname, "..");
const galleryDir = path.join(root, "img", "gallery");

const DRY = process.argv.includes("--dry");
const KEY = process.env.TINIFY_API_KEY || process.env.TINYPNG_API_KEY;

const kb = (n) => (n / 1024).toFixed(0).padStart(5) + " KB";
const mb = (n) => (n / 1048576).toFixed(2) + " MB";

function listImages() {
  const out = [];
  for (const dir of fssync.readdirSync(galleryDir)) {
    const full = path.join(galleryDir, dir);
    if (!fssync.statSync(full).isDirectory()) continue;
    for (const file of fssync.readdirSync(full)) {
      if (!/\.(png|jpe?g)$/i.test(file)) continue;
      out.push(path.join(full, file));
    }
  }
  return out.sort();
}

(async () => {
  const files = listImages();
  const total = files.reduce((n, f) => n + fssync.statSync(f).size, 0);

  console.log(`${files.length} image(s), ${mb(total)} currently`);

  if (!KEY) {
    console.error(
      "\nNo API key. Set TINIFY_API_KEY and re-run:\n" +
      "  TINIFY_API_KEY=your-key npm run optimize:images\n" +
      "Get a free key (500 images/month) at https://tinypng.com/developers"
    );
    process.exitCode = 1;
    return;
  }

  tinify.key = KEY;
  try {
    await tinify.validate();
  } catch (err) {
    console.error("Key rejected by TinyPNG: " + err.message);
    process.exitCode = 1;
    return;
  }
  console.log(`Key OK. ${tinify.compressionCount || 0} compressions used this month.\n`);

  if (DRY) {
    files.forEach((f) => {
      const rel = path.relative(root, f);
      const to = rel.replace(/\.png$/i, ".jpg");
      console.log(`  would send ${rel}${to !== rel ? "  -> " + path.basename(to) : ""}`);
    });
    console.log("\nDry run — nothing uploaded or written.");
    return;
  }

  let before = 0, after = 0, failed = 0;

  for (const file of files) {
    const rel = path.relative(root, file);
    const isPng = /\.png$/i.test(file);
    const dest = isPng ? file.replace(/\.png$/i, ".jpg") : file;
    const origSize = fssync.statSync(file).size;

    // A PNG sitting next to a JPEG of the same name has already been converted;
    // sending it again would spend quota twice on one photo and clobber the
    // JPEG that the markup already points at.
    if (isPng && fssync.existsSync(dest)) {
      console.log(`  skip  ${rel}  (${path.basename(dest)} already exists — unreferenced original)`);
      continue;
    }

    try {
      let source = tinify.fromFile(file);
      // Photographs: hand PNGs back as JPEG. Older API versions lack convert(),
      // in which case the file is still compressed, just not re-containered.
      if (isPng && typeof source.convert === "function") {
        source = source.convert({ type: "image/jpeg" });
      }
      const buf = await source.toBuffer();

      // Only keep the result if it is actually smaller
      if (buf.length >= origSize && dest === file) {
        console.log(`  skip  ${rel}  (already ${kb(origSize)}, no gain)`);
        before += origSize; after += origSize;
        continue;
      }

      await fs.writeFile(dest, buf);
      if (dest !== file) await fs.unlink(file);

      before += origSize; after += buf.length;
      console.log(
        `  ok    ${rel.padEnd(44)} ${kb(origSize)} -> ${kb(buf.length)}` +
        `  (-${Math.round((1 - buf.length / origSize) * 100)}%)` +
        (dest !== file ? "  now " + path.basename(dest) : "")
      );
    } catch (err) {
      failed++;
      console.error(`  FAIL  ${rel}: ${err.message}`);
    }
  }

  console.log(
    `\n${mb(before)} -> ${mb(after)}  ` +
    `(-${Math.round((1 - after / before) * 100)}%)` +
    (failed ? `, ${failed} failed` : "")
  );
  console.log(`${tinify.compressionCount} compressions used this month.`);
  console.log("\nFilenames changed where PNGs became JPEGs — update index.html to match.");
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
