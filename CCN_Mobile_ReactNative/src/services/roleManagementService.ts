import { ApiService } from './api';
import { complianceService } from './complianceService';

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  level: number; // Higher number = more privileges
  isSystem: boolean; // System roles cannot be modified
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  resource: string; // 'messages', 'files', 'channels', 'users', 'admin'
  actions: string[]; // ['create', 'read', 'update', 'delete']
  conditions?: {
    ownData?: boolean; // Can only access own data
    channelRestricted?: boolean; // Limited to specific channels
    timeRestricted?: boolean; // Limited to specific time periods
    encryptionRequired?: boolean; // Requires encryption for sensitive data
  };
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: string;
  expiresAt?: string;
  isActive: boolean;
  metadata?: {
    department?: string;
    specialty?: string;
    location?: string;
    supervisor?: string;
  };
}

export interface RoleAssignment {
  userId: string;
  roleId: string;
  assignedBy: string;
  reason: string;
  metadata?: any;
}

export interface PermissionCheck {
  userId: string;
  resource: string;
  action: string;
  resourceId?: string;
  context?: any;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  outcome: 'success' | 'failure' | 'denied';
  details: any;
  complianceFlags: string[];
}

// Predefined healthcare roles
export const HEALTHCARE_ROLES: Partial<Role>[] = [
  {
    name: 'System Administrator',
    description: 'Full system access and control',
    level: 100,
    permissions: [
      {
        resource: 'admin',
        actions: ['create', 'read', 'update', 'delete'],
      },
      {
        resource: 'users',
        actions: ['create', 'read', 'update', 'delete'],
      },
      {
        resource: 'roles',
        actions: ['create', 'read', 'update', 'delete'],
      },
      {
        resource: 'channels',
        actions: ['create', 'read', 'update', 'delete'],
      },
      {
        resource: 'files',
        actions: ['create', 'read', 'update', 'delete'],
      },
      {
        resource: 'messages',
        actions: ['create', 'read', 'update', 'delete'],
      },
    ],
  },
  {
    name: 'Hospital Administrator',
    description: 'Hospital-wide management and oversight',
    level: 90,
    permissions: [
      {
        resource: 'users',
        actions: ['create', 'read', 'update'],
        conditions: {
          ownData: false,
          channelRestricted: true,
        },
      },
      {
        resource: 'channels',
        actions: ['create', 'read', 'update'],
        conditions: {
          channelRestricted: true,
        },
      },
      {
        resource: 'files',
        actions: ['create', 'read', 'update', 'delete'],
        conditions: {
          encryptionRequired: true,
        },
      },
      {
        resource: 'messages',
        actions: ['create', 'read', 'update'],
        conditions: {
          encryptionRequired: true,
        },
      },
    ],
  },
  {
    name: 'Department Head',
    description: 'Department-level management and oversight',
    level: 80,
    permissions: [
      {
        resource: 'users',
        actions: ['read', 'update'],
        conditions: {
          ownData: false,
          channelRestricted: true,
        },
      },
      {
        resource: 'channels',
        actions: ['create', 'read', 'update'],
        conditions: {
          channelRestricted: true,
        },
      },
      {
        resource: 'files',
        actions: ['create', 'read', 'update'],
        conditions: {
          encryptionRequired: true,
        },
      },
      {
        resource: 'messages',
        actions: ['create', 'read', 'update'],
        conditions: {
          encryptionRequired: true,
        },
      },
    ],
  },
  {
    name: 'Attending Physician',
    description: 'Senior medical professional with patient care responsibilities',
    level: 70,
    permissions: [
      {
        resource: 'users',
        actions: ['read'],
        conditions: {
          ownData: false,
          channelRestricted: true,
        },
      },
      {
        resource: 'channels',
        actions: ['create', 'read', 'update'],
        conditions: {
          channelRestricted: true,
        },
      },
      {
        resource: 'files',
        actions: ['create', 'read', 'update'],
        conditions: {
          encryptionRequired: true,
        },
      },
      {
        resource: 'messages',
        actions: ['create', 'read', 'update'],
        conditions: {
          encryptionRequired: true,
        },
      },
    ],
  },
  {
    name: 'Resident Physician',
    description: 'Medical resident with supervised patient care',
    level: 60,
    permissions: [
      {
        resource: 'channels',
        actions: ['read', 'update'],
        conditions: {
          channelRestricted: true,
        },
      },
      {
        resource: 'files',
        actions: ['create', 'read', 'update'],
        conditions: {
          encryptionRequired: true,
        },
      },
      {
        resource: 'messages',
        actions: ['create', 'read', 'update'],
        conditions: {
          encryptionRequired: true,
        },
      },
    ],
  },
  {
    name: 'Nurse',
    description: 'Registered nurse with patient care responsibilities',
    level: 50,
    permissions: [
      {
        resource: 'channels',
        actions: ['read', 'update'],
        conditions: {
          channelRestricted: true,
        },
      },
      {
        resource: 'files',
        actions: ['create', 'read', 'update'],
        conditions: {
          encryptionRequired: true,
        },
      },
      {
        resource: 'messages',
        actions: ['create', 'read', 'update'],
        conditions: {
          encryptionRequired: true,
        },
      },
    ],
  },
  {
    name: 'Medical Student',
    description: 'Medical student with limited access under supervision',
    level: 40,
    permissions: [
      {
        resource: 'channels',
        actions: ['read'],
        conditions: {
          channelRestricted: true,
        },
      },
      {
        resource: 'files',
        actions: ['read'],
        conditions: {
          encryptionRequired: true,
        },
      },
      {
        resource: 'messages',
        actions: ['create', 'read'],
        conditions: {
          encryptionRequired: true,
        },
      },
    ],
  },
  {
    name: 'Support Staff',
    description: 'Administrative and support personnel',
    level: 30,
    permissions: [
      {
        resource: 'channels',
        actions: ['read'],
        conditions: {
          channelRestricted: true,
        },
      },
      {
        resource: 'files',
        actions: ['read'],
        conditions: {
          encryptionRequired: true,
        },
      },
      {
        resource: 'messages',
        actions: ['read'],
        conditions: {
          encryptionRequired: true,
        },
      },
    ],
  },
];

