import { useRef, useState } from "react";
import { Image, X } from "lucide-react";
import postsService from "../services/postsService";

export default function CreatePost({
  getAllPosts,
}: {
  getAllPosts: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleOpen() {
    setIsOpen(true);
    setError("");
  }

  function handleCancel() {
    setIsOpen(false);
    setCaption("");
    setImage(null);
    setImgFile(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImgFile(file);
    setError("");

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  async function createPost(event: React.FormEvent) {
    event.preventDefault();

    setError("");

    // لازم يكون فيه نص أو صورة على الأقل
    if (!caption.trim() && !imgFile) {
      setError("Please write something or select an image");
      return;
    }

    try {
      const formdata = new FormData();

      // أضف الـ body فقط إذا المستخدم كتب caption
      if (caption.trim()) {
        formdata.set("body", caption.trim());
      }

      // أضف الصورة إذا المستخدم اختار صورة
      if (imgFile) {
        formdata.set("image", imgFile);
      }

      const response = await postsService.createPost(formdata);

      console.log(response);

      // تحديث البوستات
      await getAllPosts();

      // Reset form
      setCaption("");
      setImage(null);
      setImgFile(null);
      setIsOpen(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.log(error.response?.data || error);

      setError(
        error.response?.data?.message ||
        "Something went wrong"
      );
    }
  }

  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">

      {/* Closed State */}
      {!isOpen ? (
        <button
          onClick={handleOpen}
          className="w-full rounded-lg bg-gray-100 px-4 py-3 text-left text-gray-500 transition hover:bg-gray-200"
        >
          What's in your mind?
        </button>
      ) : (
        <form onSubmit={createPost}>

          {/* Caption */}
          <textarea
            autoFocus
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              setError("");
            }}
            placeholder="What's in your mind?"
            className="min-h-30 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          {/* Error */}
          {error && (
            <p className="mt-2 text-sm text-red-500">
              {error}
            </p>
          )}

          {/* Image Preview */}
          {image && (
            <div className="relative mt-3 overflow-hidden rounded-lg border border-gray-200">
              <img
                src={image}
                alt="preview"
                className="max-h-80 w-full object-cover"
              />

              {/* Remove Image */}
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImgFile(null);

                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">

            {/* Upload Image */}
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
                onClick={() => fileInputRef.current?.click()}
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

              {/* Cancel */}
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg px-4 py-2 text-gray-600 transition hover:bg-gray-100"
              >
                Cancel
              </button>

              {/* Post */}
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700"
              >
                Post
              </button>

            </div>
          </div>
        </form>
      )}
    </div>
  );
}
