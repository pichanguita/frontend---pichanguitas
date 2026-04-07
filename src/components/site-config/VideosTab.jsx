import React from 'react'
import { motion } from 'framer-motion'
import { Save, RefreshCw, AlertCircle } from 'lucide-react'
import VideoForm from './VideoForm'

const VideosTab = ({
  videoForm,
  onVideoChange,
  onSaveVideo,
  onSaveAllVideos,
  onReset,
  onPreview,
}) => {
  return (
    <motion.div
      key="videos"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <button
            onClick={onSaveAllVideos}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Todos</span>
          </button>
        </div>

        <button
          onClick={onReset}
          className="text-red-600 hover:text-red-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restaurar por Defecto</span>
        </button>
      </div>

      {/* Video Forms */}
      <VideoForm
        videoKey="tutorialReserva"
        videoData={videoForm.tutorialReserva}
        onChange={onVideoChange}
        onSave={onSaveVideo}
        onPreview={onPreview}
        title="Video: Cómo Reservar una Cancha"
      />

      <VideoForm
        videoKey="tutorialAdmin"
        videoData={videoForm.tutorialAdmin}
        onChange={onVideoChange}
        onSave={onSaveVideo}
        onPreview={onPreview}
        title="Video: Cómo Registrarse como Admin"
      />

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Cómo obtener la URL de YouTube:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Ve a tu video en YouTube</li>
              <li>Copia el ID del video de la URL (después de "watch?v=")</li>
              <li>Usa el formato: https://www.youtube.com/embed/VIDEO_ID</li>
            </ol>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default VideosTab
