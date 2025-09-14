import React, { useState, useEffect } from 'react';
import { Folder, RefreshCw, AlertCircle } from 'lucide-react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { CloudinaryFolder } from '../types';
import { getFolders, deleteFolder } from '../services/api';
import { isUserAdmin } from '../lib/clerk';
import FolderCard from './FolderCard';

interface FolderListProps {
  onFolderSelect: (folder: CloudinaryFolder) => void;
}

const FolderList: React.FC<FolderListProps> = ({ onFolderSelect }) => {
  const [folders, setFolders] = useState<CloudinaryFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingFolders, setDeletingFolders] = useState<Set<string>>(new Set());

  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const isAdmin = isSignedIn && isUserAdmin(user?.emailAddresses[0]?.emailAddress);

  const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      const foldersData = await getFolders();
      setFolders(foldersData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las carpetas');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async (folder: CloudinaryFolder) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la carpeta "${folder.name}"? Esta acción eliminará todos los archivos dentro de la carpeta.`)) {
      return;
    }

    setDeletingFolders(prev => new Set(prev).add(folder.name));

    try {
      // Obtener token de autenticación
      const token = await getToken();
      if (!token) {
        throw new Error('No se pudo obtener el token de autorización');
      }

      // Llamar a la API para eliminar la carpeta
      await deleteFolder(folder.name, token);

      // Recargar carpetas después de eliminar
      await loadFolders();
    } catch (error: any) {
      console.error('Error al eliminar carpeta:', error);
      alert('Error al eliminar la carpeta: ' + error.message);
    } finally {
      setDeletingFolders(prev => {
        const newSet = new Set(prev);
        newSet.delete(folder.name);
        return newSet;
      });
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Cargando carpetas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-600 mb-4 text-center">{error}</p>
        <button
          onClick={loadFolders}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Folder className="w-8 h-8 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">No se encontraron carpetas</p>
        <p className="text-sm text-gray-500 text-center">
          Asegúrate de crear carpetas en tu panel de Cloudinary
        </p>
        <button
          onClick={loadFolders}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">
          Carpetas Disponibles ({folders.length})
        </h3>
        <button
          onClick={loadFolders}
          className="p-2 text-gray-500 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50"
          title="Actualizar carpetas"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <FolderCard
            key={folder.path}
            folder={folder}
            onSelect={onFolderSelect}
            onDelete={isAdmin ? handleDeleteFolder : undefined}
            isAdmin={isAdmin}
            isDeleting={deletingFolders.has(folder.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default FolderList;