import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  RefreshCw,
  UserRound,
} from "lucide-react";

import postsService from "../services/postsService";
import { authService } from "../services/authService";
import Post from "../components/Post";
import CreatePost from "../components/CreatePost";
import commentService from "../services/commentService";

export default function Feed() {
  const [suggestionsPage, setSuggestionsPage] = useState(1);

  // =========================
  // Posts
  // =========================

  const {
    data: posts = [],
    refetch,
    isLoading: postsLoading,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: postsService.getAllPosts,
    select: (data) => data.data.posts,
    staleTime: 10_000,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 3,
  });

  // =========================
  // People You May Know
  // =========================

  const {
    data: suggestionsResponse,
    isLoading: suggestionsLoading,
    isError: suggestionsError,
    refetch: refetchSuggestions,
  } = useQuery({
    queryKey: ["suggestions", suggestionsPage],
    queryFn: () =>
      authService.getSuggestions(suggestionsPage, 10),
    staleTime: 60_000,
    retry: 2,
  });

  // Support common response formats
  const suggestions =
    suggestionsResponse?.suggestions ??
    suggestionsResponse?.data?.suggestions ??
    suggestionsResponse?.data?.data ??
    suggestionsResponse?.data ??
    [];

  const people = Array.isArray(suggestions) ? suggestions : [];

  // =========================
  // Delete Post
  // =========================

  async function deletePost(postId: string) {
    await postsService.deletePost(postId);
    await refetch();
  }

  // =========================
  // Create Comment
  // =========================

  async function createComment(
    postId: string,
    formData: FormData
  ) {
    const response = await commentService.createComment(
      postId,
      formData
    );

    await refetch();
    return response;
  }

  // =========================
  // Delete Comment
  // =========================

  async function deleteComment(
    postId: string,
    commentId: string
  ) {
    const response = await commentService.deleteComment(
      postId,
      commentId
    );

    await refetch();
    return response;
  }

  // =========================
  // Edit Comment
  // =========================

  async function editComment(
    postId: string,
    commentId: string,
    formData: FormData
  ) {
    const response = await commentService.editComment(
      postId,
      commentId,
      formData
    );

    await refetch();
    return response;
  }

  // =========================
  // Render
  // =========================

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-6 sm:px-5">
      <div className="mx-auto max-w-5xl">

        {/* Page Header */}
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
            Your community
          </p>

          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            Home Feed
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Discover people and see what's happening in your circle.
          </p>
        </div>

        {/* People You May Know */}
        <section className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Section Header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users size={22} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  People You May Know
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Discover new people in your community
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => refetchSuggestions()}
              disabled={suggestionsLoading}
              aria-label="Refresh suggestions"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  suggestionsLoading ? "animate-spin" : ""
                }
              />
            </button>
          </div>

          {/* Suggestions */}
          <div className="p-4 sm:p-5">
            {suggestionsLoading ? (
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="min-w-0 flex-1 animate-pulse rounded-xl border border-slate-100 p-4"
                  >
                    <div className="mx-auto h-16 w-16 rounded-full bg-slate-200" />
                    <div className="mx-auto mt-3 h-3 w-20 rounded bg-slate-200" />
                    <div className="mx-auto mt-2 h-3 w-14 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : suggestionsError ? (
              <div className="py-8 text-center">
                <p className="text-sm text-red-500">
                  Couldn't load people suggestions.
                </p>

                <button
                  type="button"
                  onClick={() => refetchSuggestions()}
                  className="mt-3 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
                >
                  Try again
                </button>
              </div>
            ) : people.length === 0 ? (
              <div className="py-8 text-center">
                <UserRound
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-semibold text-slate-700">
                  No suggestions yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Check back later to discover new people.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {people.map((person: any, index: number) => {
                    const personId =
                      person._id ?? person.id ?? index;

                    const personName =
                      person.name ??
                      person.username ??
                      person.fullName ??
                      "User";

                    const personImage =
                      person.photo ??
                      person.image ??
                      person.profilePhoto ??
                      person.photoUrl ??
                      "";

                    return (
                      <article
                        key={personId}
                        className="group flex min-w-0 flex-col items-center rounded-xl border border-slate-100 bg-white p-3 text-center transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md sm:p-4"
                      >
                        <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-indigo-100 bg-indigo-50 ring-4 ring-indigo-50/50">
                          {personImage ? (
                            <img
                              src={personImage}
                              alt={personName}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-indigo-600">
                              {personName
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>

                        <h3 className="mt-3 w-full truncate text-sm font-bold text-slate-800">
                          {personName}
                        </h3>

                        {person.username && (
                          <p className="mt-1 w-full truncate text-xs text-slate-400">
                            @{person.username}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="mt-5 flex items-center justify-center gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    disabled={suggestionsPage === 1}
                    onClick={() =>
                      setSuggestionsPage((page) =>
                        Math.max(1, page - 1)
                      )
                    }
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-slate-500">
                    Page {suggestionsPage}
                  </span>

                  <button
                    type="button"
                    disabled={people.length < 10}
                    onClick={() =>
                      setSuggestionsPage((page) => page + 1)
                    }
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Create Post */}
        <div className="mx-auto mb-6 max-w-2xl">
          <CreatePost getAllPosts={refetch} />
        </div>

        {/* Posts Feed */}
        <section className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Latest Posts
            </h2>

            <button
              type="button"
              onClick={() => refetch()}
              className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Refresh
            </button>
          </div>

          {postsLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

              <p className="mt-3 text-sm text-slate-500">
                Loading posts...
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
              <p className="font-semibold text-slate-700">
                No posts yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Create the first post in your circle!
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {posts.map((post: any) => (
                <Post
                  key={post._id}
                  post={post}
                  deletePost={deletePost}
                  getAllPosts={refetch}
                  createComment={createComment}
                  deleteComment={deleteComment}
                  editComment={editComment}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}