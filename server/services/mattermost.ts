interface MattermostUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  nickname: string;
  position: string;
  roles: string;
  last_picture_update: number;
}

interface MattermostChannel {
  id: string;
  create_at: number;
  update_at: number;
  delete_at: number;
  team_id: string;
  type: string;
  display_name: string;
  name: string;
  header: string;
  purpose: string;
  last_post_at: number;
  total_msg_count: number;
  extra_update_at: number;
  creator_id: string;
}

interface MattermostPost {
  id: string;
  create_at: number;
  update_at: number;
  edit_at: number;
  delete_at: number;
  is_pinned: boolean;
  user_id: string;
  channel_id: string;
  root_id: string;
  original_id: string;
  message: string;
  type: string;
  props: any;
  hashtags: string;
  pending_post_id: string;
  reply_count: number;
  last_reply_at: number;
  participants: any;
  metadata: any;
}

export class MattermostService {
  private serverUrl: string;
  private apiUrl: string;
  private token: string | null = null;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl.replace(/\/$/, '');
    this.apiUrl = `${this.serverUrl}/api/v4`;
  }

  async login(username: string, password: string): Promise<{ user: MattermostUser; token: string }> {
    const response = await fetch(`${this.apiUrl}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login_id: username,
        password: password,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Login failed: ${error}`);
    }

    const user = await response.json();
    const token = response.headers.get('Token');
    
    if (!token) {
      throw new Error('No authentication token received');
    }

    this.token = token;
    return { user, token };
  }

  async getCurrentUser(): Promise<MattermostUser> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.apiUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    return response.json();
  }

  async getUsers(): Promise<MattermostUser[]> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.apiUrl}/users?per_page=200`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get users');
    }

    return response.json();
  }

  async getDirectChannels(): Promise<MattermostChannel[]> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.apiUrl}/channels/direct`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get direct channels');
    }

    return response.json();
  }

  async createDirectChannel(userId1: string, userId2: string): Promise<MattermostChannel> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.apiUrl}/channels/direct`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([userId1, userId2]),
    });

    if (!response.ok) {
      throw new Error('Failed to create direct channel');
    }

    return response.json();
  }

  async getChannelPosts(channelId: string, page = 0, perPage = 60): Promise<{ posts: Record<string, MattermostPost>; order: string[] }> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.apiUrl}/channels/${channelId}/posts?page=${page}&per_page=${perPage}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get channel posts');
    }

    return response.json();
  }

  async createPost(channelId: string, message: string): Promise<MattermostPost> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.apiUrl}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel_id: channelId,
        message: message,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    return response.json();
  }

  async getUserStatus(userId: string): Promise<{ user_id: string; status: string; manual: boolean; last_activity_at: number }> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.apiUrl}/users/${userId}/status`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user status');
    }

    return response.json();
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }
}
