import type { CommentI } from "./commentI";
import type { UserI } from "./userI";

export interface PostI {
  _id: string;
  body: string;
  image: string;
  privacy: "public";
  user: UserI;
  sharedPost: null;
  likes: unknown[];
  createdAt: string;
  commentsCount: number;
  topComment:  CommentI;
  sharesCount: number;
  likesCount: number;
  isShare:boolean;
  is:string;
  bookmarked: boolean;
}