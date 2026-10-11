import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import type { PostI } from "../interfaces/postI";
import type { CommentI } from "../interfaces/commentI";

import postsService from "../services/postsService";
import commentService from "../services/commentService";
import Post from "../components/Post";

export default function PostDetails() {
  const { postId } = useParams();

  const [post, setPost] = useState<PostI>();
  const [comments, setComments] = useState<CommentI[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);

  const limit = 10;

  // Get post details
  const getPostDetails = useCallback(async () => {
    if (!postId) return;

    try {
      const response = await postsService.getPostDetails(postId);
      setPost(response.data.post);
    } catch (error) {
      console.error("Failed to get post:", error);
    }
  }, [postId]);

  // Get comments with pagination
  const getPostsComment = useCallback(
    async (pageNumber = 1, append = false) => {
      if (!postId) return;

      try {
        const response = await commentService.getPostsComment(
          postId,
          pageNumber,
          limit
        );

        // Support common response shapes
        const result = response?.data ?? response;

        const fetchedComments: CommentI[] =
          Array.isArray(result)
            ? result
            : Array.isArray(result?.comments)
              ? result.comments
              : Array.isArray(result?.data?.comments)
                ? result.data.comments
                : [];

        setComments((previous) =>
          append
            ? [
                ...previous,
                ...fetchedComments.filter(
                  (newComment) =>
                    !previous.some(
                      (oldComment) =>
                        oldComment._id === newComment._id
                    )
                ),
              ]
            : fetchedComments
        );

        setPage(pageNumber);

        // Prefer pagination metadata from the API when available.
        const pagination =
          result?.pagination ?? result?.meta ?? {};

        if (typeof pagination?.hasNextPage === "boolean") {
          setHasMoreComments(pagination.hasNextPage);
        } else if (typeof pagination?.hasNext === "boolean") {
          setHasMoreComments(pagination.hasNext);
        } else if (pagination?.totalPages != null) {
          setHasMoreComments(
            pageNumber < Number(pagination.totalPages)
          );
        } else {
          // Fallback when the API doesn't return pagination metadata.
          setHasMoreComments(
            fetchedComments.length === limit
          );
        }
      } catch (error) {
        console.error("Failed to get comments:", error);
        throw error;
      }
    },
    [postId]
  );

  // Refresh post and reset comments to page 1
  const refreshPost = useCallback(async () => {
    if (!postId) return;

    await Promise.all([
      getPostDetails(),
      getPostsComment(1, false),
    ]);
  }, [postId, getPostDetails, getPostsComment]);

  // Initial load and reload when postId changes
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setPost(undefined);
      setComments([]);
      setPage(1);
      setHasMoreComments(true);

      try {
        if (!postId) return;

        await Promise.all([
          getPostDetails(),
          getPostsComment(1, false),
        ]);
      } catch (error) {
        console.error("Failed to load post details:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [postId, getPostDetails, getPostsComment]);

  // Load next page
  async function handleLoadMoreComments() {
    if (
      !postId ||
      isLoadingMore ||
      !hasMoreComments
    ) {
      return;
    }

    setIsLoadingMore(true);

    try {
      await getPostsComment(page + 1, true);
    } catch (error) {
      console.error("Failed to load more comments:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }

  // Delete post
  async function deletePost(id: string) {
    try {
      await postsService.deletePost(id);
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to delete post:", error);
      throw error;
    }
  }

  // Create comment
  async function createComment(
    id: string,
    formData: FormData
  ) {
    try {
      const response = await commentService.createComment(
        id,
        formData
      );

      // Reload comments from the first page so the newest
      // comment appears immediately.
      await refreshPost();

      return response;
    } catch (error) {
      console.error("Failed to create comment:", error);
      throw error;
    }
  }

  // Delete comment
  async function deleteComment(
    id: string,
    commentId: string
  ) {
    try {
      const response = await commentService.deleteComment(
        id,
        commentId
      );

      await refreshPost();

      return response;
    } catch (error) {
      console.error("Failed to delete comment:", error);
      throw error;
    }
  }

  // Edit comment
  async function editComment(
    id: string,
    commentId: string,
    formData: FormData
  ) {
    try {
      const response = await commentService.editComment(
        id,
        commentId,
        formData
      );

      await refreshPost();

      return response;
    } catch (error) {
      console.error("Failed to edit comment:", error);
      throw error;
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center py-10">
        <h2>Post not found</h2>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <Post
        post={post}
        deletePost={deletePost}
        getAllPosts={refreshPost}
        createComment={createComment}
        deleteComment={deleteComment}
        editComment={editComment}
        comments={comments}
      />

      {/* Comments pagination */}
      {comments.length > 0 && hasMoreComments && (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={handleLoadMoreComments}
            disabled={isLoadingMore}
            className="rounded-full border border-blue-600 px-6 py-2 font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoadingMore
              ? "Loading comments..."
              : "Load more comments"}
          </button>
        </div>
      )}

      {comments.length === 0 && (
        <p className="py-4 text-center text-gray-500">
          No comments yet.
        </p>
      )}
    </div>
  );
}