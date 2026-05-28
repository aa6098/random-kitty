import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { gcsBucket } from "@/lib/gcs"
import path from "path"

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const memberId = (formData.get("memberId") as string)?.trim()

  if (!file || file.size === 0) {
    return Response.json({ error: "No file provided" }, { status: 400 })
  }
  if (!memberId) {
    return Response.json({ error: "memberId is required" }, { status: 400 })
  }

  // Verify the member belongs to the authenticated user
  const member = await prisma.member.findUnique({
    where: { id: memberId, userId: session.user.id },
  })
  if (!member) {
    return Response.json({ error: "Member not found" }, { status: 404 })
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = path.extname(file.name) || ".jpg"
    const objectPath = `${session.user.id}/${Date.now()}${ext}`

    const gcsFile = gcsBucket.file(objectPath)
    await gcsFile.save(buffer, { contentType: file.type || "image/jpeg" })
    await gcsFile.makePublic()

    const url = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${objectPath}`

    const photo = await prisma.photo.create({
      data: { url, publicId: objectPath, memberId },
      select: { id: true, url: true },
    })

    return Response.json({ photo })
  } catch {
    return Response.json({ error: "Upload failed. Please try again." }, { status: 500 })
  }
}
