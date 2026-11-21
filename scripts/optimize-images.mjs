// Optimiza las imágenes fuente de src/assets/images: máx. 1600 px de ancho, WebP calidad 82.
// Los logos (marca/, clientes/) se mantienen en PNG para conservar la transparencia nítida.
// Uso: node scripts/optimize-images.mjs [carpeta]
import { readdir, stat, unlink, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// En Windows sharp puede mantener abierto el archivo de entrada: se lee a memoria y se desactiva la caché.
sharp.cache(false);

const raiz = process.argv[2] ?? 'src/assets/images';
const MAX = 1600;
const CONSERVAR_PNG = ['marca', 'clientes'];

async function* archivos(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* archivos(p);
    else if (/\.(png|jpe?g)$/i.test(e.name)) yield p;
  }
}

let antes = 0;
let despues = 0;
for await (const archivo of archivos(raiz)) {
  const tam = (await stat(archivo)).size;
  antes += tam;
  const esLogo = CONSERVAR_PNG.some((c) => archivo.split(path.sep).includes(c));
  const img = sharp(await readFile(archivo)).resize({ width: MAX, withoutEnlargement: true });
  if (esLogo) {
    await writeFile(archivo, await img.png({ compressionLevel: 9, palette: true }).toBuffer());
    despues += (await stat(archivo)).size;
  } else {
    const destino = archivo.replace(/\.(png|jpe?g)$/i, '.webp');
    await img.webp({ quality: 82 }).toFile(destino);
    if (destino !== archivo) await unlink(archivo);
    despues += (await stat(destino)).size;
  }
}
console.log(`Imágenes: ${(antes / 1e6).toFixed(1)} MB → ${(despues / 1e6).toFixed(1)} MB`);
