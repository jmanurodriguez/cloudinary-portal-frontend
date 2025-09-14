import { useState } from 'react';
import { useUser, UserButton, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { Cloud, ArrowLeft, Shield, FolderPlus } from 'lucide-react';
import FolderList from './components/FolderList';
import UploadModal from './components/UploadModal';
import CreateFolderModal from './components/CreateFolderModal';
import { CloudinaryFolder } from './types';
import { isUserAdmin } from './lib/clerk';

function App() {
  const [selectedFolder, setSelectedFolder] = useState<CloudinaryFolder | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const { isSignedIn, user, isLoaded } = useUser();

  const isAdmin = isSignedIn && isUserAdmin(user?.emailAddresses[0]?.emailAddress);

  const handleFolderSelect = (folder: CloudinaryFolder) => {
    setSelectedFolder(folder);
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFolder(null);
  };

  const handleCreateFolderSuccess = (folderName: string) => {
    console.log('Carpeta creada:', folderName);
    // El FolderList se actualizará automáticamente
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header Mejorado */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y Título */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Portal de Archivos
                </h1>
                <p className="text-sm text-gray-500">
                  Gestión segura de documentos
                </p>
              </div>
            </div>

            {/* Authentication & Status */}
            <div className="flex items-center gap-4">
              {/* Indicador de Admin */}
              {isAdmin && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full border border-amber-200">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">Admin</span>
                </div>
              )}

              {/* Authentication */}
              {!isLoaded && (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              )}

              {isLoaded && !isSignedIn && (
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      Iniciar Sesión
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Registrarse
                    </button>
                  </SignUpButton>
                </div>
              )}

              {isLoaded && isSignedIn && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {user?.firstName || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10",
                      }
                    }}
                  />
                </div>
              )}

              {/* Status indicator */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">En línea</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Centrado y con mejor espaciado */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200/50">
            {/* Breadcrumb */}
            {selectedFolder && (
              <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a carpetas
                </button>
                <span>/</span>
                <span className="font-medium">{selectedFolder.name}</span>
              </div>
            )}

            {/* Header con botón de crear (solo admin) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedFolder ? `Carpeta: ${selectedFolder.name}` : 'Gestión de Carpetas'}
                </h2>
                <p className="text-gray-600">
                  {selectedFolder
                    ? 'Aquí puedes subir tus archivos a esta carpeta específica.'
                    : 'Selecciona una carpeta para subir archivos o gestiona las carpetas como administrador.'
                  }
                </p>
              </div>

              {/* Botón Crear Carpeta (solo admin) */}
              {isAdmin && !selectedFolder && (
                <div className="mt-4 sm:mt-0">
                  <button
                    onClick={() => setIsCreateFolderModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <FolderPlus className="w-5 h-5" />
                    Nueva Carpeta
                  </button>
                </div>
              )}
            </div>

            {/* Lista de carpetas */}
            <FolderList onFolderSelect={handleFolderSelect} />

            {/* Información adicional */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                💡 Información Importante
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div className="space-y-2">
                  <p>• Los archivos se suben directamente a Cloudinary de forma segura</p>
                  <p>• Puedes subir múltiples archivos a la vez</p>
                  <p>• El progreso de subida se muestra en tiempo real</p>
                </div>
                <div className="space-y-2">
                  <p>• Formatos soportados: imágenes, documentos PDF, archivos de texto, etc.</p>
                  <p>• Si no ves la carpeta que necesitas, contacta al administrador</p>
                  {isAdmin && <p>• Como admin, puedes crear y eliminar carpetas</p>}
                </div>
              </div>
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

      {/* Modal de crear carpeta */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onSuccess={handleCreateFolderSuccess}
      />

      {/* Footer Mejorado */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200/50 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Portal de Carga de Archivos - Powered by{' '}
              <span className="font-semibold text-blue-600">Cloudinary</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Diseñado para una experiencia de usuario óptima
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;