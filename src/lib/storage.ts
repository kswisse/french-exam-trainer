import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadFile(
  buffer: Buffer,
  path: string,
  contentType: string
) {
  const { data, error } = await supabase.storage
    .from("exam-documents")
    .upload(path, buffer, { contentType, upsert: false });
  if (error) throw error;
  return data;
}

export async function getFileUrl(path: string) {
  const { data } = await supabase.storage
    .from("exam-documents")
    .createSignedUrl(path, 3600);
  return data?.signedUrl;
}

export async function downloadFile(path: string): Promise<Buffer> {
  const { data, error } = await supabase.storage
    .from("exam-documents")
    .download(path);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}
