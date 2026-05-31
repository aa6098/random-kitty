import {
  BlobServiceClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob"

export const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
)

export const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!

export function generateSasUrl(blobUrl: string | null | undefined, expiresInMinutes = 60): string | null {
  if (!blobUrl) return null
  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING!
  const parts = conn.split(";").reduce<Record<string, string>>((acc, part) => {
    const idx = part.indexOf("=")
    if (idx > -1) acc[part.slice(0, idx)] = part.slice(idx + 1)
    return acc
  }, {})

  const credential = new StorageSharedKeyCredential(parts.AccountName, parts.AccountKey)

  let url: URL
  try {
    url = new URL(blobUrl)
  } catch {
    return null
  }

  const [container, ...rest] = url.pathname.slice(1).split("/")
  const blobName = rest.join("/")

  const sas = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      expiresOn: new Date(Date.now() + expiresInMinutes * 60 * 1000),
    },
    credential
  )

  return `${blobUrl}?${sas.toString()}`
}
