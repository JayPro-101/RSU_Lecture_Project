import { UserRole } from '../enums/roles.enum';

export class AuthorizationUtils {
  private static readonly ROLE_HIERARCHY: Record<UserRole, number> = {
    [UserRole.STUDENT]: 10,
    [UserRole.STUDENT_MODERATOR]: 20,
    [UserRole.ACADEMIC_REPRESENTATIVE]: 30,
    [UserRole.PLATFORM_ADMIN]: 100,
  };

  /**
   * Check if a given user role meets or exceeds a target minimum role level.
   */
  static hasMinimumRole(userRole: UserRole, targetRole: UserRole): boolean {
    return (
      (this.ROLE_HIERARCHY[userRole] ?? 0) >=
      (this.ROLE_HIERARCHY[targetRole] ?? 0)
    );
  }

  /**
   * Checks if user is an administrator.
   */
  static isAdmin(userRole: UserRole): boolean {
    return userRole === UserRole.PLATFORM_ADMIN;
  }
}
