import { verifyExternalJWT } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

export async function extractAndVerifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "Missing or invalid Authorization header." },
        { status: 401 },
      ),
    };
  }

  try {
    const token = authHeader.slice(7);
    const claims = await verifyExternalJWT(token);
    return { claims };
  } catch {
    return {
      error: NextResponse.json(
        { error: "Invalid or expired token." },
        { status: 401 },
      ),
    };
  }
}

export async function findOrCreateSubject(
  payload: Awaited<ReturnType<typeof getPayload>>,
  claims: {
    sub: string;
    email: string;
    given_name: string;
    family_name: string;
  },
) {
  const existing = await payload.find({
    collection: "subjects",
    where: { id: { equals: claims.sub } },
    limit: 1,
    overrideAccess: true,
  });

  if (existing.docs.length > 0) {
    return existing.docs[0];
  }

  return payload.create({
    collection: "subjects",
    data: {
      id: claims.sub,
      email: claims.email,
      firstName: claims.given_name,
      lastName: claims.family_name,
    },
    overrideAccess: true,
  });
}
