import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const prerender = false;

import { ADMIN_CONFIG } from '../../lib/constants';

// Path to the gallery images in the source directory
const GALLERY_DIR = path.resolve('src/assets/gallery');

export const POST: APIRoute = async ({ request }) => {
    const data = await request.formData();
    const action = data.get('action');
    const password = data.get('password')?.toString().trim();

    // Basic password check
    const adminPassword = ADMIN_CONFIG.password;
    if (!adminPassword || password !== adminPassword.trim()) {
        return new Response(JSON.stringify({ error: `Unauthorized: Admin password not configured correctly.` }), { status: 401 });
    }

    if (action === 'upload') {
        const file = data.get('image') as File;
        if (!file) {
            return new Response(JSON.stringify({ error: 'No image provided' }), { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = path.join(GALLERY_DIR, file.name);

        try {
            await fs.writeFile(filePath, buffer);
            return new Response(JSON.stringify({ success: true, filename: file.name }), { status: 200 });
        } catch (err) {
            return new Response(JSON.stringify({ error: 'Failed to save image' }), { status: 500 });
        }
    }

    if (action === 'delete') {
        const filename = data.get('filename') as string;
        if (!filename) {
            return new Response(JSON.stringify({ error: 'No filename provided' }), { status: 400 });
        }

        const filePath = path.normalize(path.join(GALLERY_DIR, filename));

        try {
            // Security check: ensure path is within GALLERY_DIR
            const absoluteGalleryDir = path.normalize(GALLERY_DIR);
            if (!filePath.startsWith(absoluteGalleryDir)) {
                return new Response(JSON.stringify({ error: 'Forbidden: Invalid path' }), { status: 403 });
            }

            // Check if file exists before deleting
            await fs.access(filePath);
            await fs.unlink(filePath);

            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (err: any) {
            const msg = err.code === 'ENOENT' ? 'File not found' : err.message;
            return new Response(JSON.stringify({ error: `Deletion failed: ${msg}` }), { status: 500 });
        }
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
};
