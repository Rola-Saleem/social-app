import axios from "axios";
import type { GetPostCommentsResponse, Response } from "../types/response";

class CommentService{
    async createComment(postId:string,formData:FormData){
        const {data} =await axios.post(`https://route-posts.routemisr.com/posts/${postId}/comments`,formData,{
            headers:{
                token:localStorage.getItem("token")
            }
        });
        console.log(data)

        return data;
    } 
    async deleteComment(postId:string,commentId:string):Promise<Response<{}>>{
        const data=await axios.delete(`https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}`,{
            headers:{
                token:localStorage.getItem("token")
            }
        })
        return data.data;
    }
    async editComment(postId:string,commentId:string,formData:FormData){
        const {data} =await axios.put(`https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}`,formData,{
            headers:{
                token:localStorage.getItem("token")
            }
        });
        return data;
    } 
    async getPostsComment(
  postId: string,
  page: number = 1,
  limit: number = 10
): Promise<GetPostCommentsResponse> {
  const { data } = await axios.get(
    `https://route-posts.routemisr.com/posts/${postId}/comments`,
    {
      params: { page, limit },
      headers: {
        token: localStorage.getItem("token"),
      },
    }
  );

  return data;
}
    async getCommentReplies(
  postId: string,
  commentId: string,
  page: number = 1,
  limit: number = 10
) {
  const { data } = await axios.get(
    `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}/replies`,
    {
      params: { page, limit },
      headers: {
        token: localStorage.getItem("token"),
      },
    }
  );

  return data;
}async createReply(
  postId: string,
  commentId: string,
  formData: FormData
) {
  try {
    const { data } = await axios.post(
      `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}/replies`,
      formData,
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );

    return data;
  } catch (error: any) {
    console.error(
      "Create reply error:",
      error.response?.data
    );

    throw error;
  }
}
async toggleCommentLike(
  postId: string,
  commentId: string
) {
  const { data } = await axios.put(
    `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}/like`,
    {},
    {
      headers: {
        token: localStorage.getItem("token"),
      },
    }
  );

  return data;
}
}

const commentService=new CommentService();
export default commentService;