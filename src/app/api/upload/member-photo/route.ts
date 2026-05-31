import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { blobServiceClient, containerName, generateSasUrl } from "@/lib/azure"
import prisma from "@/lib/prisma"
import { randomUUID } from "crypto"

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_PHOTOS = 25
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const thumb = formData.get("thumb") as File | null

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, or WebP allowed" }, { status: 400 })
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      _count: { select: { photos: { where: { delete: false } } } },
    },
  })

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })

  if (member._count.photos >= MAX_PHOTOS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_PHOTOS} photos allowed` },
      { status: 400 }
    )
  }

  const uid = randomUUID()
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const photoBlobName = `${member.id}/photo/${uid}.${ext}`
  const thumbBlobName = `${member.id}/thumbnail/${uid}.${ext}`

  const containerClient = blobServiceClient.getContainerClient(containerName)
  const photoClient = containerClient.getBlockBlobClient(photoBlobName)
  const thumbClient = containerClient.getBlockBlobClient(thumbBlobName)

  const photoBuffer = Buffer.from(await file.arrayBuffer())
  await photoClient.uploadData(photoBuffer, {
    blobHTTPHeaders: { blobContentType: file.type },
  })

  if (thumb && thumb.size > 0) {
    const thumbBuffer = Buffer.from(await thumb.arrayBuffer())
    await thumbClient.uploadData(thumbBuffer, {
      blobHTTPHeaders: { blobContentType: file.type },
    })
  } else {
    await thumbClient.uploadData(photoBuffer, {
      blobHTTPHeaders: { blobContentType: file.type },
    })
  }

  const photo = await prisma.photo.create({
    data: {
      url: photoClient.url,
      thumburl: thumbClient.url,
      memberId: member.id,
    },
    select: { id: true, url: true, thumburl: true },
  })

  return NextResponse.json({
    id: photo.id,
    url: generateSasUrl(photo.url) ?? "",
    thumburl: generateSasUrl(photo.thumburl) ?? "",
  })
}
