import { randomUUID } from "node:crypto";
import { appendFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 18 * 1024 * 1024;
const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_FIELD_LENGTH = 2_000;

function detectImageExtension(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return ".jpg";
  if (
    bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return ".png";
  if (
    bytes.length >= 12 && String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP"
  ) return ".webp";
  return null;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return Response.json({ error: "The assessment is too large. Please upload fewer or smaller photos." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Please send a valid assessment form." }, { status: 400 });
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const emailAddress = String(formData.get("emailAddress") ?? "").trim().toLowerCase();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const consent = formData.get("consent");
  if (
    fullName.length < 2 || fullName.length > 120 ||
    emailAddress.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress) ||
    phoneNumber.length < 7 || phoneNumber.length > 32 ||
    consent !== "I understand that this consultation provides skincare guidance and does not replace a medical diagnosis or treatment from a licensed healthcare professional."
  ) {
    return Response.json({ error: "Please complete the required contact fields and consent." }, { status: 400 });
  }

  const values: Record<string, string | string[]> = {};
  let fieldCount = 0;
  for (const [key, value] of formData.entries()) {
    if (key === "photos") continue;
    if (typeof value !== "string") continue;
    fieldCount += 1;
    if (key.length > 80 || value.length > MAX_FIELD_LENGTH || fieldCount > 100) {
      return Response.json({ error: "Some assessment answers are too long. Please review your answers and try again." }, { status: 400 });
    }
    const existing = values[key];
    if (existing === undefined) values[key] = value;
    else if (Array.isArray(existing)) existing.push(value);
    else values[key] = [existing, value];
  }

  const photos = formData.getAll("photos").filter((value): value is File => value instanceof File && value.size > 0);
  if (photos.length > MAX_PHOTOS) {
    return Response.json({ error: `Please upload no more than ${MAX_PHOTOS} photos.` }, { status: 400 });
  }
  for (const photo of photos) {
    if (photo.size > MAX_PHOTO_BYTES) {
      return Response.json({ error: "Photos must be smaller than 5 MB each." }, { status: 413 });
    }
  }
  const submittedTextBytes = Object.values(values).flat().reduce((total, value) => total + new TextEncoder().encode(value).byteLength, 0);
  const submittedPhotoBytes = photos.reduce((total, photo) => total + photo.size, 0);
  if (submittedTextBytes + submittedPhotoBytes > MAX_REQUEST_BYTES) {
    return Response.json({ error: "The assessment is too large. Please upload fewer or smaller photos." }, { status: 413 });
  }

  const photoPayloads: Array<{ bytes: Uint8Array; extension: string }> = [];
  for (const photo of photos) {
    const bytes = new Uint8Array(await photo.arrayBuffer());
    const extension = detectImageExtension(bytes);
    if (!extension) {
      return Response.json({ error: "Photos must be valid JPEG, PNG, or WebP images." }, { status: 400 });
    }
    photoPayloads.push({ bytes, extension });
  }

  const id = randomUUID();
  const dataDirectory = path.join(process.cwd(), "data");
  const uploadDirectory = path.join(dataDirectory, "skin-assessment-uploads", id);
  const photoNames: string[] = [];
  try {
    if (photos.length > 0) await mkdir(uploadDirectory, { recursive: true, mode: 0o700 });
    for (const [index, photo] of photoPayloads.entries()) {
      const safeName = `${index + 1}${photo.extension}`;
      await writeFile(path.join(uploadDirectory, safeName), photo.bytes, { mode: 0o600, flag: "wx" });
      photoNames.push(safeName);
    }

    const entry = { id, createdAt: new Date().toISOString(), ...values, photos: photoNames };
    await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
    await appendFile(path.join(dataDirectory, "skin-assessments.jsonl"), `${JSON.stringify(entry)}\n`, { encoding: "utf8", mode: 0o600 });
  } catch {
    return Response.json({ error: "We couldn't save your assessment right now." }, { status: 500 });
  }

  return Response.json({ received: true, id }, { status: 201 });
}
