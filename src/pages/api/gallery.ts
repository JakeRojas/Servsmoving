import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { ADMIN_CONFIG } from '../../lib/constants';

export const POST: APIRoute = async ({ request }) => {
    const data = await request.formData();
    const action = data.get('action');
    const password = data.get('password')?.toString().trim();

    // Basic password check
    const adminPassword = ADMIN_CONFIG.password;
    if (!adminPassword || password !== adminPassword.trim()) {
        return new Response(JSON.stringify({ error: `Unauthorized: Admin password not configured correctly.` }), { status: 401 });
    }

    if (!supabase) {
        return new Response(JSON.stringify({ error: "Supabase storage is not configured. Check your environment variables." }), { status: 503 });
    }

    if (action === 'upload') {
        const file = data.get('image') as File;
        if (!file) {
            return new Response(JSON.stringify({ error: 'No image provided' }), { status: 400 });
        }

        // Clean filename: remove special characters, keep extension
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const buffer = await file.arrayBuffer();

        try {
            const { data: uploadData, error } = await supabase.storage
                .from('gallery')
                .upload(fileName, buffer, {
                    contentType: file.type,
                    upsert: true
                });

            if (error) throw error;

            return new Response(JSON.stringify({ success: true, filename: fileName }), { status: 200 });
        } catch (err: any) {
            return new Response(JSON.stringify({ error: `Upload failed: ${err.message}` }), { status: 500 });
        }
    }

    if (action === 'delete') {
        const filename = data.get('filename') as string;
        if (!filename) {
            return new Response(JSON.stringify({ error: 'No filename provided' }), { status: 400 });
        }

        try {
            const { error } = await supabase.storage
                .from('gallery')
                .remove([filename]);

            if (error) throw error;

            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (err: any) {
            return new Response(JSON.stringify({ error: `Deletion failed: ${err.message}` }), { status: 500 });
        }
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
};
