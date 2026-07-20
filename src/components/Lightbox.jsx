import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getYouTubeEmbedUrl } from '../utils/helpers.jsx';

const Lightbox = ({ open, onClose, type, items, index, onIndexChange }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open || items.length === 0) return;
      if (e.key === 'ArrowLeft') {
        onIndexChange((index - 1 + items.length) % items.length);
      } else if (e.key === 'ArrowRight') {
        onIndexChange((index + 1) % items.length);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, items, index, onClose, onIndexChange]);

  if (!open || items.length === 0) return null;

  const currentItem = items[index];

  return (
    <div className="modal-overlay" style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 1200 }}>
      <div style={{ position: 'relative', width: '90%', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '-50px', right: '0', background: 'none', border: '2px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1250, transition: 'all 0.2s' }}
          title="Close"
        >
          <X size={20} />
        </button>

        <div style={{ width: '100%', backgroundColor: '#020617', borderRadius: '12px 12px 0 0', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', maxHeight: '70vh' }}>
          {type === 'photo' ? (
            <img 
              src={currentItem.file_url} 
              alt={currentItem.title} 
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} 
            />
          ) : (
            (() => {
              const embedUrl = getYouTubeEmbedUrl(currentItem.file_url);
              const isYouTube = currentItem.file_url?.includes('youtube.com') || currentItem.file_url?.includes('youtu.be');
              if (isYouTube) {
                return (
                  <iframe 
                    src={embedUrl} 
                    style={{ width: '100%', height: '500px', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={currentItem.title}
                  />
                );
              }
              return (
                <video 
                  src={currentItem.file_url} 
                  controls 
                  autoPlay 
                  style={{ maxWidth: '100%', maxHeight: '70vh' }}
                />
              );
            })()
          )}

          {items.length > 1 && (
            <button 
              onClick={() => onIndexChange((index - 1 + items.length) % items.length)} 
              style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}
              title="Previous"
            >
              <ChevronLeft size={30} />
            </button>
          )}

          {items.length > 1 && (
            <button 
              onClick={() => onIndexChange((index + 1) % items.length)} 
              style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}
              title="Next"
            >
              <ChevronRight size={30} />
            </button>
          )}
        </div>

        <div style={{ padding: '20px 30px', backgroundColor: '#0B0F19', color: 'white', borderTop: '1px solid rgba(255,255,255,0.08)', width: '100%', boxSizing: 'border-box', borderRadius: '0 0 12px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#38BDF8', margin: 0 }}>
              {currentItem.title || 'Untitled item'}
            </h3>
            {items.length > 1 && (
              <span style={{ fontSize: '0.85rem', color: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>
                {index + 1} / {items.length}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.95rem', color: '#E2E8F0', margin: 0, lineHeight: '1.6' }}>
            {currentItem.description || 'No description provided.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
