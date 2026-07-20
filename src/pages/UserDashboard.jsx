import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Search, Download, CheckCircle, HelpCircle, Video
} from 'lucide-react';
import { API_URL, renderFileIcon, getYouTubeThumbnail } from '../utils/helpers.jsx';

const UserDashboard = ({ currentUser, triggerToast, onOpenLightbox, appLanguage, translations }) => {
  const t = translations;
  const [userActiveTab, setUserActiveTab] = useState('documents');

  // Data
  const [documents, setDocuments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Search/filter
  const [docSearch, setDocSearch] = useState('');
  const [docDeptFilter, setDocDeptFilter] = useState('All');

  // Pagination
  const [userDocsPage, setUserDocsPage] = useState(1);
  const [userPhotosPage, setUserPhotosPage] = useState(1);
  const [userVideosPage, setUserVideosPage] = useState(1);

  const departments = ['All', 'Legislative Branch', 'Executive Branch', 'Lok Sabha Affairs', 'Rajya Sabha Affairs', 'Youth Parliament', 'RTI Section', 'Others'];

  // Fetch data
  useEffect(() => {
    const fetchAll = async () => {
      try { const res = await fetch(`${API_URL}/api/documents`); const data = await res.json(); if (Array.isArray(data)) setDocuments(data); } catch (e) { console.error(e); }
      try { const res = await fetch(`${API_URL}/api/photos`); const data = await res.json(); if (Array.isArray(data)) setPhotos(data); } catch (e) { console.error(e); }
      try { const res = await fetch(`${API_URL}/api/videos`); const data = await res.json(); if (Array.isArray(data)) setVideos(data); } catch (e) { console.error(e); }
      try { const res = await fetch(`${API_URL}/api/hero-images`); const data = await res.json(); if (Array.isArray(data)) setHeroImages(data); } catch (e) { console.error(e); }
    };
    fetchAll();
  }, []);

  // Carousel Autoplay
  useEffect(() => {
    const activeHeroes = heroImages.filter(h => h.is_active === 1);
    if (activeHeroes.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % activeHeroes.length);
    }, 5002);
    return () => clearInterval(interval);
  }, [heroImages]);

  // Reset page on tab switch
  useEffect(() => {
    setUserDocsPage(1);
    setUserPhotosPage(1);
    setUserVideosPage(1);
  }, [userActiveTab]);

  // Reset docs page on search change
  useEffect(() => { setUserDocsPage(1); }, [docSearch, docDeptFilter]);

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(docSearch.toLowerCase()) ||
                          doc.description.toLowerCase().includes(docSearch.toLowerCase()) ||
                          doc.department.toLowerCase().includes(docSearch.toLowerCase());
    const matchesDept = docDeptFilter === 'All' || doc.department === docDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Hero carousel display
  const defaultHeroes = [
    { id: -1, title: "Ministry of Parliamentary Affairs Portal", file_url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1400&auto=format&fit=crop", is_active: 1 },
    { id: -2, title: "Youth Parliament Competition Annual Session", file_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1400&auto=format&fit=crop", is_active: 1 }
  ];
  const activeHeroes = heroImages.filter(h => h.is_active === 1);
  const displayedHeroes = activeHeroes.length > 0 ? activeHeroes : defaultHeroes;

  return (
    <div id="main-content" style={{ flex: 1, padding: '30px 0 60px 0' }} className="container">
      <div>
        {/* Personalized Welcome Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '16px 24px', borderRadius: 'var(--border-radius-md)', borderLeft: '5px solid var(--accent-saffron)', borderRight: '1px solid var(--gray-border)', borderTop: '1px solid var(--gray-border)', borderBottom: '1px solid var(--gray-border)', marginBottom: '25px', boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: '700' }}>
              {t.welcome}, <span style={{ color: 'var(--primary-navy)' }}>{currentUser?.name}</span>!
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-text)' }}>{t.authPhone}: +91 {currentUser?.phone}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontWeight: '600', fontSize: '0.85rem' }}>
            <CheckCircle size={16} /> {t.verified}
          </div>
        </div>

        {/* Banner Carousel */}
        <div className="hero-carousel">
          {displayedHeroes.map((slide, index) => (
            <div
              key={slide.id}
              className="carousel-slide"
              style={{
                backgroundImage: `url(${slide.file_url})`,
                display: index === currentHeroIndex ? 'flex' : 'none'
              }}
            >
              <div className="carousel-overlay">
                <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--accent-saffron)', color: 'white', padding: '4px 10px', borderRadius: '4px', alignSelf: 'flex-start', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {appLanguage === 'en' ? 'Ministry Spotlight' : 'मंत्रालय सुर्खियों में'}
                </span>
                <h2 className="carousel-title">{slide.title || 'Official Announcement'}</h2>
              </div>
            </div>
          ))}
          {displayedHeroes.length > 1 && (
            <>
              <button onClick={() => setCurrentHeroIndex((prev) => (prev - 1 + displayedHeroes.length) % displayedHeroes.length)} className="carousel-btn carousel-prev"><ChevronLeft size={24} /></button>
              <button onClick={() => setCurrentHeroIndex((prev) => (prev + 1) % displayedHeroes.length)} className="carousel-btn carousel-next"><ChevronRight size={24} /></button>
            </>
          )}
        </div>

        {/* Segment-wise Tabs Navigation */}
        <div className="card" style={{ padding: '0px', marginBottom: '30px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-border)', backgroundColor: '#F8FAFC' }}>
            {[
              { key: 'documents', label: t.docs },
              { key: 'photos', label: t.photos },
              { key: 'videos', label: t.videos }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setUserActiveTab(tab.key)}
                style={{
                  flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '1rem', fontWeight: '600',
                  color: userActiveTab === tab.key ? 'var(--primary-navy)' : 'var(--gray-text)',
                  borderBottom: userActiveTab === tab.key ? '3px solid var(--accent-saffron)' : '3px solid transparent',
                  backgroundColor: userActiveTab === tab.key ? '#FFFFFF' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '30px' }}>
            {/* DOCUMENTS VIEW */}
            {userActiveTab === 'documents' && (
              <div>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
                    <input type="text" className="form-control" placeholder={t.searchPlaceholder} value={docSearch} onChange={(e) => setDocSearch(e.target.value)} style={{ paddingLeft: '40px' }} />
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--gray-text)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--gray-text)', whiteSpace: 'nowrap' }}>{t.filterDept}</span>
                    <select className="form-control" value={docDeptFilter} onChange={(e) => setDocDeptFilter(e.target.value)} style={{ width: '200px' }}>
                      {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>
                </div>

                {filteredDocuments.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-text)' }}>
                    <HelpCircle size={40} style={{ marginBottom: '10px', color: '#94A3B8' }} />
                    <p>{appLanguage === 'en' ? 'No documents found matching the search criteria.' : 'खोज मापदंड से मेल खाने वाला कोई दस्तावेज़ नहीं मिला।'}</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                      {(() => {
                        const safePage = Math.min(userDocsPage, Math.ceil(filteredDocuments.length / 6) || 1);
                        const paginated = filteredDocuments.slice((safePage - 1) * 6, safePage * 6);
                        return paginated.map(doc => (
                          <div key={doc.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--gray-border)' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                                {renderFileIcon(doc.file_type)}
                                <div>
                                  <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '3px 8px', borderRadius: '10px', backgroundColor: 'var(--accent-blue)', color: 'var(--primary-navy)', display: 'inline-block' }}>{doc.department}</span>
                                </div>
                              </div>
                              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px', lineHeight: '1.3' }}>{doc.title}</h4>
                              <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)', marginBottom: '15px', lineHeight: '1.4' }}>{doc.description || 'No summary text provided for this document.'}</p>
                            </div>
                            <div style={{ borderTop: '1px solid var(--gray-border)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--gray-text)' }}>{(doc.file_size / 1024).toFixed(1)} KB | {doc.file_type.slice(1).toUpperCase()}</span>
                              <a href={doc.file_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ padding: '6px 14px' }}><Download size={14} /> Download File</a>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                    {(() => {
                      const totalPages = Math.ceil(filteredDocuments.length / 6);
                      const safePage = Math.min(userDocsPage, totalPages || 1);
                      if (totalPages <= 1) return null;
                      return (
                        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
                          <button onClick={() => setUserDocsPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="btn btn-secondary btn-sm"><ChevronLeft size={16} /> Prev</button>
                          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Page {safePage} of {totalPages}</span>
                          <button onClick={() => setUserDocsPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="btn btn-secondary btn-sm">Next <ChevronRight size={16} /></button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* PHOTO GALLERY VIEW */}
            {userActiveTab === 'photos' && (
              <div>
                {photos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-text)' }}>
                    <HelpCircle size={40} style={{ marginBottom: '10px', color: '#94A3B8' }} />
                    <p>Photo gallery is empty.</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                      {(() => {
                        const safePage = Math.min(userPhotosPage, Math.ceil(photos.length / 6) || 1);
                        const paginated = photos.slice((safePage - 1) * 6, safePage * 6);
                        return paginated.map(ph => (
                          <div key={ph.id} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => onOpenLightbox('photo', photos, photos.findIndex(item => item.id === ph.id))}>
                            <div style={{ width: '100%', height: '160px', overflow: 'hidden' }}>
                              <img src={ph.file_url} alt={ph.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="zoom-image" />
                            </div>
                            <div style={{ padding: '15px' }}>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>{ph.title}</h4>
                              <p style={{ fontSize: '0.8rem', color: 'var(--gray-text)' }}>{ph.description || 'No description provided'}</p>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                    {(() => {
                      const totalPages = Math.ceil(photos.length / 6);
                      const safePage = Math.min(userPhotosPage, totalPages || 1);
                      if (totalPages <= 1) return null;
                      return (
                        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
                          <button onClick={() => setUserPhotosPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="btn btn-secondary btn-sm"><ChevronLeft size={16} /> Prev</button>
                          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Page {safePage} of {totalPages}</span>
                          <button onClick={() => setUserPhotosPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="btn btn-secondary btn-sm">Next <ChevronRight size={16} /></button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* VIDEO GALLERY VIEW */}
            {userActiveTab === 'videos' && (
              <div>
                {videos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-text)' }}>
                    <HelpCircle size={40} style={{ marginBottom: '10px', color: '#94A3B8' }} />
                    <p>Video archives are currently empty.</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                      {(() => {
                        const safePage = Math.min(userVideosPage, Math.ceil(videos.length / 6) || 1);
                        const paginated = videos.slice((safePage - 1) * 6, safePage * 6);
                        return paginated.map(vd => (
                          <div key={vd.id} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => onOpenLightbox('video', videos, videos.findIndex(item => item.id === vd.id))}>
                            <div style={{ width: '100%', height: '180px', backgroundColor: '#020617', position: 'relative' }}>
                              {(() => {
                                const ytThumb = getYouTubeThumbnail(vd.file_url);
                                if (ytThumb) return <img src={ytThumb} alt={vd.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                                return (
                                  <div style={{ width: '100%', height: '100%', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <video src={vd.file_url} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} muted playsInline />
                                  </div>
                                );
                              })()}
                              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.3)' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--accent-saffron)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                                  <Video size={24} />
                                </div>
                              </div>
                            </div>
                            <div style={{ padding: '15px' }}>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>{vd.title}</h4>
                              <p style={{ fontSize: '0.8rem', color: 'var(--gray-text)' }}>{vd.description || 'No description provided'}</p>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                    {(() => {
                      const totalPages = Math.ceil(videos.length / 6);
                      const safePage = Math.min(userVideosPage, totalPages || 1);
                      if (totalPages <= 1) return null;
                      return (
                        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
                          <button onClick={() => setUserVideosPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="btn btn-secondary btn-sm"><ChevronLeft size={16} /> Prev</button>
                          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Page {safePage} of {totalPages}</span>
                          <button onClick={() => setUserVideosPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="btn btn-secondary btn-sm">Next <ChevronRight size={16} /></button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
