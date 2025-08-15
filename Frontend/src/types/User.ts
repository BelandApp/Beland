export type User = {
  id: string;
  auth0_id: string;
  email: string;
  full_name: string;
  profile_picture_url?: string;
  role_name?: "USER" | "LEADER" | "EMPRESA" | "ADMIN" | "SUPERADMIN";
};
