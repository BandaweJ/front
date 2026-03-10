export enum ROLES {
  teacher = 'teacher',
  student = 'student',
  parent = 'parent',
  admin = 'admin',
  reception = 'reception',
  hod = 'hod',
  auditor = 'auditor',
  director = 'director',
  dev = 'dev',
}

/** Roles shown in dropdowns (excludes dev – not for general user assignment). */
export const ROLES_FOR_SELECTION: ROLES[] = Object.values(ROLES).filter(
  (r) => r !== ROLES.dev
);
