import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

const s3 = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT ?? 'http://localhost:9000',
  region: process.env.STORAGE_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY ?? 'minioadmin',
    secretAccessKey: process.env.STORAGE_SECRET_KEY ?? 'minioadmin',
  },
  forcePathStyle: true,
})

const BUCKET = process.env.STORAGE_BUCKET ?? 'hotwheels'

export async function uploadFile(buffer: Buffer, mimeType: string, folder = 'cars'): Promise<string> {
  const ext = mimeType.split('/')[1] ?? 'jpg'
  const key = `${folder}/${uuidv4()}.${ext}`

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read',
    })
  )

  return `${process.env.STORAGE_ENDPOINT}/${BUCKET}/${key}`
}

export async function deleteFile(url: string): Promise<void> {
  const key = url.split(`${BUCKET}/`)[1]
  if (!key) return
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}
