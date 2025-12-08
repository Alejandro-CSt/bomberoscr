import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import env from "./env";

const r2Client = new S3Client({
  region: "auto",
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY
  }
});

export async function getFromR2(key: string): Promise<Buffer | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key
    });
    const response = await r2Client.send(command);
    if (!response.Body) return null;
    const bytes = await response.Body.transformToByteArray();
    return Buffer.from(bytes);
  } catch (_error) {
    // Object doesn't exist or other error
    return null;
  }
}

export async function uploadToR2(
  key: string,
  body: Buffer | ArrayBuffer,
  contentType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: body instanceof Buffer ? body : new Uint8Array(body),
    ContentType: contentType
  });
  await r2Client.send(command);
}

export default r2Client;
