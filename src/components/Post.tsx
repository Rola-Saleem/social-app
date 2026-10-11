import {
  Bookmark,
  MessageCircle,
  Pencil,
  Share2,
  ThumbsUp,
  Trash,
  X,
  ImagePlus,
} from "lucide-react";

import type { PostI } from "../interfaces/postI";
import type { CommentI } from "../interfaces/commentI";

import Comment from "./Comment";
import EditPost from "./EditPosts";
import postsService from "../services/postsService";
import commentService from "../services/commentService";

import { useContext, useEffect, useRef, useState } from "react";
import { authContext } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";

interface Props {
  post: PostI | undefined;
  deletePost: any;
  getAllPosts: any;
  createComment: (postId: string, formData: FormData) => Promise<any>;
  deleteComment: any;
  editComment: any;
  comments?: CommentI[];
}

export default function Post({
  post,
  deletePost,
  getAllPosts,
  createComment,
  deleteComment,
  editComment,
  comments,
}: Props) {
  const { userData } = useContext(authContext);
  const navigate = useNavigate();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (!post) return;

    const userId = userData?._id;
    const postLikes = Array.isArray(post.likes) ? post.likes : [];

    const hasLiked = userId
      ? postLikes.some((like: any) => {
          if (typeof like === "string") return like === userId;

          return (
            like?._id === userId ||
            like?.id === userId ||
            like?.user?._id === userId
          );
        })
      : false;

    setLiked(hasLiked);
    setLikesCount(post.likesCount ?? postLikes.length);
    setBookmarked(post.bookmarked ?? false);
  }, [post, userData?._id]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  if (!post) {
    return <div className="py-10 text-center">Loading...</div>;
  }

  async function handleDelete() {
    try {
      await deletePost(post._id);
      setShowDeleteModal(false);
      await getAllPosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setActionError("Please select an image.");
      event.target.value = "";
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setCommentImage(file);
    setImagePreview(URL.createObjectURL(file));
    setActionError("");
  }

  function removeCommentImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setCommentImage(null);
    setImagePreview("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  async function handleCreateComment() {
    if ((!commentContent.trim() && !commentImage) || isLoading) return;

    setIsLoading(true);
    setActionError("");

    try {
      const formData = new FormData();

      if (commentContent.trim()) {
        formData.append("content", commentContent.trim());
      }

      if (commentImage) {
        formData.append("image", commentImage);
      }

      await createComment(post._id, formData);

      setCommentContent("");
      removeCommentImage();

      await getAllPosts();
    } catch (error: any) {
      console.error("Failed to create comment:", error);

      setActionError(
        error.response?.data?.message || "Failed to create comment."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLike() {
    if (actionLoading) return;

    setActionLoading(true);
    setActionError("");

    try {
      await postsService.likePost(post._id);

      const nextLiked = !liked;

      setLiked(nextLiked);
      setLikesCount((previous) =>
        Math.max(0, previous + (nextLiked ? 1 : -1))
      );

      await getAllPosts();
    } catch (error: any) {
      console.error("Like error:", error.response?.data || error.message);

      setActionError(
        error.response?.data?.message || "Failed to like post."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBookmark() {
    if (actionLoading) return;

    setActionLoading(true);
    setActionError("");

    try {
      await postsService.bookmarkPost(post._id);

      const nextBookmarked = !bookmarked;
      setBookmarked(nextBookmarked);

      setActionMessage(
        nextBookmarked ? "Post saved successfully." : "Bookmark removed."
      );
    } catch (error: any) {
      console.error("Bookmark error:", error.response?.data);

      setActionError(
        error.response?.data?.message || "Failed to save post."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleShare() {
    try {
      setActionError("");
      setActionMessage("");

      await postsService.sharePost(post._id);

      const postUrl = `${window.location.origin}/post/${post._id}`;

      if (navigator.share) {
        await navigator.share({
          title: "Check out this post",
          url: postUrl,
        });
      } else {
        await navigator.clipboard.writeText(postUrl);
        setActionMessage("Post link copied successfully!");
      }

      await getAllPosts();
    } catch (error: any) {
      if (error.name === "AbortError") return;

      console.error("Share error:", error.response?.data || error.message);

      setActionError(
        error.response?.data?.message || "Failed to share post."
      );
    }
  }

  const isOwner = post.user?._id === userData?._id;

  return (
    <>
      <article className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={post.user?.photo}
              alt={post.user?.name || "User"}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />

            <div className="min-w-0">
              <h3 className="truncate font-semibold text-gray-900">
                {post.user?.name || "User"}
              </h3>
              <p className="truncate text-sm text-gray-500">
                @{post.user?.username || "user"}
              </p>
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="rounded-full p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                aria-label="Edit post"
              >
                <Pencil size={19} />
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="rounded-full p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete post"
              >
                <Trash size={19} />
              </button>
            </div>
          )}
        </div>

        {post.body && (
          <div className="px-4 pb-4">
            <p className="whitespace-pre-wrap break-words text-gray-800">
              {post.body}
            </p>
          </div>
        )}

        {post.image && (
          <div className="w-full bg-gray-50">
            <img
              src={post.image}
              alt="Post"
              className="max-h-[600px] w-full object-contain"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <ThumbsUp size={17} className="text-blue-500" />
            {likesCount}
          </span>

          <div className="flex gap-3">
            <span>{post.commentsCount ?? 0} comments</span>
            <span>{post.sharesCount ?? 0} shares</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          <button
            type="button"
            onClick={handleLike}
            disabled={actionLoading}
            aria-pressed={liked}
            className={`flex items-center justify-center gap-2 rounded-lg py-3 hover:bg-blue-50 disabled:opacity-50 ${
              liked ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <ThumbsUp size={19} fill={liked ? "currentColor" : "none"} />
            <span className="text-sm font-medium">Like</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/post/${post._id}`)}
            className="flex items-center justify-center gap-2 rounded-lg py-3 text-gray-600 hover:bg-gray-100"
          >
            <MessageCircle size={19} />
            <span className="text-sm font-medium">Comment</span>
          </button>

          <button
            type="button"
            onClick={handleBookmark}
            disabled={actionLoading}
            className={`flex items-center justify-center gap-2 rounded-lg py-3 hover:bg-purple-50 disabled:opacity-50 ${
              bookmarked ? "text-purple-600" : "text-gray-600"
            }`}
          >
            <Bookmark
              size={19}
              fill={bookmarked ? "currentColor" : "none"}
            />
            <span className="text-sm font-medium">Save</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-lg py-3 text-gray-600 hover:bg-green-50 hover:text-green-600"
          >
            <Share2 size={19} />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>

        {actionError && (
          <div role="alert" className="mx-4 mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {actionError}
          </div>
        )}

        {actionMessage && (
          <div role="status" className="mx-4 mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {actionMessage}
          </div>
        )}

        {/* Add comment with optional image */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleCreateComment();
          }}
          className="border-t border-gray-100 px-4 py-4"
        >
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              placeholder="Write a comment..."
              disabled={isLoading}
              className="min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white"
            />

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isLoading}
              aria-label="Add image"
              title="Add image"
              className="rounded-full p-3 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              <ImagePlus size={21} />
            </button>

            <button
              type="submit"
              disabled={isLoading || (!commentContent.trim() && !commentImage)}
              className="rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>

          {imagePreview && (
            <div className="relative mt-3 inline-block">
              <img
                src={imagePreview}
                alt="Comment preview"
                className="max-h-48 max-w-full rounded-xl border object-contain"
              />

              <button
                type="button"
                onClick={removeCommentImage}
                aria-label="Remove image"
                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </form>

        {comments && comments.length > 0 ? (
          <div className="border-t border-gray-100">
            {comments.map((comment) => (
              <Comment
                key={comment._id}
                comment={comment}
                deleteComment={deleteComment}
                editComment={editComment}
                postOwnerId={post.user?._id}
              />
            ))}
          </div>
        ) : post.topComment ? (
          <div className="border-t border-gray-100">
            <Comment
              comment={post.topComment}
              deleteComment={deleteComment}
              editComment={editComment}
              postOwnerId={post.user?._id}
            />
          </div>
        ) : null}
      </article>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Delete Post</h2>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                aria-label="Close"
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-4 text-gray-600">
              Are you sure you want to delete this post?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border px-5 py-2"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <EditPost
          post={post}
          getAllPosts={getAllPosts}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}