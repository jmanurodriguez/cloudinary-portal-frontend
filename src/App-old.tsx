import { useState } from 'react';
import { Cloud, ArrowLeft } from 'lucide-react';
import FolderList from './components/FolderList';
import UploadModal from './components/UploadModal';
import { CloudinaryFolder } from './types';

function App() {
  const [selectedFolder, setSelectedFolder] = useState<CloudinaryFolder | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleFolderSelect = (folder: CloudinaryFolder) => {
    setSelectedFolder(folder);
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFolder(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Portal de Archivos
                </h1>
                <p className="text-sm text-gray-500">
                  Sube tus documentos de forma segura
                </p>
              </div>
            </div>

            {/* Indicador de conexión */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Conectado</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          {/* Breadcrumb */}
          {selectedFolder && (
            <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
              <button
                onClick={() => setSelectedFolder(null)}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a carpetas
              </button>
              <span>/</span>
              <span className="font-medium">{selectedFolder.name}</span>
            </div>
          )}

          {/* Título de la sección */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedFolder ? `Carpeta: ${selectedFolder.name}` : 'Selecciona una Carpeta'}
            </h2>
            <p className="text-gray-600">
              {selectedFolder 
                ? 'Aquí puedes subir tus archivos a esta carpeta específica.'
                : 'Elige la carpeta donde deseas subir tus archivos. Las carpetas son creadas por el administrador en Cloudinary.'
              }
            </p>
          </div>

          {/* Lista de carpetas */}
          <FolderList onFolderSelect={handleFolderSelect} />

          {/* Información adicional */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              💡 Información Importante
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Los archivos se suben directamente a Cloudinary de forma segura</p>
              <p>• Puedes subir múltiples archivos a la vez</p>
              <p>• Formatos soportados: imágenes, documentos PDF, archivos de texto, etc.</p>
              <p>• El progreso de subida se muestra en tiempo real</p>
              <p>• Si no ves la carpeta que necesitas, contacta al administrador</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de subida */}
      {selectedFolder && (
        <UploadModal
          folder={selectedFolder}
          isOpen={isUploadModalOpen}
          onClose={handleCloseUploadModal}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Portal de Carga de Archivos - Powered by Cloudinary</p>
            <p className="mt-1">Diseñado para una experiencia de usuario óptima</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;