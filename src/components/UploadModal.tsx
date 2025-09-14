import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Image, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { CloudinaryFolder, FileUploadState, UploadProgress } from '../types';
import { getUploadSignature, uploadFileToCloudinary } from '../services/api';

interface UploadModalProps {
  folder: CloudinaryFolder;
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ folder, isOpen, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStates, setUploadStates] = useState<Map<string, FileUploadState>>(new Map());
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    setSelectedFiles(prev => [...prev, ...newFiles]);
    
    // Inicializar estados de subida para los nuevos archivos
    const newUploadStates = new Map(uploadStates);
    newFiles.forEach(file => {
      const fileKey = `${file.name}-${file.size}`;
      newUploadStates.set(fileKey, {
        isUploading: false,
        progress: { loaded: 0, total: 0, percentage: 0 },
        result: null
      });
    });
    setUploadStates(newUploadStates);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    const fileKey = `${fileToRemove.name}-${fileToRemove.size}`;
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadStates(prev => {
      const newStates = new Map(prev);
      newStates.delete(fileKey);
      return newStates;
    });
  };

  const uploadFile = async (file: File) => {
    const fileKey = `${file.name}-${file.size}`;
    
    try {
      // Actualizar estado: iniciando subida
      setUploadStates(prev => {
        const newStates = new Map(prev);
        const currentState = newStates.get(fileKey) || {
          isUploading: false,
          progress: { loaded: 0, total: 0, percentage: 0 },
          result: null
        };
        newStates.set(fileKey, {
          ...currentState,
          isUploading: true,
          result: null
        });
        return newStates;
      });

      // Obtener firma del backend
      const signatureData = await getUploadSignature(folder.name);

      // Subir archivo a Cloudinary con seguimiento de progreso
      const result = await uploadFileToCloudinary(
        file,
        signatureData,
        (progress: UploadProgress) => {
          setUploadStates(prev => {
            const newStates = new Map(prev);
            const currentState = newStates.get(fileKey);
            if (currentState) {
              newStates.set(fileKey, {
                ...currentState,
                progress
              });
            }
            return newStates;
          });
        }
      );

      // Actualizar estado: subida exitosa
      setUploadStates(prev => {
        const newStates = new Map(prev);
        newStates.set(fileKey, {
          isUploading: false,
          progress: { loaded: 100, total: 100, percentage: 100 },
          result: {
            success: true,
            public_id: result.public_id,
            secure_url: result.secure_url
          }
        });
        return newStates;
      });

    } catch (error: any) {
      // Actualizar estado: error en la subida
      setUploadStates(prev => {
        const newStates = new Map(prev);
        newStates.set(fileKey, {
          isUploading: false,
          progress: { loaded: 0, total: 0, percentage: 0 },
          result: {
            success: false,
            error: error.message
          }
        });
        return newStates;
      });
    }
  };

  const uploadAllFiles = async () => {
    for (const file of selectedFiles) {
      await uploadFile(file);
    }
  };

  const resetModal = () => {
    setSelectedFiles([]);
    setUploadStates(new Map());
    setIsDragOver(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-green-500" />;
    }
    return <FileText className="w-5 h-5 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasUploadingFiles = Array.from(uploadStates.values()).some(state => state.isUploading);
  const allFilesProcessed = selectedFiles.length > 0 && Array.from(uploadStates.values()).every(state => !state.isUploading && state.result !== null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Subir Archivos
            </h2>
            <p className="text-sm text-gray-600">
              Carpeta: <span className="font-medium">{folder.name}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={hasUploadingFiles}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Zona de arrastrar y soltar */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Soporta imágenes, documentos y otros tipos de archivo
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled={hasUploadingFiles}
            >
              Seleccionar Archivos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={hasUploadingFiles}
            />
          </div>

          {/* Lista de archivos seleccionados */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-4">
                Archivos Seleccionados ({selectedFiles.length})
              </h3>
              <div className="space-y-3">
                {selectedFiles.map((file, index) => {
                  const fileKey = `${file.name}-${file.size}`;
                  const uploadState = uploadStates.get(fileKey);
                  
                  return (
                    <div key={fileKey} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {getFileIcon(file)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                        
                        {/* Barra de progreso */}
                        {uploadState?.isUploading && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadState.progress.percentage}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {uploadState.progress.percentage}% - Subiendo...
                            </p>
                          </div>
                        )}
                        
                        {/* Estado del resultado */}
                        {uploadState?.result && (
                          <div className="mt-2 flex items-center gap-2">
                            {uploadState.result.success ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600">
                                  Subido correctamente
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-red-600">
                                  {uploadState.result.error}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Botón eliminar */}
                      {!uploadState?.isUploading && (
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                      
                      {/* Indicador de carga */}
                      {uploadState?.isUploading && (
                        <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedFiles.length > 0 && (
          <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {selectedFiles.length} archivo(s) seleccionado(s)
            </p>
            <div className="flex gap-3">
              <button
                onClick={resetModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={hasUploadingFiles}
              >
                Limpiar
              </button>
              {!allFilesProcessed && (
                <button
                  onClick={uploadAllFiles}
                  disabled={hasUploadingFiles}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {hasUploadingFiles && <Loader className="w-4 h-4 animate-spin" />}
                  {hasUploadingFiles ? 'Subiendo...' : 'Subir Archivos'}
                </button>
              )}
              {allFilesProcessed && (
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Finalizar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadModal;