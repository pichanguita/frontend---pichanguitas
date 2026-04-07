import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const VideoPreviewModal = ({ videoUrl, onClose }) => {
  if (!videoUrl) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">Vista Previa del Video</h3>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="aspect-video bg-black">
            <iframe
              src={videoUrl}
              title="Video Preview"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VideoPreviewModal
