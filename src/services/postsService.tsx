import axios from "axios";
import type { GetPostsResponse,GetPostResponse } from "../types/response";
class PostsService{
     async getAllPosts():Promise<GetPostsResponse>{
        const {data}= await axios.get( "https://route-posts.routemisr.com/posts",{  
                headers:{
                    token:localStorage.getItem("token")
                }
        })
        console.log(data)
        return data;
     }
     async createPost(formData:FormData){
        const {data}=await axios.post("https://route-posts.routemisr.com/posts",formData,{
            headers:{
                token:localStorage.getItem("token")
            }
        })
        return data;
     }
     async deletePost(postId:string){
        const {data}=await axios.delete("https://route-posts.routemisr.com/posts/"+postId,{
            headers:{
                "token":localStorage.getItem("token")
            }
        })
        return data;
     }
       async updatePost(postId: string, formData: FormData) {
    const { data } = await axios.put(
      "https://route-posts.routemisr.com/posts/" + postId,
      formData,
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );

    return data;
  }
  async getPostDetails(postId: string):Promise<GetPostResponse>{
    const data=await axios.get( "https://route-posts.routemisr.com/posts/"+postId,{
      headers:{
        token:localStorage.getItem("token")
      }
    })
    return data.data;
  }
  async likePost(postId: string) {
  const { data } = await axios.put(
    "https://route-posts.routemisr.com/posts/" + postId + "/like",
    {},
    {
      headers: {
        token: localStorage.getItem("token"),
      },
    }
  );

  return data;
}

// Get Users Who Liked a Post
async getPostLikes(
  postId: string,
  page: number = 1,
  limit: number = 10
) {
  const { data } = await axios.get(
    "https://route-posts.routemisr.com/posts/" + postId + "/likes",
    {
      headers: {
        token: localStorage.getItem("token"),
      },
      params: {
        page,
        limit,
      },
    }
  );

  return data;
}

// Bookmark / Unbookmark Post
async bookmarkPost(postId: string) {
  const { data } = await axios.put(
    "https://route-posts.routemisr.com/posts/" + postId + "/bookmark",
    {},
    {
      headers: {
        token: localStorage.getItem("token"),
      },
    }
  );

  return data;
}

// Share Post
async sharePost(postId: string) {
  const { data } = await axios.post(
    "https://route-posts.routemisr.com/posts/" + postId + "/share",
    {},
    {
      headers: {
        token: localStorage.getItem("token"),
      },
    }
  );

  return data;
}

// Get Feed
async getFeed(page: number = 1, limit: number = 10, only?: string) {
  const { data } = await axios.get(
    "https://route-posts.routemisr.com/posts/feed",
    {
      headers: {
        token: localStorage.getItem("token"),
      },
      params: {
        page,
        limit,
        ...(only ? { only } : {}),
      },
    }
  );

  return data;
}
}
const postsService=new PostsService();
export default postsService;