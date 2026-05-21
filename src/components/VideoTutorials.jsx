import React, { useEffect } from 'react'
import { PlayCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import useVideoTutorialsStore from '../store/videoTutorialsStore'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const VideoTutorials = () => {
  const { videos, loadVideos } = useVideoTutorialsStore()

  useEffect(() => {
    loadVideos()
  }, [loadVideos])

  // Solo renderiza tutoriales con URL definida (evita iframes vacíos)
  const renderable = videos.filter((v) => v.video_url && v.video_url.trim() !== '')

  if (renderable.length === 0) return null

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-8 sm:mb-12 text-center"
          >
            Tutoriales en Video
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            {renderable.map((video) => (
              <motion.div
                key={video.slug}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-secondary-100 hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="aspect-video relative bg-secondary-100">
                  <iframe
                    src={video.video_url}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <PlayCircle className="w-5 h-5 text-primary-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-secondary-900">
                      {video.title}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-secondary-600">{video.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default VideoTutorials
