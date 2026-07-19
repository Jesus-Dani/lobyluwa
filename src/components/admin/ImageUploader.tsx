"use client";

import { useState } from "react";
import Image from "next/image";
import { cloudinaryImageUrl } from "@/lib/cloudinary-url";
import styles from "./ImageUploader.module.css";

export function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    setUploading(true);
    setError(null);

    try {
      const signResponse = await fetch("/api/admin/cloudinary-sign", { method: "POST" });
      if (!signResponse.ok) throw new Error("Could not get upload signature");
      const { timestamp, signature, folder, apiKey, cloudName } = await signResponse.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);
      formData.append("api_key", apiKey);

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      if (!uploadResponse.ok) throw new Error("Image upload failed");
      const data = await uploadResponse.json();

      onChange([...images, data.public_id]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(publicId: string) {
    onChange(images.filter((id) => id !== publicId));
  }

  return (
    <div>
      <div className={styles.grid}>
        {images.map((publicId) => (
          <div key={publicId} className={styles.thumb}>
            <Image src={cloudinaryImageUrl(publicId, 200)} alt="" fill style={{ objectFit: "cover" }} />
            <button type="button" onClick={() => removeImage(publicId)} className={styles.removeBtn}>
              ×
            </button>
          </div>
        ))}
        <label className={styles.uploadTile}>
          {uploading ? "Uploading..." : "+ Add image"}
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} hidden />
        </label>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
