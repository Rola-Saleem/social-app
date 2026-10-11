import {
  MoreHorizontal,
  Pencil,
  Trash,
  X,
  Heart,
  MessageCircle,
} from "lucide-react";

import { useContext, useState } from "react";
import type { FormEvent } from "react";

import type { CommentI } from "../interfaces/commentI";
import { authContext } from "../contexts/authContext";
import commentService from "../services/commentService";

interface Props {
  comment: CommentI;
  postOwnerId?: string;

  deleteComment: (
    postId: string,
    commentId: string
  ) => Promise<any>;

  editComment: (
    postId: string,
    commentId: string,
    formData: FormData
  ) => Promise<any>;
}

export default function Comment({
  comment,
  postOwnerId,
  deleteComment,
  editComment,
}: Props) {
  const { userData } = useContext(authContext);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(
    comment.content ?? ""
  );
  const [isEditing, setIsEditing] = useState(false);

  const [showMenu, setShowMenu] = useState(false);

  // Permissions
  const isCommentOwner =
    comment.commentCreator?._id === userData?._id;

  const isPostOwner =
    !!postOwnerId &&
    postOwnerId === userData?._id;

  const canDelete = isCommentOwner || isPostOwner;

  // Like
  const [isLiking, setIsLiking] = useState(false);

  const [isLiked, setIsLiked] = useState(() => {
    const userId = userData?._id;

    return (
      comment.likes?.some((like: any) => {
        if (typeof like === "string") {
          return like === userId;
        }

        return (
          like?._id === userId ||
          like?.id === userId ||
          like?.user?._id === userId
        );
      }) ?? false
    );
  });

  const [likesCount, setLikesCount] = useState(
    comment.likes?.length ?? 0
  );

  // Replies
  const [showReplyInput, setShowReplyInput] =
    useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentI[]>([]);
  const [repliesPage, setRepliesPage] = useState(1);
  const [hasMoreReplies, setHasMoreReplies] =
    useState(true);
  const [isLoadingReplies, setIsLoadingReplies] =
    useState(false);

  // Delete comment
  async function handleDeleteComment() {
    if (isDeleting || !canDelete) return;

    setIsDeleting(true);

    try {
      await deleteComment(comment.post, comment._id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  // Start editing
  function handleStartEdit() {
    if (!isCommentOwner) return;

    setEditContent(comment.content ?? "");
    setEditMode(true);
    setShowMenu(false);
  }

  function handleCancelEdit() {
    setEditContent(comment.content ?? "");
    setEditMode(false);
  }

  // Edit comment
  async function handleEditComment() {
    if (
      !isCommentOwner ||
      !editContent.trim() ||
      isEditing
    ) {
      return;
    }

    setIsEditing(true);

    try {
      const formData = new FormData();
      formData.set("content", editContent.trim());

      await editComment(
        comment.post,
        comment._id,
        formData
      );

      setEditMode(false);
    } catch (error) {
      console.error("Failed to edit comment:", error);
    } finally {
      setIsEditing(false);
    }
  }

  // Like / Unlike
  async function handleToggleLike() {
    if (isLiking) return;

    setIsLiking(true);

    try {
      await commentService.toggleCommentLike(
        comment.post,
        comment._id
      );

      setIsLiked((previous) => !previous);

      setLikesCount((previous) =>
        Math.max(0, previous + (isLiked ? -1 : 1))
      );
    } catch (error) {
      console.error("Failed to like comment:", error);
    } finally {
      setIsLiking(false);
    }
  }

  // Load paginated replies
  async function loadReplies(
    page = 1,
    reset = false
  ) {
    if (isLoadingReplies) return;

    setIsLoadingReplies(true);

    try {
      const response =
        await commentService.getCommentReplies(
          comment.post,
          comment._id,
          page,
          10
        );

      const result: any = response;
      const data = result?.data ?? result;

      const newReplies: CommentI[] =
        Array.isArray(data?.replies)
          ? data.replies
          : Array.isArray(data?.comments)
            ? data.comments
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data)
                ? data
                : [];

      setReplies((previous) => {
        if (reset) return newReplies;

        const existingIds = new Set(
          previous.map((reply) => reply._id)
        );

        return [
          ...previous,
          ...newReplies.filter(
            (reply) => !existingIds.has(reply._id)
          ),
        ];
      });

      setRepliesPage(page);
      setHasMoreReplies(newReplies.length === 10);
    } catch (error) {
      console.error("Failed to load replies:", error);
    } finally {
      setIsLoadingReplies(false);
    }
  }

  async function handleToggleReplies() {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    setShowReplies(true);

    if (replies.length === 0) {
      await loadReplies(1, true);
    }
  }

  // Create reply
  async function handleCreateReply(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!replyContent.trim() || isReplying) return;

    setIsReplying(true);

    try {
      const formData = new FormData();
      formData.set("content", replyContent.trim());

      await commentService.createReply(
        comment.post,
        comment._id,
        formData
      );

      setReplyContent("");
      setShowReplyInput(false);
      setReplies([]);
      setRepliesPage(1);
      setHasMoreReplies(true);
      setShowReplies(true);

      await loadReplies(1, true);
    } catch (error) {
      console.error("Failed to create reply:", error);
    } finally {
      setIsReplying(false);
    }
  }

  return (
    <>
      <div className="mt-1 border-t border-gray-200 px-2 py-2">
        <div className="px-4 py-3">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {comment.commentCreator?.photo ? (
                <img
                  src={comment.commentCreator.photo}
                  alt={
                    comment.commentCreator.name ?? "User"
                  }
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                  {comment.commentCreator?.name
                    ?.charAt(0)
                    ?.toUpperCase() ?? "U"}
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900">
                  {comment.commentCreator?.name ?? "User"}
                </h3>

                <p className="text-sm text-gray-500">
                  @{comment.commentCreator?.username ?? "user"}
                </p>
              </div>
            </div>

            {/* Owner / Post owner options */}
            {canDelete && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowMenu((previous) => !previous)
                  }
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                  aria-label="Comment options"
                >
                  <MoreHorizontal size={22} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full z-20 w-40 rounded-lg border bg-white py-1 shadow-lg">

                    {isCommentOwner && (
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setShowDeleteModal(true);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash size={16} />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="mt-2">
            {editMode ? (
              <>
                <div className="relative">
                  <input
                    value={editContent}
                    onChange={(event) =>
                      setEditContent(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        void handleEditComment();
                      }

                      if (event.key === "Escape") {
                        handleCancelEdit();
                      }
                    }}
                    autoFocus
                    disabled={isEditing}
                    className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 pr-24 text-sm outline-none focus:border-blue-400"
                  />

                  <button
                    type="button"
                    onClick={handleEditComment}
                    disabled={
                      isEditing || !editContent.trim()
                    }
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-4 py-2 text-xs text-white disabled:opacity-50"
                  >
                    {isEditing ? "Saving..." : "Save"}
                  </button>
                </div>

                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isEditing}
                    className="text-sm text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <p className="wrap-break-word whitespace-pre-wrap text-gray-800">
                {comment.content}
              </p>
            )}

            {/* Existing comment image */}
            {!editMode && (comment as any).image && (
              <img
                src={(comment as any).image}
                alt="Comment attachment"
                className="mt-3 max-h-80 rounded-xl object-contain"
              />
            )}
          </div>

          {/* LIKE + REPLY BUTTONS */}
          {!editMode && (
            <div className="mt-3 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={isLiking}
                className={`flex items-center gap-1.5 text-sm disabled:opacity-50 ${
                  isLiked
                    ? "text-red-500"
                    : "text-gray-500 hover:text-red-500"
                }`}
              >
                <Heart
                  size={18}
                  fill={
                    isLiked ? "currentColor" : "none"
                  }
                />
                Like ({likesCount})
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowReplyInput((previous) => !previous)
                }
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600"
              >
                <MessageCircle size={18} />
                Reply
              </button>

              <button
                type="button"
                onClick={handleToggleReplies}
                className="text-sm text-blue-600 hover:underline"
              >
                {showReplies ? "Hide replies" : "View replies"}
              </button>
            </div>
          )}

          {/* Reply form */}
          {showReplyInput && !editMode && (
            <form
              onSubmit={handleCreateReply}
              className="mt-3 flex gap-2"
            >
              <input
                value={replyContent}
                onChange={(event) =>
                  setReplyContent(event.target.value)
                }
                placeholder="Write a reply..."
                disabled={isReplying}
                className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-blue-400"
              />

              <button
                type="submit"
                disabled={
                  isReplying || !replyContent.trim()
                }
                className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {isReplying ? "Sending..." : "Send"}
              </button>
            </form>
          )}

          {/* Replies */}
          {showReplies && (
            <div className="mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
              {replies.map((reply) => (
                <div key={reply._id} className="flex gap-2">
                  {reply.commentCreator?.photo ? (
                    <img
                      src={reply.commentCreator.photo}
                      alt={
                        reply.commentCreator.name ?? "User"
                      }
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                      {reply.commentCreator?.name
                        ?.charAt(0)
                        ?.toUpperCase() ?? "U"}
                    </div>
                  )}

                  <div className="min-w-0 flex-1 rounded-xl bg-gray-50 px-3 py-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {reply.commentCreator?.name ?? "User"}
                    </p>

                    <p className="wrap-break-word whitespace-pre-wrap text-sm text-gray-700">
                      {reply.content}
                    </p>
                  </div>
                </div>
              ))}

              {isLoadingReplies && (
                <p className="text-sm text-gray-500">
                  Loading replies...
                </p>
              )}

              {!isLoadingReplies &&
                replies.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No replies yet.
                  </p>
                )}

              {!isLoadingReplies && hasMoreReplies && (
                <button
                  type="button"
                  onClick={() =>
                    loadReplies(repliesPage + 1)
                  }
                  className="text-sm text-blue-600 hover:underline"
                >
                  Load more replies
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Delete Comment
              </h2>

              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-4 text-gray-600">
              Are you sure you want to delete this comment?
            </p>

            <p className="mt-1 text-sm text-gray-400">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteComment}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}