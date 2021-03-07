#!/usr/bin/env node
import { Command } from "commander";
import { parse, resolve } from "path";
import { readFile, readdirSync } from "fs";
import generateImages from "../generate-images.mjs";

function readFileAndGenerate(filePath, dist, small, medium) {
  return new Promise((resolve, reject) => {
    readFile(filePath, (err, buffer) => {
      if (err) reject(err);
      const imagePath = parse(filePath);
      resolve(
        generateImages(buffer, {
          dist: dist,
          name: imagePath.name,
          ext: imagePath.ext.replace(/^\./, ""),
          small: small,
          medium: medium,
        })
      );
    });
  });
}

function main(args) {
  const program = new Command();
  program
    .version("1.1.3")
    .option("-i, --input <file>")
    .option("-s, --src <directory>", "Use files in the directory")
    .option("-d, --dist <dist>")
    .option("--small <n>", "Width for small image", parseInt)
    .option("--medium <n>", "Width for medium image", parseInt)
    .parse(args);

  const options = program.opts();

  let files = [];
  if (options.src) {
    const dir = resolve(options.src);
    readdirSync(dir).forEach((file) => {
      const filePath = parse(file);
      if (/\.(png|gif|jpe?g)/i.test(filePath.ext)) {
        const absolutePath = resolve(process.cwd(), `${dir}/${file}`);
        files.push(absolutePath);
      }
    });
  }

  if (options.input) {
    const absolutePath = resolve(process.cwd(), options.input);
    files.push(resolve(absolutePath));
  }

  const promises = [];
  const dist = resolve(process.cwd(), options.dist);
  for (const filePath of files) {
    promises.push(
      readFileAndGenerate(filePath, dist, options.small, options.medium)
    );
  }

  Promise.all(promises)
    .then((results) => {
      const resutlStr = results
        .map((result) => {
          return result.map((filePath) => `${dist}/${filePath}`).join("\n");
        })
        .join("\n");
      process.stdout.write(`${resutlStr}\n`);
      process.exit(0);
    })
    .catch((err) => {
      process.stderr.write(err.stack + "\n");
      process.exit(1);
    });
}

main(process.argv);

export default main;
