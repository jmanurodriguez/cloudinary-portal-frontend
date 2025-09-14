import React, { useState } from 'react';
import { X, FolderPlus, Loader } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { createFolder } from '../services/api';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (folderName: string) => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folderName.trim()) {
      setError('El nombre de la carpeta es obligatorio');
      return;
    }

    // Validar nombre de carpeta (solo letras, números, guiones y guiones bajos)
    const validNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validNameRegex.test(folderName.trim())) {
      setError('El nombre solo puede contener letras, números, guiones y guiones bajos');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Obtener token de autenticación de Clerk
      const token = await getToken();
      if (!token) {
        throw new Error('No se pudo obtener el token de autorización');
      }

      // Llamar a la API para crear la carpeta
      await createFolder(folderName.trim(), token);

      onSuccess(folderName.trim());
      handleClose();
    } catch (error: any) {
      setError(error.message || 'Error al crear la carpeta');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setFolderName('');
      setError(null);
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFolderName(value);
    if (error) setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FolderPlus className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold">Nueva Carpeta</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isCreating}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la carpeta
              </label>
              <input
                type="text"
                id="folderName"
                value={folderName}
                onChange={handleInputChange}
                disabled={isCreating}
                placeholder="mi-nueva-carpeta"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                Solo letras, números, guiones (-) y guiones bajos (_)
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Información</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• La carpeta se creará en tu cuenta de Cloudinary</li>
                <li>• Los usuarios podrán subir archivos a esta carpeta</li>
                <li>• Puedes eliminarla más tarde si es necesario</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating || !folderName.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  Crear Carpeta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;