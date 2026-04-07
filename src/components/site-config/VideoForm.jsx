import React from 'react'
import { Save, PlayCircle } from 'lucide-react'

const VideoForm = ({ videoKey, videoData, onChange, onSave, onPreview, title }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-secondary-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-secondary-900 flex items-center space-x-2">
          <PlayCircle className="w-6 h-6 text-primary-600" />
          <span>{title}</span>
        </h3>
        <button
          onClick={() => onPreview(videoData.url)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Vista Previa</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            URL del Video (YouTube Embed)
          </label>
          <input
            type="text"
            value={videoData.url}
            onChange={(e) => onChange(videoKey, 'url', e.target.value)}
            placeholder="https://www.youtube.com/embed/VIDEO_ID"
            className="w-full px-4 py-2 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-secondary-500">
            Formato: https://www.youtube.com/embed/VIDEO_ID
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Título</label>
          <input
            type="text"
            value={videoData.title}
            onChange={(e) => onChange(videoKey, 'title', e.target.value)}
            className="w-full px-4 py-2 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Descripción</label>
          <textarea
            value={videoData.description}
            onChange={(e) => onChange(videoKey, 'description', e.target.value)}
            rows="2"
            className="w-full px-4 py-2 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
          />
        </div>

        <button
          onClick={() => onSave(videoKey)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Video</span>
        </button>
      </div>
    </div>
  )
}

export default VideoForm
