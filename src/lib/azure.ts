import { BlobServiceClient } from "@azure/storage-blob"

export const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
)

export const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!
