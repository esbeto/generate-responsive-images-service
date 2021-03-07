//@ts-check
import { resolve } from "path";
import sharp from "sharp";
import mkdirp from "mkdirp";
import defaultConfig from "./default-config.json";

async function resizeImage(buffer, options) {
  const { size, name, ext, scale, dist, relativePath } = options;

  const sizeStr = `_${size}`;
  const scaleStr = scale === 1 ? "" : `@${scale}x`;

  const filename = `${name}${sizeStr}${scaleStr}.${ext}`;
  const filePath = `${dist}/${relativePath}/${filename}`;

  const sizeInt = parseInt(options.imageSize[size], 10);
  if (!sizeInt) {
    throw new Error("The size parameter is invalid");
  }

  let sharpObject = sharp(buffer).resize(sizeInt * scale);
  switch (ext) {
    case "webp":
      sharpObject = sharpObject.webp();
      break;
    case "png":
      sharpObject = sharpObject.png();
      break;
    default:
      const imageConfig = options.jpeg || {};
      sharpObject = sharpObject.jpeg(imageConfig);
  }

  return sharpObject.toFile(filePath).then(() => {
    return { relativePath: `${relativePath}/${filename}` };
  });
}

export default function generateImages(buffer, options) {
  return new Promise((fulfill, reject) => {
    const opts = Object.assign(defaultConfig, options || {});
    const name = opts.name;

    let dist, relativePath;
    if (opts.dist) {
      relativePath = opts.relativePath || `${name}`;
      dist = opts.dist;
    } else {
      relativePath = opts.relativePath || `${name}`;
      dist = resolve(process.cwd(), "/");
    }

    if (opts.medium) {
      opts.imageSize.medium =
        parseInt(opts.medium, 10) || opts.imageSize.medium;
    }

    if (opts.small) {
      opts.imageSize.small = parseInt(opts.small, 10) || opts.imageSize.small;
    }

    mkdirp(`${dist}/${relativePath}`).then((made) => {
      if (!made) {
        reject();
        return;
      }

      const promises = [];
      const conditions = opts.preset;
      for (const cond of conditions) {
        cond.name = name;
        cond.ext = cond.ext || opts.ext;
        cond.scale = parseInt(cond.scale, 10) || 1;
        cond.dist = dist;
        cond.relativePath = relativePath;
        cond.imageSize = opts.imageSize;
        promises.push(resizeImage(buffer, cond));
      }

      Promise.all(promises)
        .then((results) => {
          const relativePaths = results.map((result) => result.relativePath);
          fulfill(relativePaths);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
}
