import { Storage } from "@google-cloud/storage"

const credentials = JSON.parse(process.env.GCS_SERVICE_ACCOUNT_KEY!)
const storage = new Storage({ credentials })
export const gcsBucket = storage.bucket(process.env.GCS_BUCKET_NAME!)
