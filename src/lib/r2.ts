import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials are not configured");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

const BUCKET = process.env.R2_BUCKET_NAME ?? "dapfinance";

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string,
): Promise<string> {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return key;
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const client = getR2Client();
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn },
  );
}

export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 600,
): Promise<string> {
  const client = getR2Client();
  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn },
  );
}

export async function deleteFile(key: string): Promise<void> {
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: key }),
  );
}
