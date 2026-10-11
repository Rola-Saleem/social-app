import axios from "axios";

class AuthService {
  baseURL = "https://route-posts.routemisr.com/users";

  getToken() {
    return localStorage.getItem("token");
  }

  getAuthConfig() {
    return {
      headers: {
        token: this.getToken(),
      },
    };
  }

  // Get current user profile
  async getUserData() {
    const { data } = await axios.get(
      `${this.baseURL}/profile-data`,
      this.getAuthConfig()
    );

    return data;
  }

  // Change profile photo
  async uploadPhoto(photo: string | Blob) {
    const formData = new FormData();
    formData.append("photo", photo);

    const { data } = await axios.put(
      `${this.baseURL}/upload-photo`,
      formData,
      this.getAuthConfig()
    );

    return data;
  }

  // Change password
  async changePassword(passwordData: any) {
    const { data } = await axios.patch(
      `${this.baseURL}/change-password`,
      passwordData,
      this.getAuthConfig()
    );

    return data;
  }

  
   // Get user suggestions
  async getSuggestions(page = 1, limit = 10) {
    const { data } = await axios.get(
      `${this.baseURL}/suggestions`,
      {
        ...this.getAuthConfig(),
        params: {
          page,
          limit,
        },
      }
    );

    return data;}
}
export const authService=new AuthService(); 