class RoleManagementService {
  private api: ApiService;
  private readonly ROLES_CACHE_KEY = 'ccn_roles_cache';
  private readonly USER_ROLES_CACHE_KEY = 'ccn_user_roles_cache';
  private readonly CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.api = new ApiService();
  }

  // Role Management Methods

  // Get all available roles
  async getRoles(): Promise<Role[]> {
    try {
      const response = await this.api.get('/roles');
      const roles = response.data.data || [];
      
      // Cache roles
      this.cacheRoles(roles);
      
      return roles;
    } catch (error) {
      console.error('Failed to get roles:', error);
      // Return cached roles if available
      return this.getCachedRoles();
    }
  }

  // Get role by ID
  async getRole(roleId: string): Promise<Role | null> {
    try {
      const response = await this.api.get(`/roles/${roleId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get role:', error);
      return null;
    }
  }

  // Create new role
  async createRole(roleData: Partial<Role>): Promise<Role> {
    try {
      const response = await this.api.post('/roles', roleData);
      const newRole = response.data.data;
      
      // Clear cache to refresh
      this.clearRolesCache();
      
      // Log role creation for compliance
      await this.logRoleAction('role_created', newRole._id, roleData);
      
      return newRole;
    } catch (error) {
      console.error('Failed to create role:', error);
      throw new Error('Failed to create role');
    }
  }

  // Update existing role
  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role> {
    try {
      const response = await this.api.put(`/roles/${roleId}`, updates);
      const updatedRole = response.data.data;
      
      // Clear cache to refresh
      this.clearRolesCache();
      
      // Log role update for compliance
      await this.logRoleAction('role_updated', roleId, updates);
      
      return updatedRole;
    } catch (error) {
      console.error('Failed to update role:', error);
      throw new Error('Failed to update role');
    }
  }

  // Delete role
  async deleteRole(roleId: string): Promise<boolean> {
    try {
      await this.api.delete(`/roles/${roleId}`);
      
      // Clear cache to refresh
      this.clearRolesCache();
      
      // Log role deletion for compliance
      await this.logRoleAction('role_deleted', roleId, {});
      
      return true;
    } catch (error) {
      console.error('Failed to delete role:', error);
      return false;
    }
  }

  // User Role Assignment Methods

  // Assign role to user
  async assignRoleToUser(assignment: RoleAssignment): Promise<UserRole> {
    try {
      const response = await this.api.post('/user-roles/assign', assignment);
      const userRole = response.data.data;
      
      // Clear user roles cache
      this.clearUserRolesCache();
      
      // Log role assignment for compliance
      await this.logRoleAction('role_assigned', userRole.roleId, {
        userId: assignment.userId,
        assignedBy: assignment.assignedBy,
        reason: assignment.reason,
      });
      
      return userRole;
    } catch (error) {
      console.error('Failed to assign role:', error);
      throw new Error('Failed to assign role');
    }
  }

  // Remove role from user
  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    try {
      await this.api.delete(`/user-roles/${userId}/${roleId}`);
      
      // Clear user roles cache
      this.clearUserRolesCache();
      
      // Log role removal for compliance
      await this.logRoleAction('role_removed', roleId, { userId });
      
      return true;
    } catch (error) {
      console.error('Failed to remove role:', error);
      return false;
    }
  }

  // Get user's roles
  async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      const response = await this.api.get(`/user-roles/${userId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get user roles:', error);
      return [];
    }
  }

  // Get all role assignments
  async getAllRoleAssignments(): Promise<UserRole[]> {
    try {
      const response = await this.api.get('/user-roles');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get role assignments:', error);
      return [];
    }
  }

  // Permission Management Methods

  // Check if user has permission for specific action
  async checkPermission(permissionCheck: PermissionCheck): Promise<{
    allowed: boolean;
    reason?: string;
    conditions?: any;
  }> {
    try {
      const response = await this.api.post('/permissions/check', permissionCheck);
      return response.data.data;
    } catch (error) {
      console.error('Permission check failed:', error);
      return { allowed: false, reason: 'Permission check failed' };
    }
  }

  // Check multiple permissions at once
  async checkMultiplePermissions(
    userId: string,
    permissions: Array<{ resource: string; action: string; resourceId?: string }>
  ): Promise<{
    [key: string]: { allowed: boolean; reason?: string };
  }> {
    try {
      const response = await this.api.post('/permissions/check-multiple', {
        userId,
        permissions,
      });
      return response.data.data;
    } catch (error) {
      console.error('Multiple permission check failed:', error);
      return {};
    }
  }

  // Get user's effective permissions
  async getUserEffectivePermissions(userId: string): Promise<Permission[]> {
    try {
      const response = await this.api.get(`/permissions/user/${userId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get user permissions:', error);
      return [];
    }
  }

  // Role Hierarchy Methods

  // Check if user can manage another user's role
  async canManageUserRole(managerId: string, targetUserId: string): Promise<boolean> {
    try {
      const response = await this.api.get(`/roles/can-manage/${managerId}/${targetUserId}`);
      return response.data.data.canManage;
    } catch (error) {
      console.error('Failed to check role management permission:', error);
      return false;
    }
  }

  // Get role hierarchy
  async getRoleHierarchy(): Promise<{
    roles: Role[];
    hierarchy: Array<{ roleId: string; parentRoleId?: string; level: number }>;
  }> {
    try {
      const response = await this.api.get('/roles/hierarchy');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get role hierarchy:', error);
      return { roles: [], hierarchy: [] };
    }
  }

  // Compliance and Audit Methods

  // Log role-related actions for compliance
  private async logRoleAction(action: string, resourceId: string, details: any): Promise<void> {
    try {
      await complianceService.logAction(action, 'role_management', resourceId, details);
    } catch (error) {
      console.error('Failed to log role action:', error);
    }
  }

  // Get role management audit log
  async getRoleAuditLog(filters?: {
    userId?: string;
    roleId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLog[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.userId) queryParams.append('userId', filters.userId);
      if (filters?.roleId) queryParams.append('roleId', filters.roleId);
      if (filters?.action) queryParams.append('action', filters.action);
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);

      const response = await this.api.get(`/roles/audit-log?${queryParams.toString()}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get role audit log:', error);
      return [];
    }
  }

  // Role Templates and Presets

  // Get healthcare role templates
  getHealthcareRoleTemplates(): Partial<Role>[] {
    return HEALTHCARE_ROLES;
  }

  // Create role from template
  async createRoleFromTemplate(templateName: string, customizations?: Partial<Role>): Promise<Role> {
    try {
      const template = HEALTHCARE_ROLES.find(role => role.name === templateName);
      if (!template) {
        throw new Error('Template not found');
      }

      const roleData = {
        ...template,
        ...customizations,
        isSystem: false,
      };

      return await this.createRole(roleData);
    } catch (error) {
      console.error('Failed to create role from template:', error);
      throw new Error('Failed to create role from template');
    }
  }

  // Bulk role operations

  // Bulk assign roles to users
  async bulkAssignRoles(assignments: RoleAssignment[]): Promise<{
    success: number;
    failed: number;
    errors: Array<{ userId: string; error: string }>;
  }> {
    try {
      const response = await this.api.post('/user-roles/bulk-assign', { assignments });
      return response.data.data;
    } catch (error) {
      console.error('Bulk role assignment failed:', error);
      throw new Error('Bulk role assignment failed');
    }
  }

  // Bulk remove roles from users
  async bulkRemoveRoles(removals: Array<{ userId: string; roleId: string }>): Promise<{
    success: number;
    failed: number;
    errors: Array<{ userId: string; error: string }>;
  }> {
    try {
      const response = await this.api.post('/user-roles/bulk-remove', { removals });
      return response.data.data;
    } catch (error) {
      console.error('Bulk role removal failed:', error);
      throw new Error('Bulk role removal failed');
    }
  }

  // Cache Management Methods

  private cacheRoles(roles: Role[]): void {
    try {
      const cacheData = {
        roles,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.ROLES_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache roles:', error);
    }
  }

  private getCachedRoles(): Role[] {
    try {
      const cacheString = localStorage.getItem(this.ROLES_CACHE_KEY);
      if (cacheString) {
        const cacheData = JSON.parse(cacheString);
        if (Date.now() - cacheData.timestamp < this.CACHE_EXPIRY) {
          return cacheData.roles;
        }
      }
    } catch (error) {
      console.error('Failed to get cached roles:', error);
    }
    return [];
  }

  private clearRolesCache(): void {
    try {
      localStorage.removeItem(this.ROLES_CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear roles cache:', error);
    }
  }

  private clearUserRolesCache(): void {
    try {
      localStorage.removeItem(this.USER_ROLES_CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear user roles cache:', error);
    }
  }

  // Utility Methods

  // Get role level name
  getRoleLevelName(level: number): string {
    if (level >= 100) return 'System';
    if (level >= 90) return 'Executive';
    if (level >= 80) return 'Senior Management';
    if (level >= 70) return 'Management';
    if (level >= 60) return 'Senior Professional';
    if (level >= 50) return 'Professional';
    if (level >= 40) return 'Junior Professional';
    if (level >= 30) return 'Support Staff';
    if (level >= 20) return 'Temporary';
    return 'Guest';
  }

  // Check if role is higher level than another
  isHigherLevel(role1: Role, role2: Role): boolean {
    return role1.level > role2.level;
  }

  // Get roles that can be managed by a given role
  getManageableRoles(managerRole: Role): Role[] {
    return HEALTHCARE_ROLES.filter(role => role.level! < managerRole.level) as Role[];
  }
}

export const roleManagementService = new RoleManagementService();
export default roleManagementService;



