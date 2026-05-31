import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { blobServiceClient, containerName } from "@/lib/azure"
import prisma from "@/lib/prisma"

const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File exceeds 2 MB limit" }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, or WebP allowed" }, { status: 400 })
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  const folderId = member?.id ?? session.user.id
  const ext = file.name.split(".").pop() ?? "jpg"
  const blobName = `${folderId}/profileImage/profile.${ext}`

  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  const buffer = Buffer.from(await file.arrayBuffer())
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: file.type },
  })

  return NextResponse.json({ url: blockBlobClient.url })
}
