import { FileText, FileCode, FileSpreadsheet } from 'lucide-react';
import React from 'react';

export const API_URL = 'https://mopabot.duckdns.org';

// Helper to extract YouTube video ID and fetch HQ thumbnail
export const getYouTubeThumbnail = (url) => {
  if (!url) return null;
  let videoId = '';
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('embed/')[1]?.split('?')[0];
  }
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
};

// Helper to extract YouTube video ID and build a correct embed URL
export const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  let videoId = '';
  if (url.includes('youtube.com/watch?v=')) {
    const parts = url.split('v=');
    if (parts[1]) videoId = parts[1].split('&')[0];
  } else if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    if (parts[1]) videoId = parts[1].split('?')[0];
  } else if (url.includes('youtube.com/embed/')) {
    return url;
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

// File Icon Helper based on format
export const renderFileIcon = (fileType) => {
  const ext = fileType.toLowerCase();
  if (ext === '.pdf') return <FileCode size={36} style={{ color: '#EF4444' }} />;
  if (ext === '.xlsx' || ext === '.xls') return <FileSpreadsheet size={36} style={{ color: '#10B981' }} />;
  if (ext === '.docx' || ext === '.doc') return <FileText size={36} style={{ color: '#3B82F6' }} />;
  return <FileText size={36} style={{ color: '#64748B' }} />;
};
