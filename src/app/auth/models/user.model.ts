import { ROLES } from 'src/app/registration/models/roles.enum';

export interface User {
  username: string;
  role: ROLES;
  id: string;
  iat: number;
  exp: number;
}
