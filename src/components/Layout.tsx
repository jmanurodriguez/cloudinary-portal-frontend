import React from 'react';
import { useUser, UserButton, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { Cloud, Shield } from 'lucide-react';
import { isUserAdmin } from '../lib/clerk';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSignedIn, user, isLoaded } = useUser();
  const isAdmin = isSignedIn && isUserAdmin(user?.emailAddresses[0]?.emailAddress);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
          <div className="w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Footer Mejorado */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200/50 mt-auto">
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
};

export default Layout;