import type { UserI } from "./userI";

export  interface CommentI {
  _id: string;
  content: string;
  commentCreator: UserI;
  post: string;
  parentComment:null;
  likes:unknown[];
   image?: string;
  createdAt:string
}

