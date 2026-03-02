// User identity stored in localStorage
export interface UserIdentity {
  userId: string;
  username: string;
  createdAt: string;
}

const STORAGE_KEY = 'wizardRunUser';

export class UserIdentityService {
  // Generate a UUID v4 for the user
  private generateUserId(): string {
    return crypto.randomUUID();
  }

  // Get stored user or null if not exists
  getUser(): UserIdentity | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Create new user with username
  createUser(username: string): UserIdentity {
    const user: UserIdentity = {
      userId: this.generateUserId(),
      username: username.trim(),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  // Update username
  updateUsername(newUsername: string): UserIdentity | null {
    const user = this.getUser();
    if (!user) return null;
    user.username = newUsername.trim();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  // Check if user exists
  hasUser(): boolean {
    return this.getUser() !== null;
  }
}
