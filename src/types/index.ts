// Tipos compartidos con el backend
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CloudinaryFolder {
  name: string;
  path: string;
}

export interface SignUploadResponse {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
}

// Tipos específicos del frontend
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  public_id?: string;
  secure_url?: string;
  error?: string;
}

export interface FileUploadState {
  isUploading: boolean;
  progress: UploadProgress;
  result: UploadResult | null;
}