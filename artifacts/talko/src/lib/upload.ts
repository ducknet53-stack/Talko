import { auth } from "@/lib/firebase";

/**
 * Uploads an image file through the api-server proxy, which forwards it to
 * ImgBB using the server-side API key. The key never reaches the client.
 * Requires a signed-in user; the proxy verifies the Firebase ID token.
 */
export async function uploadImage(file: File): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Görsel yüklemek için giriş yapmalısın.");
  }
  const idToken = await user.getIdToken();

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${import.meta.env.BASE_URL}api/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || "Görsel yüklenemedi.");
  }

  const data = await res.json();
  return data.url as string;
}
