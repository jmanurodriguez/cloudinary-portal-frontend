import axios from 'axios';
import { ApiResponse, CloudinaryFolder, SignUploadResponse, UploadProgress } from '../types';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la API:', error);
    return Promise.reject(error);
  }
);

/**
 * Obtiene la lista de carpetas disponibles en Cloudinary
 */
export const getFolders = async (): Promise<CloudinaryFolder[]> => {
  try {
    const response = await api.get<ApiResponse<CloudinaryFolder[]>>('/folders');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Error al obtener carpetas');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error de conexión al servidor');
  }
};

/**
 * Obtiene una firma segura para subir archivos a una carpeta específica
 */
export const getUploadSignature = async (folder: string): Promise<SignUploadResponse> => {
  try {
    const response = await api.post<ApiResponse<SignUploadResponse>>('/sign-upload', {
      folder,
      resource_type: 'auto'
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Error al obtener firma de subida');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error de conexión al servidor');
  }
};

/**
 * Sube un archivo directamente a Cloudinary usando la firma obtenida del backend
 */
export const uploadFileToCloudinary = async (
  file: File,
  signatureData: SignUploadResponse,
  onProgress?: (progress: UploadProgress) => void
): Promise<any> => {
  const formData = new FormData();

  // Agregar el archivo y los datos necesarios para la subida (mismo orden que la firma)
  formData.append('file', file);
  formData.append('folder', signatureData.folder);
  formData.append('timestamp', signatureData.timestamp.toString());
  formData.append('api_key', signatureData.api_key);
  formData.append('signature', signatureData.signature);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
            };
            onProgress(progress);
          }
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Error al subir archivo a Cloudinary');
  }
};

/**
 * Crea una nueva carpeta (solo administradores)
 */
export const createFolder = async (name: string, authToken: string): Promise<CloudinaryFolder> => {
  try {
    const response = await api.post<ApiResponse<CloudinaryFolder>>('/folders',
      { name },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Error al crear carpeta');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error de conexión al servidor');
  }
};

/**
 * Elimina una carpeta (solo administradores)
 */
export const deleteFolder = async (folderName: string, authToken: string): Promise<void> => {
  try {
    const response = await api.delete<ApiResponse>(`/folders/${folderName}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al eliminar carpeta');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error de conexión al servidor');
  }
};