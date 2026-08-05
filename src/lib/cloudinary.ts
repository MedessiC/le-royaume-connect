type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  resource_type: string;
};

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset);

export async function uploadToCloudinary(file: File, folder: string, chunked = false) {
  if (!isCloudinaryConfigured || !cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary n'est pas configuré. Ajoutez VITE_CLOUDINARY_CLOUD_NAME et VITE_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const resourceType = file.type.startsWith("video/")
    ? "video"
    : file.type.startsWith("audio/")
      ? "audio"
      : "image";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);
  formData.append("resource_type", resourceType);
  if (chunked) {
    formData.append("chunk_size", "20000000");
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Échec d'upload Cloudinary: ${errorBody}`);
  }

  const data = (await response.json()) as CloudinaryUploadResult;
  return data.secure_url;
}
