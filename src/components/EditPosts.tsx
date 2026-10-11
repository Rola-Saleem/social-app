import { useEffect, useRef, useState } from "react";
import { Image, X } from "lucide-react";
import postsService from "../services/postsService";
import type { PostI } from "../interfaces/postI";

interface EditPostProps {
  post: PostI;
  onClose: () => void;
  getAllPosts: () => void;
}

export default function EditPost({
  post,
  onClose,
  getAllPosts,
}: EditPostProps) {
  const [caption, setCaption] = useState(post.body || "");

  const [image, setImage] = useState<string | null>(
    post.image || null
  );

  const [imgFile, setImgFile] = useState<File | null>(null);

  // هل المستخدم حذف الصورة القديمة؟
  const [removeImage, setRemoveImage] = useState(false);

  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCaption(post.body || "");
    setImage(post.image || null);
    setImgFile(null);
    setRemoveImage(false);
  }, [post]);

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImgFile(file);

    // بما أنه اختار صورة جديدة، لا نريد حذف الصورة
    setRemoveImage(false);

    setError("");

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  function removeImageHandler() {
    setImage(null);
    setImgFile(null);

    // نخبر الـ API أن الصورة القديمة يجب حذفها
    setRemoveImage(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setError("");

    // إذا لا يوجد نص ولا صورة
    if (!caption.trim() && !image) {
      setError("Please write something or select an image");
      return;
    }

    try {
      const formData = new FormData();

      // Body
      if (caption.trim()) {
        formData.set("body", caption.trim());
      }

      // صورة جديدة
      if (imgFile) {
        formData.set("image", imgFile);
      }

      // حذف الصورة القديمة
      if (removeImage && !imgFile) {
        formData.set("removeImage", "true");
      }

      const response = await postsService.updatePost(
        post._id,
        formData
      );

      console.log(response);

      await getAllPosts();

      onClose();

    } catch (error: any) {
      console.log(error.response?.data || error);

      setError(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

          <h2 className="text-lg font-bold text-gray-900">
            Edit Post
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={20} />
          </button>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5"
        >

          {/* Caption */}
          <textarea
            autoFocus
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              setError("");
            }}
            placeholder="What's in your mind?"
            className="min-h-32 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          {/* Error */}
          {error && (
            <p className="mt-2 text-sm text-red-500">
              {error}
            </p>
          )}

          {/* Image */}
          {image && (
            <div className="relative mt-4 overflow-hidden rounded-lg border border-gray-200">

              <img
                src={image}
                alt="post"
                className="max-h-96 w-full object-cover"
              />

              {/* Remove image */}
              <button
                type="button"
                onClick={removeImageHandler}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
              >
                <X size={18} />
              </button>

            </div>
          )}

          {/* Buttons */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">

            {/* Upload image */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition hover:bg-gray-100"
              >
                <Image
                  size={20}
                  className="text-green-600"
                />

                <span>Image</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700"
              >
                Save Changes
              </button>

            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
