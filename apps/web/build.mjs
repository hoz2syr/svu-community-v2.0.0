/**
 * Build script — copies js/ → public/js/ then runs Vite build.
 * Per-file copy with retries avoids cpSync recursive crashes on OneDrive / Windows locks.
 */
import { existsSync } from 'fs';
import { readdir, mkdir, copyFile, writeFile } from 'fs/promises';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { build } from 'vite';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const publicDir = resolve(root, 'public');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function copyFileWithRetry(src, dest, maxAttempts = 8) {
  await mkdir(dirname(dest), { recursive: true });
  let lastErr;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await copyFile(src, dest);
      return;
    } catch (e) {
      lastErr = e;
      await sleep(80 * (i + 1));
    }
  }
  throw lastErr;
}

async function copyDirTree(src, dest) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const ent of entries) {
    const from = join(src, ent.name);
    const to = join(dest, ent.name);
    if (ent.isDirectory()) {
      await copyDirTree(from, to);
    } else {
      await copyFileWithRetry(from, to);
    }
  }
}

async function main() {
  await mkdir(publicDir, { recursive: true });
  console.log('[build] Copying js/ → public/js/ …');
  await copyDirTree(resolve(root, 'js'), resolve(publicDir, 'js'));

  if (existsSync(resolve(root, 'vendor'))) {
    console.log('[build] Copying vendor/ → public/vendor/ …');
    await copyDirTree(resolve(root, 'vendor'), resolve(publicDir, 'vendor'));
  }

  if (existsSync(resolve(root, 'env.js'))) {
    await copyFileWithRetry(resolve(root, 'env.js'), resolve(publicDir, 'env.js'));
  } else {
    // Generate env.js from VITE_ environment variables (for CI/CD builds)
    const envContent = `window.SVU_ENV = window.SVU_ENV || {
  SUPABASE_URL: '${process.env.VITE_SUPABASE_URL || ''}',
  SUPABASE_ANON_KEY: '${process.env.VITE_SUPABASE_ANON_KEY || ''}',
};`;
    await writeFile(resolve(publicDir, 'env.js'), envContent);
    console.log('[build] Generated env.js from environment variables');
  }

  if (existsSync(resolve(root, '_headers'))) {
    await copyFileWithRetry(resolve(root, '_headers'), resolve(publicDir, '_headers'));
  }

  console.log('[build] Static assets copied to public/');

  await build({
    root,
    configFile: resolve(root, 'vite.config.js'),
    mode: 'production',
  });
  console.log('[build] ✓ Build complete');
}

main().catch((e) => {
  console.error('[build] ✗ Build failed');
  console.error(e?.message || e);
  process.exit(1);
});
