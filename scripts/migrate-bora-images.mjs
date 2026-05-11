import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sourceDir = process.env.BORA_SDR_DIR
  ? path.resolve(process.env.BORA_SDR_DIR)
  : path.resolve(process.cwd(), '..', 'bora_sdr');
const bucketName = 'product-images';

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL. Set them in the environment before running this migration.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const files = (await fs.readdir(sourceDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.jpeg'))
  .map((entry) => entry.name)
  .sort();

if (files.length === 0) {
  console.log(`No JPEG files found in ${sourceDir}`);
  process.exit(0);
}

const uploaded = [];

for (const fileName of files) {
  const sourcePath = path.join(sourceDir, fileName);
  const originalName = fileName.replace(/-sdr(?=\.jpeg$)/i, '');
  const bucketPath = `products/${originalName}`;
  const fileBuffer = await fs.readFile(sourcePath);

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(bucketPath, fileBuffer, {
      upsert: true,
      contentType: 'image/jpeg',
      cacheControl: '31536000',
    });

  if (error) {
    throw new Error(`Failed to upload ${fileName} -> ${bucketPath}: ${error.message}`);
  }

  uploaded.push({ fileName, bucketPath });
  console.log(`Uploaded ${fileName} -> ${bucketPath}`);
}

console.log(`Done. ${uploaded.length} image(s) replaced in ${bucketName}.`);
