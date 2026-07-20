import React, { useState, useEffect } from 'react';
import {
  Users, FileText, Image as ImageIcon, Video, Sliders,
  Plus, Edit, Trash2, Upload, X, Download
} from 'lucide-react';
import { API_URL, renderFileIcon, getYouTubeThumbnail } from '../utils/helpers.jsx';

const AdminDashboard = ({ triggerToast, onOpenLightbox }) => {
  const [adminActiveTab, setAdminActiveTab] = useState('users');

  // Database States
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [heroImages, setHeroImages] = useState([]);

  // Modal / Add Form States
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userEditData, setUserEditData] = useState(null);
  const [userAddForm, setUserAddForm] = useState({ name: '', phone: '' });

  // Edit Modal States for other items
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docEditData, setDocEditData] = useState(null);

  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoEditData, setPhotoEditData] = useState(null);

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoEditData, setVideoEditData] = useState(null);

  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [heroEditData, setHeroEditData] = useState(null);

  // Upload Form States (For adding new items)
  const [docUploadForm, setDocUploadForm] = useState({ title: '', department: 'Legislative Branch', description: '', file: null });
  const [photoUploadForm, setPhotoUploadForm] = useState({ title: '', description: '', file: null });
  const [videoUploadForm, setVideoUploadForm] = useState({ title: '', description: '', external_url: '', file: null, type: 'url' });
  const [heroUploadForm, setHeroUploadForm] = useState({ title: '', file: null });

  // Pagination states
  const [adminUsersPage, setAdminUsersPage] = useState(1);
  const [adminDocsPage, setAdminDocsPage] = useState(1);
  const [adminPhotosPage, setAdminPhotosPage] = useState(1);
  const [adminVideosPage, setAdminVideosPage] = useState(1);
  const [adminHeroesPage, setAdminHeroesPage] = useState(1);

  const departments = ['All', 'Legislative Branch', 'Executive Branch', 'Lok Sabha Affairs', 'Rajya Sabha Affairs', 'Youth Parliament', 'RTI Section', 'Others'];

  // Reset page params on tab switch
  useEffect(() => {
    setAdminUsersPage(1);
    setAdminDocsPage(1);
    setAdminPhotosPage(1);
    setAdminVideosPage(1);
    setAdminHeroesPage(1);
  }, [adminActiveTab]);

  // Fetch data
  const fetchUsers = async () => {
    try { const res = await fetch(`${API_URL}/api/users`); const data = await res.json(); if (Array.isArray(data)) setUsers(data); } catch (e) { console.error(e); }
  };
  const fetchDocuments = async () => {
    try { const res = await fetch(`${API_URL}/api/documents`); const data = await res.json(); if (Array.isArray(data)) setDocuments(data); } catch (e) { console.error(e); }
  };
  const fetchPhotos = async () => {
    try { const res = await fetch(`${API_URL}/api/photos`); const data = await res.json(); if (Array.isArray(data)) setPhotos(data); } catch (e) { console.error(e); }
  };
  const fetchVideos = async () => {
    try { const res = await fetch(`${API_URL}/api/videos`); const data = await res.json(); if (Array.isArray(data)) setVideos(data); } catch (e) { console.error(e); }
  };
  const fetchHeroImages = async () => {
    try { const res = await fetch(`${API_URL}/api/hero-images`); const data = await res.json(); if (Array.isArray(data)) setHeroImages(data); } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchUsers();
    fetchDocuments();
    fetchPhotos();
    fetchVideos();
    fetchHeroImages();
  }, []);

  // CRUD Handlers for Users
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (userEditData) {
      try {
        const res = await fetch(`${API_URL}/api/users/${userEditData.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userEditData) });
        const data = await res.json();
        if (data.id) { triggerToast('User details updated.'); setUserModalOpen(false); setUserEditData(null); fetchUsers(); }
      } catch (err) { triggerToast('Failed to update user.'); }
    } else {
      try {
        const res = await fetch(`${API_URL}/api/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userAddForm) });
        const data = await res.json();
        if (data.error) { triggerToast(data.error); } else if (data.id) { triggerToast('User added successfully.'); setUserModalOpen(false); setUserAddForm({ name: '', phone: '' }); fetchUsers(); }
      } catch (err) { triggerToast('Failed to add user.'); }
    }
  };

  const handleUserDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try { const res = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' }); const data = await res.json(); if (data.success) { triggerToast('User deleted.'); fetchUsers(); } } catch (err) { triggerToast('Failed to delete user.'); }
  };

  // CRUD Handlers for Documents
  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!docUploadForm.file || !docUploadForm.title) return triggerToast('Title and Document File are required.');
    const formData = new FormData();
    formData.append('title', docUploadForm.title);
    formData.append('department', docUploadForm.department);
    formData.append('description', docUploadForm.description);
    formData.append('file', docUploadForm.file);
    try {
      triggerToast('Parsing and uploading document...');
      const res = await fetch(`${API_URL}/api/documents`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.id) { triggerToast('Document uploaded and parsed successfully.'); setDocUploadForm({ title: '', department: 'Legislative Branch', description: '', file: null }); document.getElementById('docFileInput').value = ''; fetchDocuments(); }
      else { triggerToast(data.error || 'Upload failed.'); }
    } catch (err) { triggerToast('Failed to upload document.'); }
  };

  const handleDocEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', docEditData.title);
    formData.append('department', docEditData.department);
    formData.append('description', docEditData.description);
    if (docEditData.file) {
      formData.append('file', docEditData.file);
    }
    try {
      triggerToast('Updating document details...');
      const res = await fetch(`${API_URL}/api/documents/${docEditData.id}`, { method: 'PUT', body: formData });
      const data = await res.json();
      if (data.success) { triggerToast('Document updated successfully.'); setDocModalOpen(false); setDocEditData(null); fetchDocuments(); }
      else { triggerToast(data.error || 'Update failed.'); }
    } catch (err) { triggerToast('Failed to update document.'); }
  };

  const handleDocDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try { await fetch(`${API_URL}/api/documents/${id}`, { method: 'DELETE' }); triggerToast('Document deleted.'); fetchDocuments(); } catch (e) { triggerToast('Failed to delete.'); }
  };

  // CRUD Handlers for Photos
  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photoUploadForm.file || !photoUploadForm.title) return triggerToast('Title and Photo File are required.');
    const formData = new FormData();
    formData.append('title', photoUploadForm.title);
    formData.append('description', photoUploadForm.description);
    formData.append('file', photoUploadForm.file);
    try {
      const res = await fetch(`${API_URL}/api/photos`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.id) { triggerToast('Photo uploaded.'); setPhotoUploadForm({ title: '', description: '', file: null }); document.getElementById('photoFileInput').value = ''; fetchPhotos(); }
    } catch (err) { triggerToast('Failed to upload photo.'); }
  };

  const handlePhotoEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', photoEditData.title);
    formData.append('description', photoEditData.description);
    if (photoEditData.file) {
      formData.append('file', photoEditData.file);
    }
    try {
      triggerToast('Updating photo details...');
      const res = await fetch(`${API_URL}/api/photos/${photoEditData.id}`, { method: 'PUT', body: formData });
      const data = await res.json();
      if (data.success) { triggerToast('Photo updated successfully.'); setPhotoModalOpen(false); setPhotoEditData(null); fetchPhotos(); }
      else { triggerToast(data.error || 'Update failed.'); }
    } catch (err) { triggerToast('Failed to update photo.'); }
  };

  const handlePhotoDelete = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    try { await fetch(`${API_URL}/api/photos/${id}`, { method: 'DELETE' }); triggerToast('Photo deleted.'); fetchPhotos(); } catch (e) { triggerToast('Failed to delete.'); }
  };

  // CRUD Handlers for Videos
  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoUploadForm.title) return triggerToast('Title is required.');
    const formData = new FormData();
    formData.append('title', videoUploadForm.title);
    formData.append('description', videoUploadForm.description);
    if (videoUploadForm.type === 'file') {
      if (!videoUploadForm.file) return triggerToast('Video file is required.');
      formData.append('file', videoUploadForm.file);
    } else {
      if (!videoUploadForm.external_url) return triggerToast('External URL is required.');
      formData.append('external_url', videoUploadForm.external_url);
    }
    try {
      const res = await fetch(`${API_URL}/api/videos`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.id) { triggerToast('Video added to gallery.'); setVideoUploadForm({ title: '', description: '', external_url: '', file: null, type: 'url' }); const fi = document.getElementById('videoFileInput'); if (fi) fi.value = ''; fetchVideos(); }
      else { triggerToast(data.error || 'Upload failed.'); }
    } catch (err) { triggerToast('Failed to save video.'); }
  };

  const handleVideoEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', videoEditData.title);
    formData.append('description', videoEditData.description);
    if (videoEditData.type === 'file') {
      if (videoEditData.file) {
        formData.append('file', videoEditData.file);
      }
    } else {
      formData.append('external_url', videoEditData.external_url);
    }
    try {
      triggerToast('Updating video details...');
      const res = await fetch(`${API_URL}/api/videos/${videoEditData.id}`, { method: 'PUT', body: formData });
      const data = await res.json();
      if (data.success) { triggerToast('Video updated successfully.'); setVideoModalOpen(false); setVideoEditData(null); fetchVideos(); }
      else { triggerToast(data.error || 'Update failed.'); }
    } catch (err) { triggerToast('Failed to update video.'); }
  };

  const handleVideoDelete = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    try { await fetch(`${API_URL}/api/videos/${id}`, { method: 'DELETE' }); triggerToast('Video record removed.'); fetchVideos(); } catch (e) { triggerToast('Failed to delete.'); }
  };

  // CRUD Handlers for Hero Images
  const handleHeroUpload = async (e) => {
    e.preventDefault();
    if (!heroUploadForm.file) return triggerToast('Hero image file is required.');
    const formData = new FormData();
    formData.append('title', heroUploadForm.title);
    formData.append('file', heroUploadForm.file);
    try {
      const res = await fetch(`${API_URL}/api/hero-images`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.id) { triggerToast('Hero image uploaded.'); setHeroUploadForm({ title: '', file: null }); document.getElementById('heroFileInput').value = ''; fetchHeroImages(); }
    } catch (err) { triggerToast('Failed to upload hero image.'); }
  };

  const handleHeroEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', heroEditData.title);
    if (heroEditData.file) {
      formData.append('file', heroEditData.file);
    }
    try {
      triggerToast('Updating hero slide...');
      const res = await fetch(`${API_URL}/api/hero-images/${heroEditData.id}`, { method: 'PUT', body: formData });
      const data = await res.json();
      if (data.success) { triggerToast('Hero slide updated successfully.'); setHeroModalOpen(false); setHeroEditData(null); fetchHeroImages(); }
      else { triggerToast(data.error || 'Update failed.'); }
    } catch (err) { triggerToast('Failed to update hero slide.'); }
  };

  const handleHeroToggle = async (id, currentVal) => {
    try {
      const res = await fetch(`${API_URL}/api/hero-images/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: currentVal === 1 ? 0 : 1 }) });
      const data = await res.json();
      if (data.success) { triggerToast('Hero image status updated.'); fetchHeroImages(); }
    } catch (err) { triggerToast('Failed to update status.'); }
  };

  const handleHeroDelete = async (id) => {
    if (!window.confirm('Delete this hero image?')) return;
    try { await fetch(`${API_URL}/api/hero-images/${id}`, { method: 'DELETE' }); triggerToast('Hero image deleted.'); fetchHeroImages(); } catch (e) { triggerToast('Failed to delete.'); }
  };

  return (
    <>
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-title">MoPA Database Segment</div>
          <div onClick={() => setAdminActiveTab('users')} className={`admin-sidebar-item ${adminActiveTab === 'users' ? 'active' : ''}`}><Users size={18} /><span>Registered Users</span></div>
          <div onClick={() => setAdminActiveTab('documents')} className={`admin-sidebar-item ${adminActiveTab === 'documents' ? 'active' : ''}`}><FileText size={18} /><span>Documents Section</span></div>
          <div onClick={() => setAdminActiveTab('photos')} className={`admin-sidebar-item ${adminActiveTab === 'photos' ? 'active' : ''}`}><ImageIcon size={18} /><span>Photo Gallery</span></div>
          <div onClick={() => setAdminActiveTab('videos')} className={`admin-sidebar-item ${adminActiveTab === 'videos' ? 'active' : ''}`}><Video size={18} /><span>Video Gallery</span></div>
          <div onClick={() => setAdminActiveTab('heroes')} className={`admin-sidebar-item ${adminActiveTab === 'heroes' ? 'active' : ''}`}><Sliders size={18} /><span>Hero Carousel Control</span></div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-content">

          {/* 1. ADMIN USER DASHBOARD */}
          {adminActiveTab === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div>
                  <h2>User Management Directory</h2>
                  <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem' }}>Add, edit, or delete users allowed to access the database portal</p>
                </div>
                <button onClick={() => { setUserEditData(null); setUserModalOpen(true); }} className="btn btn-primary btn-sm">
                  <Plus size={16} /> Add User Mobile
                </button>
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--gray-border)', color: 'var(--gray-text)', fontSize: '0.85rem', fontWeight: '600' }}>
                      <th style={{ padding: '16px 24px' }}>Name</th>
                      <th style={{ padding: '16px 24px' }}>Phone Number</th>
                      <th style={{ padding: '16px 24px' }}>Date Added</th>
                      <th style={{ padding: '16px 24px' }}>Status</th>
                      <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--gray-text)' }}>No registered users. Click 'Add User Mobile' to authorize access.</td></tr>
                    ) : (
                      (() => {
                        const safePage = Math.min(adminUsersPage, Math.ceil(users.length / 5) || 1);
                        const paginated = users.slice((safePage - 1) * 5, safePage * 5);
                        return paginated.map((usr) => (
                          <tr key={usr.id} style={{ borderBottom: '1px solid var(--gray-border)', fontSize: '0.9rem' }}>
                            <td style={{ padding: '16px 24px', fontWeight: '500' }}>{usr.name}</td>
                            <td style={{ padding: '16px 24px' }}>{usr.phone}</td>
                            <td style={{ padding: '16px 24px', color: 'var(--gray-text)' }}>{new Date(usr.created_at).toLocaleDateString()}</td>
                            <td style={{ padding: '16px 24px' }}>
                              <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: usr.status === 'active' ? '#ECFDF5' : '#FEF2F2', color: usr.status === 'active' ? '#059669' : '#DC2626' }}>
                                {usr.status === 'active' ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                              <button onClick={() => { setUserEditData(usr); setUserModalOpen(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-navy)', marginRight: '15px' }} title="Edit User"><Edit size={16} /></button>
                              <button onClick={() => handleUserDelete(usr.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }} title="Delete User"><Trash2 size={16} /></button>
                            </td>
                          </tr>
                        ));
                      })()
                    )}
                  </tbody>
                </table>
                {(() => {
                  const totalPages = Math.ceil(users.length / 5);
                  const safePage = Math.min(adminUsersPage, totalPages || 1);
                  if (totalPages <= 1) return null;
                  return (
                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', borderTop: '1px solid var(--gray-border)', backgroundColor: '#F8FAFC' }}>
                      <button type="button" onClick={() => setAdminUsersPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Prev</button>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Page {safePage} of {totalPages}</span>
                      <button type="button" onClick={() => setAdminUsersPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Next</button>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* 2. ADMIN DOCUMENTS SECTION */}
          {adminActiveTab === 'documents' && (
            <div>
              <h2 style={{ marginBottom: '5px' }}>Documents Section</h2>
              <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem', marginBottom: '25px' }}>Upload reports, PDF acts, Excel grids, Word docs. Extracted text automatically feeds into the AI Chatbot database!</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Upload Document</h3>
                  <form onSubmit={handleDocUpload}>
                    <div className="form-group"><label className="form-label">Document Title</label><input type="text" className="form-control" value={docUploadForm.title} onChange={(e) => setDocUploadForm({ ...docUploadForm, title: e.target.value })} placeholder="e.g. Annual Report 2025" required /></div>
                    <div className="form-group"><label className="form-label">Department</label><select className="form-control" value={docUploadForm.department} onChange={(e) => setDocUploadForm({ ...docUploadForm, department: e.target.value })}>{departments.filter(d => d !== 'All').map(dept => <option key={dept} value={dept}>{dept}</option>)}</select></div>
                    <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows="3" value={docUploadForm.description} onChange={(e) => setDocUploadForm({ ...docUploadForm, description: e.target.value })} placeholder="Optional brief summary..." /></div>
                    <div className="form-group"><label className="form-label">Select File (.pdf, .doc, .docx, .xls, .xlsx, .ppt, .png, .jpg)</label><input type="file" id="docFileInput" className="form-control" onChange={(e) => setDocUploadForm({ ...docUploadForm, file: e.target.files[0] })} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg" required /></div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}><Upload size={16} /> Process & Save Document</button>
                  </form>
                </div>
                <div className="card" style={{ maxHeight: '700px', overflowY: 'auto' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Uploaded Documents ({documents.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {documents.length === 0 ? (
                      <p style={{ color: 'var(--gray-text)', textAlign: 'center', padding: '30px' }}>No documents uploaded yet.</p>
                    ) : (
                      (() => {
                        const safePage = Math.min(adminDocsPage, Math.ceil(documents.length / 5) || 1);
                        const paginated = documents.slice((safePage - 1) * 5, safePage * 5);
                        return paginated.map(doc => (
                          <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '12px', border: '1px solid var(--gray-border)', borderRadius: 'var(--border-radius-md)', gap: '15px' }}>
                            {renderFileIcon(doc.file_type)}
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{doc.title}</h4>
                              <p style={{ fontSize: '0.75rem', color: 'var(--accent-saffron)', fontWeight: '600' }}>{doc.department}</p>
                              <p style={{ fontSize: '0.8rem', color: 'var(--gray-text)', marginTop: '2px' }}>{doc.description || 'No description'}</p>
                              <div style={{ display: 'flex', gap: '15px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--gray-text)' }}>
                                <span>Type: {doc.file_type.toUpperCase()}</span>
                                <span>Size: {(doc.file_size / 1024).toFixed(1)} KB</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <a href={doc.file_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }}><Download size={14} /></a>
                              <button onClick={() => { setDocEditData({ ...doc, file: null }); setDocModalOpen(true); }} className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }} title="Edit Document"><Edit size={14} /></button>
                              <button onClick={() => handleDocDelete(doc.id)} className="btn btn-danger btn-sm" style={{ padding: '6px 8px', backgroundColor: '#FEE2E2', color: '#EF4444' }}><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ));
                      })()
                    )}
                  </div>
                  {(() => {
                    const totalPages = Math.ceil(documents.length / 5);
                    const safePage = Math.min(adminDocsPage, totalPages || 1);
                    if (totalPages <= 1) return null;
                    return (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--gray-border)' }}>
                        <button type="button" onClick={() => setAdminDocsPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Prev</button>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Page {safePage} of {totalPages}</span>
                        <button type="button" onClick={() => setAdminDocsPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Next</button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* 3. PHOTO GALLERY SEGMENT */}
          {adminActiveTab === 'photos' && (
            <div>
              <h2>Photo Gallery Manager</h2>
              <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem', marginBottom: '25px' }}>Upload institutional event photographs. Displays in user gallery</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Upload Photo</h3>
                  <form onSubmit={handlePhotoUpload}>
                    <div className="form-group"><label className="form-label">Photo Title</label><input type="text" className="form-control" value={photoUploadForm.title} onChange={(e) => setPhotoUploadForm({ ...photoUploadForm, title: e.target.value })} placeholder="e.g. Swearing-in Ceremony" required /></div>
                    <div className="form-group"><label className="form-label">Description (Optional)</label><input type="text" className="form-control" value={photoUploadForm.description} onChange={(e) => setPhotoUploadForm({ ...photoUploadForm, description: e.target.value })} placeholder="Brief description..." /></div>
                    <div className="form-group"><label className="form-label">Image File (.png, .jpg, .jpeg)</label><input type="file" id="photoFileInput" className="form-control" onChange={(e) => setPhotoUploadForm({ ...photoUploadForm, file: e.target.files[0] })} accept="image/*" required /></div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}><Upload size={16} /> Save to Photo Gallery</button>
                  </form>
                </div>
                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Current Photo Gallery ({photos.length})</h3>
                  {photos.length === 0 ? (
                    <p style={{ color: 'var(--gray-text)', textAlign: 'center', padding: '30px' }}>No photos uploaded yet.</p>
                  ) : (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                        {(() => {
                          const safePage = Math.min(adminPhotosPage, Math.ceil(photos.length / 6) || 1);
                          const paginated = photos.slice((safePage - 1) * 6, safePage * 6);
                          return paginated.map(ph => (
                            <div key={ph.id} style={{ border: '1px solid var(--gray-border)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#FAFBFD' }}>
                              <img src={ph.file_url} alt={ph.title} style={{ width: '100%', height: '110px', objectFit: 'cover', cursor: 'pointer' }} onClick={() => onOpenLightbox('photo', photos, photos.findIndex(item => item.id === ph.id))} title="Click to preview" />
                              <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                  <h4 style={{ fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ph.title}</h4>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-text)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ph.description || 'No description'}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                  <button onClick={() => { setPhotoEditData({ ...ph, file: null }); setPhotoModalOpen(true); }} className="btn btn-secondary btn-sm" style={{ flex: 1, padding: '4px', fontSize: '0.75rem' }}>Edit</button>
                                  <button onClick={() => handlePhotoDelete(ph.id)} className="btn btn-danger btn-sm" style={{ flex: 1, padding: '4px', fontSize: '0.75rem', backgroundColor: '#FEE2E2', color: '#EF4444' }}>Delete</button>
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                      {(() => {
                        const totalPages = Math.ceil(photos.length / 6);
                        const safePage = Math.min(adminPhotosPage, totalPages || 1);
                        if (totalPages <= 1) return null;
                        return (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--gray-border)' }}>
                            <button type="button" onClick={() => setAdminPhotosPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Prev</button>
                            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Page {safePage} of {totalPages}</span>
                            <button type="button" onClick={() => setAdminPhotosPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Next</button>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. VIDEO GALLERY SEGMENT */}
          {adminActiveTab === 'videos' && (
            <div>
              <h2>Video Gallery Segment</h2>
              <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem', marginBottom: '25px' }}>Upload video clips or register external video URLs (YouTube links) for public viewing</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Add Video Clip</h3>
                  <form onSubmit={handleVideoUpload}>
                    <div className="form-group"><label className="form-label">Video Title</label><input type="text" className="form-control" value={videoUploadForm.title} onChange={(e) => setVideoUploadForm({ ...videoUploadForm, title: e.target.value })} placeholder="e.g. Session Proceedings 2025" required /></div>
                    <div className="form-group"><label className="form-label">Description (Optional)</label><input type="text" className="form-control" value={videoUploadForm.description} onChange={(e) => setVideoUploadForm({ ...videoUploadForm, description: e.target.value })} placeholder="Brief description..." /></div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label className="form-label" style={{ marginBottom: '8px' }}>Input Source Type</label>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}><input type="radio" name="videoType" checked={videoUploadForm.type === 'url'} onChange={() => setVideoUploadForm({ ...videoUploadForm, type: 'url' })} /> External URL (e.g., YouTube)</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}><input type="radio" name="videoType" checked={videoUploadForm.type === 'file'} onChange={() => setVideoUploadForm({ ...videoUploadForm, type: 'file' })} /> Upload Video File</label>
                      </div>
                    </div>
                    {videoUploadForm.type === 'url' ? (
                      <div className="form-group"><label className="form-label">External Video URL</label><input type="url" className="form-control" value={videoUploadForm.external_url} onChange={(e) => setVideoUploadForm({ ...videoUploadForm, external_url: e.target.value })} placeholder="https://www.youtube.com/embed/..." /></div>
                    ) : (
                      <div className="form-group"><label className="form-label">Video File (.mp4, .mkv)</label><input type="file" id="videoFileInput" className="form-control" onChange={(e) => setVideoUploadForm({ ...videoUploadForm, file: e.target.files[0] })} accept="video/*" /></div>
                    )}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}><Upload size={16} /> Save Video to Database</button>
                  </form>
                </div>
                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Current Video Archives ({videos.length})</h3>
                  {videos.length === 0 ? (
                    <p style={{ color: 'var(--gray-text)', textAlign: 'center', padding: '30px' }}>No videos registered yet.</p>
                  ) : (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                        {(() => {
                          const safePage = Math.min(adminVideosPage, Math.ceil(videos.length / 6) || 1);
                          const paginated = videos.slice((safePage - 1) * 6, safePage * 6);
                          return paginated.map(vd => (
                            <div key={vd.id} style={{ border: '1px solid var(--gray-border)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#FAFBFD' }}>
                              <div style={{ width: '100%', height: '110px', backgroundColor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', position: 'relative', cursor: 'pointer' }} onClick={() => onOpenLightbox('video', videos, videos.findIndex(item => item.id === vd.id))} title="Click to play in dialogue box">
                                {(() => {
                                  const ytThumb = getYouTubeThumbnail(vd.file_url);
                                  if (ytThumb) return <img src={ytThumb} alt={vd.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                                  return <Video size={36} />;
                                })()}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                                  <div style={{ padding: '4px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.8)', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video size={14} /></div>
                                </div>
                              </div>
                              <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                  <h4 style={{ fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vd.title}</h4>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-text)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{vd.description || 'No description'}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                  <button onClick={() => { setVideoEditData({ ...vd, file: null, type: vd.file_name ? 'file' : 'url', external_url: vd.file_name ? '' : vd.file_url }); setVideoModalOpen(true); }} className="btn btn-secondary btn-sm" style={{ flex: 1, padding: '4px', fontSize: '0.75rem' }}>Edit</button>
                                  <button onClick={() => handleVideoDelete(vd.id)} className="btn btn-danger btn-sm" style={{ flex: 1, padding: '4px', fontSize: '0.75rem', backgroundColor: '#FEE2E2', color: '#EF4444' }}>Remove</button>
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                      {(() => {
                        const totalPages = Math.ceil(videos.length / 6);
                        const safePage = Math.min(adminVideosPage, totalPages || 1);
                        if (totalPages <= 1) return null;
                        return (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--gray-border)' }}>
                            <button type="button" onClick={() => setAdminVideosPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Prev</button>
                            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Page {safePage} of {totalPages}</span>
                            <button type="button" onClick={() => setAdminVideosPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Next</button>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. ADMIN HERO IMAGES MANAGER */}
          {adminActiveTab === 'heroes' && (
            <div>
              <h2>Hero Images Controller</h2>
              <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem', marginBottom: '25px' }}>Upload and activate hero pictures that will rotate on the User Dashboard main carousel banner</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Upload Hero Slide</h3>
                  <form onSubmit={handleHeroUpload}>
                    <div className="form-group"><label className="form-label">Hero Title (Text overlays on banner)</label><input type="text" className="form-control" value={heroUploadForm.title} onChange={(e) => setHeroUploadForm({ ...heroUploadForm, title: e.target.value })} placeholder="e.g. Budget Session Inauguration 2025" /></div>
                    <div className="form-group"><label className="form-label">Banner Image (.jpg, .png)</label><input type="file" id="heroFileInput" className="form-control" onChange={(e) => setHeroUploadForm({ ...heroUploadForm, file: e.target.files[0] })} accept="image/*" required /></div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}><Upload size={16} /> Save Banner image</button>
                  </form>
                </div>
                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Banner Carousel Configuration ({heroImages.length})</h3>
                  {heroImages.length === 0 ? (
                    <p style={{ color: 'var(--gray-text)', textAlign: 'center', padding: '30px' }}>No custom hero images uploaded. The portal is currently using default system images.</p>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {(() => {
                          const safePage = Math.min(adminHeroesPage, Math.ceil(heroImages.length / 5) || 1);
                          const paginated = heroImages.slice((safePage - 1) * 5, safePage * 5);
                          return paginated.map(img => (
                            <div key={img.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--gray-border)', borderRadius: 'var(--border-radius-md)', padding: '12px' }}>
                              <img src={img.file_url} alt={img.title} style={{ width: '120px', height: '70px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }} onClick={() => onOpenLightbox('photo', [{ id: img.id, title: img.title || 'Hero Banner', description: 'Active slide on homepage carousel', file_url: img.file_url }], 0)} title="Click to preview slide" />
                              <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>{img.title || 'Untitled Banner'}</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--gray-text)' }}>Added: {new Date(img.created_at).toLocaleDateString()}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' }}><input type="checkbox" checked={img.is_active === 1} onChange={() => handleHeroToggle(img.id, img.is_active)} /> Active</label>
                                <button onClick={() => { setHeroEditData({ ...img, file: null }); setHeroModalOpen(true); }} className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }} title="Edit Hero slide"><Edit size={14} /></button>
                                <button onClick={() => handleHeroDelete(img.id)} className="btn btn-danger btn-sm" style={{ padding: '6px 8px', backgroundColor: '#FEE2E2', color: '#EF4444' }}><Trash2 size={14} /></button>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                      {(() => {
                        const totalPages = Math.ceil(heroImages.length / 5);
                        const safePage = Math.min(adminHeroesPage, totalPages || 1);
                        if (totalPages <= 1) return null;
                        return (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--gray-border)' }}>
                            <button type="button" onClick={() => setAdminHeroesPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Prev</button>
                            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Page {safePage} of {totalPages}</span>
                            <button type="button" onClick={() => setAdminHeroesPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Next</button>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* User Add/Edit Modal */}
      {userModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setUserModalOpen(false)}><X size={20} /></button>
            <h3 style={{ marginBottom: '20px' }}>{userEditData ? 'Edit Authorized User' : 'Register New User Mobile'}</h3>
            <form onSubmit={handleUserSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" value={userEditData ? userEditData.name : userAddForm.name} onChange={(e) => { if (userEditData) { setUserEditData({ ...userEditData, name: e.target.value }); } else { setUserAddForm({ ...userAddForm, name: e.target.value }); } }} placeholder="e.g. Shri Rajesh Kumar" required />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Phone Number (10 Digits)</label>
                <input type="tel" className="form-control" pattern="[0-9]{10}" value={userEditData ? userEditData.phone : userAddForm.phone} onChange={(e) => { if (userEditData) { setUserEditData({ ...userEditData, phone: e.target.value }); } else { setUserAddForm({ ...userAddForm, phone: e.target.value }); } }} placeholder="e.g. 9876543210" required />
              </div>
              {userEditData && (
                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <select className="form-control" value={userEditData.status} onChange={(e) => setUserEditData({ ...userEditData, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setUserModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Member Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Edit Modal */}
      {docModalOpen && docEditData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => { setDocModalOpen(false); setDocEditData(null); }}><X size={20} /></button>
            <h3 style={{ marginBottom: '20px' }}>Edit Document Details</h3>
            <form onSubmit={handleDocEditSubmit}>
              <div className="form-group">
                <label className="form-label">Document Title</label>
                <input type="text" className="form-control" value={docEditData.title} onChange={(e) => setDocEditData({ ...docEditData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-control" value={docEditData.department} onChange={(e) => setDocEditData({ ...docEditData, department: e.target.value })}>
                  {departments.filter(d => d !== 'All').map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="3" value={docEditData.description} onChange={(e) => setDocEditData({ ...docEditData, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Replace File (Leave blank to keep current file)</label>
                <input type="file" className="form-control" onChange={(e) => setDocEditData({ ...docEditData, file: e.target.files[0] })} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg" />
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-text)' }}>Current: {docEditData.file_name}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setDocModalOpen(false); setDocEditData(null); }} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Edit Modal */}
      {photoModalOpen && photoEditData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => { setPhotoModalOpen(false); setPhotoEditData(null); }}><X size={20} /></button>
            <h3 style={{ marginBottom: '20px' }}>Edit Photo Details</h3>
            <form onSubmit={handlePhotoEditSubmit}>
              <div className="form-group">
                <label className="form-label">Photo Title</label>
                <input type="text" className="form-control" value={photoEditData.title} onChange={(e) => setPhotoEditData({ ...photoEditData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input type="text" className="form-control" value={photoEditData.description} onChange={(e) => setPhotoEditData({ ...photoEditData, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Replace Image File (Leave blank to keep current)</label>
                <input type="file" className="form-control" onChange={(e) => setPhotoEditData({ ...photoEditData, file: e.target.files[0] })} accept="image/*" />
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-text)' }}>Current: {photoEditData.file_name}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setPhotoModalOpen(false); setPhotoEditData(null); }} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Edit Modal */}
      {videoModalOpen && videoEditData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => { setVideoModalOpen(false); setVideoEditData(null); }}><X size={20} /></button>
            <h3 style={{ marginBottom: '20px' }}>Edit Video details</h3>
            <form onSubmit={handleVideoEditSubmit}>
              <div className="form-group">
                <label className="form-label">Video Title</label>
                <input type="text" className="form-control" value={videoEditData.title} onChange={(e) => setVideoEditData({ ...videoEditData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input type="text" className="form-control" value={videoEditData.description} onChange={(e) => setVideoEditData({ ...videoEditData, description: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label" style={{ marginBottom: '8px' }}>Input Source Type</label>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}><input type="radio" name="videoEditType" checked={videoEditData.type === 'url'} onChange={() => setVideoEditData({ ...videoEditData, type: 'url' })} /> External URL</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}><input type="radio" name="videoEditType" checked={videoEditData.type === 'file'} onChange={() => setVideoEditData({ ...videoEditData, type: 'file' })} /> Video File</label>
                </div>
              </div>
              {videoEditData.type === 'url' ? (
                <div className="form-group">
                  <label className="form-label">External Video URL</label>
                  <input type="url" className="form-control" value={videoEditData.external_url} onChange={(e) => setVideoEditData({ ...videoEditData, external_url: e.target.value })} placeholder="https://www.youtube.com/embed/..." required />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Replace Video File (Leave blank to keep current)</label>
                  <input type="file" className="form-control" onChange={(e) => setVideoEditData({ ...videoEditData, file: e.target.files[0] })} accept="video/*" />
                  {videoEditData.file_name && <span style={{ fontSize: '0.75rem', color: 'var(--gray-text)' }}>Current: {videoEditData.file_name}</span>}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setVideoModalOpen(false); setVideoEditData(null); }} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero Image Edit Modal */}
      {heroModalOpen && heroEditData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => { setHeroModalOpen(false); setHeroEditData(null); }}><X size={20} /></button>
            <h3 style={{ marginBottom: '20px' }}>Edit Hero Slide Details</h3>
            <form onSubmit={handleHeroEditSubmit}>
              <div className="form-group">
                <label className="form-label">Hero Title</label>
                <input type="text" className="form-control" value={heroEditData.title} onChange={(e) => setHeroEditData({ ...heroEditData, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Replace Banner Image (Leave blank to keep current)</label>
                <input type="file" className="form-control" onChange={(e) => setHeroEditData({ ...heroEditData, file: e.target.files[0] })} accept="image/*" />
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-text)' }}>Current: {heroEditData.file_name}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setHeroModalOpen(false); setHeroEditData(null); }} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
