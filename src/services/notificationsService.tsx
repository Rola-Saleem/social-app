import axios from "axios";

const API_URL = "https://route-posts.routemisr.com/notifications";

class NotificationsService {
  getAuthConfig() {
    return {
      headers: {
        token: localStorage.getItem("token"),
      },
    };
  }

  // Get notifications
  async getNotifications(page = 1, limit = 10) {
    const { data } = await axios.get(API_URL, {
      ...this.getAuthConfig(),
      params: { page, limit },
    });

    return data;
  }

  // Get unread count
  async getUnreadCount() {
    const { data } = await axios.get(
      `${API_URL}/unread-count`,
      this.getAuthConfig()
    );

    return data;
  }

  // Mark one notification as read
  async markAsRead(notificationId: any) {
    const { data } = await axios.patch(
      `${API_URL}/${notificationId}/read`,
      {},
      this.getAuthConfig()
    );

    return data;
  }

  // Mark all notifications as read
  async markAllAsRead() {
    const { data } = await axios.patch(
      `${API_URL}/read-all`,
      {},
      this.getAuthConfig()
    );

    return data;
  }
}

export const notificationsService = new NotificationsService();