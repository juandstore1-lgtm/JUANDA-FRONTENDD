import { useEffect, useState } from "react";
import AnimatedSection from "../components/AnimatedSection";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { GalleryService, VideoService } from "../services/api";
import { GalleryImage, Video } from "../types";

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      GalleryService.getImages(),
      VideoService.getVideos()
    ])
      .then(([galleryData, videoData]) => {
        setImages(galleryData.sort((a, b) => a.order - b.order));
        setVideos(videoData);
        // Automatically activate the first video so it autoplays without needing a click
        if (videoData && videoData.length > 0) {
          setPlayingVideoId(videoData[0].id);
        }
      })
      .catch((err) => console.error("Error loading gallery and videos:", err))
      .finally(() => setLoading(false));
  }, []);

  // YouTube ID Extractor
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // TikTok ID Extractor
  const getTikTokId = (url: string) => {
    if (!url) return null;
    const match = url.match(/video\/(\d+)/) || url.match(/\/v\/(\d+)/) || url.match(/embed\/(?:v2\/)?(\d+)/);
    return match ? match[1] : null;
  };

  const renderVideoPlayer = (url: string, title: string, isAutoplay: boolean = true) => {
    const ytId = getYoutubeId(url);
    const tiktokId = getTikTokId(url);

    if (ytId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=${isAutoplay ? 1 : 0}&mute=0&enablejsapi=1&rel=0`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; volume"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      );
    }

    if (tiktokId) {
      return (
        <iframe
          src={`https://www.tiktok.com/embed/v2/${tiktokId}?lang=es-ES`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; volume"
          allowFullScreen
          className="w-full max-w-[365px] h-[580px] shadow-2xl rounded-xl border border-gray-800"
        ></iframe>
      );
    }

    return (
      <video
        src={url}
        controls
        autoPlay={isAutoplay}
        className="w-full h-full object-contain"
      ></video>
    );
  };

  const handlePrevVideo = () => {
    const prevIdx = activeVideoIndex === 0 ? videos.length - 1 : activeVideoIndex - 1;
    setActiveVideoIndex(prevIdx);
    if (videos[prevIdx]) {
      setPlayingVideoId(videos[prevIdx].id);
    }
  };

  const handleNextVideo = () => {
    const nextIdx = activeVideoIndex === videos.length - 1 ? 0 : activeVideoIndex + 1;
    setActiveVideoIndex(nextIdx);
    if (videos[nextIdx]) {
      setPlayingVideoId(videos[nextIdx].id);
    }
  };

  const handleSelectVideo = (idx: number) => {
    setActiveVideoIndex(idx);
    if (videos[idx]) {
      setPlayingVideoId(videos[idx].id);
    }
  };

  const currentVideo = videos[activeVideoIndex];
  const isCurrentTikTok = Boolean(currentVideo && getTikTokId(currentVideo.url));

  return (
    <div className="pt-32 pb-24 w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        <AnimatedSection className="mb-20 text-center">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6 text-chrome">
            Galería & <br/><span className="text-chrome">Lifestyle.</span>
          </h1>
          <p className="text-white/40 text-sm max-w-2xl mx-auto leading-relaxed">
            Nuestra estética capturada. Eventos, tiendas, behind the scenes y la comunidad que hace posible JDQSTORE.
          </p>
        </AnimatedSection>

        {/* Featured Video Section */}
        {videos.length > 0 && (
          <div className="mb-24">
            {videos.length >= 2 ? (
              // Video Carousel Mode
              <AnimatedSection className="w-full relative group">
                <div className={`relative transition-all duration-500 flex items-center justify-center ${
                  isCurrentTikTok
                    ? "max-w-[365px] mx-auto min-h-[580px]"
                    : "w-full aspect-video bg-gray-900 overflow-hidden border border-gray-800 shadow-2xl"
                }`}>
                  {playingVideoId === videos[activeVideoIndex].id ? (
                    renderVideoPlayer(videos[activeVideoIndex].url, videos[activeVideoIndex].title, true)
                  ) : (
                    <div 
                      onClick={() => setPlayingVideoId(videos[activeVideoIndex].id)}
                      className="w-full h-full cursor-pointer relative group/play min-h-[400px] flex items-center justify-center bg-gray-900"
                    >
                      <img 
                        src={getYoutubeId(videos[activeVideoIndex].url) ? `https://img.youtube.com/vi/${getYoutubeId(videos[activeVideoIndex].url)}/maxresdefault.jpg` : "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop"} 
                        alt={videos[activeVideoIndex].title} 
                        className="w-full h-full object-cover opacity-70 group-hover/play:scale-101 transition-transform duration-700" 
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop' }}
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover/play:bg-black/50 transition-colors duration-500 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover/play:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-white ml-2 animate-pulse" />
                        </div>
                      </div>
                      <div className="absolute bottom-10 left-10 text-white z-10 text-left">
                        <span className="text-xs font-bold tracking-[0.4em] uppercase opacity-70 mb-2 block">{videos[activeVideoIndex].category || 'Campaign'}</span>
                        <h2 className="text-3xl font-black italic uppercase leading-none">{videos[activeVideoIndex].title}</h2>
                      </div>
                    </div>
                  )}
                </div>

                {/* Left Navigation Arrow */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePrevVideo(); }}
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-red-600 text-white transition-colors duration-300 z-30 shadow-2xl rounded-full border border-white/20"
                  aria-label="Previous Video"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Right Navigation Arrow */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNextVideo(); }}
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-3 bg-black/80 hover:bg-red-600 text-white transition-colors duration-300 z-30 shadow-2xl rounded-full border border-white/20"
                  aria-label="Next Video"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dot indicators */}
                <div className="flex justify-center space-x-2 mt-4">
                  {videos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectVideo(idx)}
                      className={`w-8 h-1 transition-all duration-300 ${activeVideoIndex === idx ? 'bg-black' : 'bg-gray-300 hover:bg-gray-400'}`}
                      aria-label={`Go to video ${idx + 1}`}
                    />
                  ))}
                </div>
              </AnimatedSection>
            ) : (
              // Single video mode (Autoplays automatically)
              <div className="space-y-12">
                {videos.map((video) => {
                  const isTikTok = Boolean(getTikTokId(video.url));
                  return (
                    <AnimatedSection key={video.id} className="w-full">
                      <div className={`relative transition-all duration-500 flex items-center justify-center ${
                        isTikTok
                          ? "max-w-[365px] mx-auto min-h-[580px]"
                          : "w-full aspect-video bg-gray-900 overflow-hidden border border-gray-800 shadow-2xl"
                      }`}>
                        {renderVideoPlayer(video.url, video.title, true)}
                      </div>
                    </AnimatedSection>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.length > 0 ? (
            images.map((item, idx) => (
              <AnimatedSection key={item.id || idx} delay={idx * 0.1}>
                <div className="bg-gray-100 aspect-[4/5] relative group overflow-hidden cursor-pointer">
                  <img src={item.url} alt={item.title || `Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100">
                    <h3 className="text-white text-sm font-bold uppercase tracking-widest">{item.title}</h3>
                    <p className="text-white/60 text-xs mt-1">{item.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))
          ) : !loading ? (
            <div className="col-span-full py-16 text-center text-white/40 text-sm">
              No hay imágenes en la galería.
            </div>
          ) : (
            <div className="col-span-full py-12 text-center text-white/40">Cargando galería...</div>
          )}
        </div>

      </div>
    </div>
  );
}
