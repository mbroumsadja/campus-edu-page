import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        if (clientPayload !== process.env.ADMIN_SECRET) {
          throw new Error("Non autorisé");
        }
        return {
          allowedContentTypes: [
            "application/vnd.android.package-archive",
            "application/octet-stream",
          ],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500 Mo
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 400 }
    );
  }
}