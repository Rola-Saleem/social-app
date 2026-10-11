import type { CommentI } from "../interfaces/commentI";
import type { PostI } from "../interfaces/postI";

export type Response<DataI>={
    success:boolean;
    message:string;
    data:DataI
}
export type GetPostsResponse=Response<{posts:PostI[]}>&{
    meta:{
        pagination:{
            currentPage:number
            limit:number
            nextPage:number
            numberOfPages:number
            total:number
        }
    }
}
export type GetPostResponse=Response<{post:PostI}>
export type GetPostCommentsResponse=Response<{comments:CommentI[]}>