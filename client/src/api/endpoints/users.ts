import { API_BASE_URL, getHeaders, handleApiError } from "../config";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  organization_id: string;
  is_active: boolean;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: string;
  organization_id: string;
  is_active?: boolean;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
}

export interface ProfileUpdate {
  name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    method: "GET",
    headers: getHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

export const getUserProfile = async (): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: getHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

export const createUser = async (userData: UserCreate): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });

  await handleApiError(response);
  return response.json();
};

export const updateUser = async (
  userId: number,
  userData: UserUpdate
): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });

  await handleApiError(response);
  return response.json();
};

export const deleteUser = async (userId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  await handleApiError(response);
};

export const updateProfile = async (userData: ProfileUpdate): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });

  await handleApiError(response);
  return response.json();
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/me/change-password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });

  await handleApiError(response);
};
