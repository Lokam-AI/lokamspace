export interface SignInCredentials {
  email: string;
  password?: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password?: string;
  organizationName: string;
  location: string;
} 