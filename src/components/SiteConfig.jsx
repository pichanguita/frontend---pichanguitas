import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useConfigStore from '../store/configStore'
import ImageCategoryManager from './ImageCategoryManager'
import SocialMediaManager from './SocialMediaManager'
import ContactConfigManager from './ContactConfigManager'
import { useSiteConfig } from '../hooks/useSiteConfig'
import { ConfigTabs, VideosTab, VideoPreviewModal } from './site-config'

const SiteConfig = () => {
  const configStore = useConfigStore()
  const {
    videoForm,
    activeTab,
    previewVideo,
    setActiveTab,
    handleVideoChange,
    saveVideo,
    saveAllVideos,
    openVideoPreview,
    closeVideoPreview,
  } = useSiteConfig(configStore)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Configuración del Sitio</h1>
        <p className="text-secondary-600">Gestiona los videos tutoriales e imágenes del proyecto</p>
      </div>

      {/* Tabs */}
      <ConfigTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'videos' && (
          <VideosTab
            videoForm={videoForm}
            onVideoChange={handleVideoChange}
            onSaveVideo={saveVideo}
            onSaveAllVideos={saveAllVideos}
            onPreview={openVideoPreview}
          />
        )}

        {activeTab === 'images' && (
          <motion.div
            key="images"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ImageCategoryManager />
          </motion.div>
        )}

        {activeTab === 'social' && (
          <motion.div
            key="social"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SocialMediaManager />
          </motion.div>
        )}

        {activeTab === 'contact' && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ContactConfigManager />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Preview Modal */}
      <VideoPreviewModal videoUrl={previewVideo} onClose={closeVideoPreview} />
    </div>
  )
}

export default SiteConfig
