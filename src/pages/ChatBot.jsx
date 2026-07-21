import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Mic, Volume2, VolumeX, Square, Download, Video } from 'lucide-react';
import RobotSvg from '../components/RobotSvg.jsx';
import { API_URL, renderFileIcon } from '../utils/helpers.jsx';

const ChatBot = ({ onOpenLightbox, currentUser }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [chatLanguage, setChatLanguage] = useState('en-IN');
  const [showPopup, setShowPopup] = useState(true);
  const [translatedGreeting, setTranslatedGreeting] = useState('');
  const [sessionStartIndex, setSessionStartIndex] = useState(0);
  const audioPlayRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  useEffect(() => {
    return () => { stopSpeaking(); };
  }, []);

  useEffect(() => {
    const updateGreeting = async () => {
      const userName = currentUser ? currentUser.name : 'User';
      const userKey = currentUser ? (currentUser.id || currentUser.phone) : 'guest';
      
      const todayStr = new Date().toISOString().split('T')[0]; // e.g. "2026-07-20"
      const greetKey = `mopa_last_greeted_${userKey}`;
      const lastGreetedDate = localStorage.getItem(greetKey);
      
      let baseGreeting = "";
      if (lastGreetedDate !== todayStr) {
        baseGreeting = `Good day, ${userName}! Welcome to the Ministry of Parliamentary Affairs Chatbot! Ask me any question related to our uploaded documents, guidelines, or announcements.`;
        localStorage.setItem(greetKey, todayStr);
      } else {
        baseGreeting = "Welcome to the Ministry of Parliamentary Affairs Chatbot! Ask me any question related to our uploaded documents, guidelines, or announcements.";
      }

      try {
        const res = await fetch(`${API_URL}/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: baseGreeting, language: chatLanguage })
        });
        const data = await res.json();
        if (data.translatedText) {
          setTranslatedGreeting(data.translatedText);
          setChatMessages(prev => {
            const copy = [...prev];
            if (copy.length > 0 && copy[0].isBot && (copy[0].isGreeting || copy[0].text.startsWith("Welcome") || copy[0].text.startsWith("Good day"))) {
              copy[0] = { text: data.translatedText, isBot: true, isGreeting: true };
            } else if (copy.length === 0) {
              copy.push({ text: data.translatedText, isBot: true, isGreeting: true });
            }
            return copy;
          });
        }
      } catch (err) {
        console.warn('Failed to translate greeting:', err);
        setTranslatedGreeting(baseGreeting);
        setChatMessages(prev => {
          const copy = [...prev];
          if (copy.length === 0) {
            copy.push({ text: baseGreeting, isBot: true, isGreeting: true });
          }
          return copy;
        });
      }
    };

    updateGreeting();
  }, [chatLanguage, currentUser]);

  // End conversation session (stop speech and add boundary markers) when chatbot is closed/minimized
  useEffect(() => {
    if (!isChatOpen) {
      stopSpeaking();
      if (chatMessages.length - sessionStartIndex > 1) {
        const endLabel = chatLanguage.startsWith('hi') ? "बातचीत समाप्त" :
                         chatLanguage.startsWith('bn') ? "কথোপকথন শেষ" :
                         chatLanguage.startsWith('gu') ? "વાતચીત સમાપ્ત" :
                         chatLanguage.startsWith('mr') ? "संभाषण समाप्त" :
                         chatLanguage.startsWith('or') ? "କଥୋପକଥନ ସମାପ୍ତ" : "Conversation Ended";
                         
        const nextGreeting = translatedGreeting || "Welcome to the Ministry of Parliamentary Affairs Chatbot! Ask me any question related to our uploaded documents, guidelines, or announcements.";
        
        setChatMessages(prev => {
          const updated = [
            ...prev,
            { text: endLabel, isSystem: true },
            { text: nextGreeting, isBot: true, isGreeting: true }
          ];
          setTimeout(() => {
            setSessionStartIndex(updated.length - 1);
          }, 0);
          return updated;
        });
      }
    }
  }, [isChatOpen]);

  // Greet user with voice message when chatbot panel is opened
  useEffect(() => {
    if (isChatOpen && translatedGreeting) {
      // Speak the greeting in the currently active language
      speakText(translatedGreeting, chatLanguage);
    }
  }, [isChatOpen, translatedGreeting]);

  const splitTextIntoChunks = (txt) => {
    const cleanText = txt.replace(/[\*#\>\[\]\(\)]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
    const sentences = cleanText.match(/[^.!?।\n]+[.!?।\n]*/g) || [cleanText];
    const chunks = [];
    let currentChunk = '';
    sentences.forEach(sentence => {
      if ((currentChunk + sentence).length > 200) {
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    });
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    return chunks;
  };

  const playGoogleTTSChunk = (chunkText, lang, onEndedCallback) => {
    const shortLang = lang.split('-')[0];
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunkText)}&tl=${shortLang}&client=tw-ob`;
    const audio = new Audio(url);
    audioPlayRef.current = audio;
    audio.onended = onEndedCallback;
    audio.onerror = () => {
      playBrowserFallbackChunk(chunkText, lang, onEndedCallback);
    };
    audio.play().catch(() => {
      playBrowserFallbackChunk(chunkText, lang, onEndedCallback);
    });
  };

  const playBrowserFallbackChunk = (chunkText, lang, onEndedCallback) => {
    if (!('speechSynthesis' in window)) {
      onEndedCallback();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.lang = lang;
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (matchedVoice) utterance.voice = matchedVoice;
    utterance.onend = onEndedCallback;
    utterance.onerror = onEndedCallback;
    window.speechSynthesis.speak(utterance);
  };

  const speakText = async (text, lang, force = false) => {
    if (isMuted && !force) return;
    stopSpeaking();
    setIsSpeaking(true);

    const chunks = splitTextIntoChunks(text);
    if (chunks.length === 0) {
      setIsSpeaking(false);
      return;
    }

    let currentIdx = 0;

    const playNextChunk = async () => {
      if (isMuted && !force) {
        setIsSpeaking(false);
        return;
      }
      if (currentIdx >= chunks.length) {
        setIsSpeaking(false);
        return;
      }

      const chunkText = chunks[currentIdx];

      try {
        const res = await fetch(`${API_URL}/api/sarvam/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: chunkText, language_code: lang })
        });
        const data = await res.json();
        if (data.success && data.audio_content) {
          const audio = new Audio("data:audio/wav;base64," + data.audio_content);
          audioPlayRef.current = audio;
          audio.onended = () => {
            currentIdx++;
            playNextChunk();
          };
          audio.onerror = () => {
            playGoogleTTSChunk(chunkText, lang, () => {
              currentIdx++;
              playNextChunk();
            });
          };
          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('Sarvam chunk TTS failed, falling back:', err);
      }

      playGoogleTTSChunk(chunkText, lang, () => {
        currentIdx++;
        playNextChunk();
      });
    };

    playNextChunk();
  };

  const stopSpeaking = () => {
    if (audioPlayRef.current) {
      try { audioPlayRef.current.pause(); audioPlayRef.current = null; } catch (err) { console.error(err); }
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleMuteToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (nextMute) {
      if (audioPlayRef.current && !audioPlayRef.current.paused) { audioPlayRef.current.pause(); setIsSpeaking(false); }
      if ('speechSynthesis' in window && window.speechSynthesis.speaking && !window.speechSynthesis.paused) { window.speechSynthesis.pause(); setIsSpeaking(false); }
    } else {
      let resumed = false;
      if (audioPlayRef.current && audioPlayRef.current.paused && audioPlayRef.current.currentTime > 0 && !audioPlayRef.current.ended) {
        audioPlayRef.current.play().then(() => setIsSpeaking(true)).catch(err => console.error(err));
        resumed = true;
      }
      if ('speechSynthesis' in window && window.speechSynthesis.paused) { window.speechSynthesis.resume(); setIsSpeaking(true); resumed = true; }
      if (!resumed) {
        const lastBotMsg = [...chatMessages].reverse().find(m => m.isBot);
        if (lastBotMsg) speakText(lastBotMsg.text, chatLanguage, true);
      }
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      const rec = new SpeechRecognition();
      rec.lang = chatLanguage;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        submitChatQuery(transcript);
      };
      recognitionRef.current = rec;
      rec.start();
    }
  };

  const submitChatQuery = async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    setChatMessages((prev) => [...prev, { text: queryText, isBot: false }]);
    setChatInput('');
    setIsChatLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, language: chatLanguage, history: chatMessages.slice(sessionStartIndex) })
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, {
        text: data.answer,
        isBot: true,
        documentUrl: data.documentUrl,
        documentTitle: data.documentTitle,
        mediaType: data.mediaType,
        mediaUrl: data.mediaUrl,
        mediaTitle: data.mediaTitle,
        mediaDescription: data.mediaDescription,
        mediaId: data.mediaId
      }]);
      speakText(data.answer, chatLanguage);
    } catch (err) {
      setChatMessages((prev) => [...prev, { text: "Connection error. Please try again later.", isBot: true }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    submitChatQuery(chatInput);
  };

  return (
    <>
      {showPopup && !isChatOpen && (
        <div className="chatbot-popup" onClick={() => setIsChatOpen(true)} style={{ cursor: 'pointer' }}>
          <span>🤖 I am your <strong>Lok Mitra</strong>!</span>
          <button onClick={(e) => { e.stopPropagation(); setShowPopup(false); }} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '2px', marginLeft: '6px', display: 'flex', alignItems: 'center' }}>
            <X size={12} />
          </button>
        </div>
      )}

      <div onClick={() => setIsChatOpen(!isChatOpen)} className="chatbot-trigger" title="Lok Mitra" style={{ padding: '0px' }}>
        {isChatOpen ? <X size={32} style={{ strokeWidth: 2.5 }} /> : <RobotSvg isSpeaking={isSpeaking} width={72} />}
      </div>

      {isChatOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="speaking-glow" style={{ marginRight: '10px', borderRadius: '50%' }}>
                <RobotSvg isSpeaking={isSpeaking} width={42} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="chatbot-header-title" style={{ fontSize: '0.9rem', fontWeight: '700' }}>Lok Mitra</span>
                <span style={{ fontSize: '0.65rem', opacity: '0.8' }}>{isSpeaking ? 'Speaking...' : 'Online'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select value={chatLanguage} onChange={(e) => { setChatLanguage(e.target.value); stopSpeaking(); }} style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.7rem', outline: 'none', cursor: 'pointer' }}>
                <option value="en-IN" style={{color:'#000'}}>EN (English)</option>
                <option value="hi-IN" style={{color:'#000'}}>HI (हिंदी)</option>
                <option value="or-IN" style={{color:'#000'}}>OR (ଓଡ଼ିଆ)</option>
                <option value="mr-IN" style={{color:'#000'}}>MR (मराठी)</option>
                <option value="gu-IN" style={{color:'#000'}}>GU (ગુજરાતી)</option>
                <option value="bn-IN" style={{color:'#000'}}>BN (বাংলা)</option>
              </select>
              {isSpeaking && (
                <button onClick={stopSpeaking} title="Stop Speaking" style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Square size={16} fill="#EF4444" stroke="none" />
                </button>
              )}
              <button onClick={handleMuteToggle} title={isMuted ? 'Unmute Bot' : 'Mute Bot'} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
              <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {chatMessages.map((msg, index) => {
              if (msg.isSystem) {
                return (
                  <div key={index} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '15px 0' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(226, 232, 240, 0.6)' }} />
                    <span style={{ padding: '0 12px', fontSize: '0.7rem', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {msg.text}
                    </span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(226, 232, 240, 0.6)' }} />
                  </div>
                );
              }
              return (
                <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', alignSelf: msg.isBot ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                  {msg.isBot && (
                    <div style={{ flexShrink: 0, marginTop: '2px' }}>
                      <RobotSvg isSpeaking={false} width={34} />
                    </div>
                  )}
                  <div className={`chat-message ${msg.isBot ? 'chat-message-bot' : 'chat-message-user'}`} style={{ maxWidth: '100%' }}>
                    <div>{msg.text}</div>
                    {msg.documentUrl && (
                      <div style={{ marginTop: '12px', padding: '12px', border: '1px solid #E2E8F0', borderRadius: 'var(--border-radius-md)', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {renderFileIcon(msg.documentUrl.substring(msg.documentUrl.lastIndexOf('.')))}
                          <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.documentTitle}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-text)' }}>Reference Document</div>
                          </div>
                        </div>
                        <a href={msg.documentUrl} download target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ padding: '8px 12px', fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: 'var(--primary-navy)', color: 'white', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}>
                          <Download size={14} /> Download Document
                        </a>
                      </div>
                    )}
                    {msg.mediaType === 'photo' && (
                      <div style={{ marginTop: '12px', cursor: 'pointer', textAlign: 'left' }} onClick={() => onOpenLightbox('photo', [{ id: msg.mediaId, title: msg.mediaTitle, description: msg.mediaDescription, file_url: msg.mediaUrl }], 0)}>
                        <img src={msg.mediaUrl} alt={msg.mediaTitle} style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--gray-border)' }} />
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-text)', marginTop: '4px', fontStyle: 'italic' }}>🔍 Click to open image in dialogue box</div>
                      </div>
                    )}
                    {msg.mediaType === 'video' && (
                      <div style={{ marginTop: '12px', cursor: 'pointer', textAlign: 'left' }} onClick={() => onOpenLightbox('video', [{ id: msg.mediaId, title: msg.mediaTitle, description: msg.mediaDescription, file_url: msg.mediaUrl }], 0)}>
                        <div style={{ position: 'relative', width: '100%', height: '150px', backgroundColor: '#020617', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {msg.mediaUrl.includes('youtube.com') || msg.mediaUrl.includes('youtu.be') ? (
                            <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <Video size={30} style={{ color: '#EF4444' }} />
                              <span style={{ fontSize: '0.75rem', padding: '0 10px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{msg.mediaTitle}</span>
                            </div>
                          ) : (
                            <video src={msg.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--primary-navy)' }}>
                              <Video size={18} />
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-text)', marginTop: '4px', fontStyle: 'italic' }}>▶️ Click to play video in dialogue box</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isChatLoading && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', alignSelf: 'flex-start' }}>
                <div className="speaking-glow" style={{ borderRadius: '50%' }}>
                  <RobotSvg isSpeaking={true} width={34} />
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-text)' }}>Analyzing files & drafting response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleChatSubmit} className="chatbot-input-area" style={{ display: 'flex', gap: '8px', padding: '12px' }}>
            <button type="button" onClick={toggleListening} className={`btn btn-secondary mic-btn ${isListening ? 'active' : ''}`} style={{ padding: '10px', borderRadius: 'var(--border-radius-md)' }} title={isListening ? 'Listening... Click to stop' : 'Start Voice Input'}>
              <Mic size={16} />
            </button>
            <input type="text" className="form-control" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={isListening ? 'Listening...' : 'Ask about bills, reports, or data...'} required disabled={isListening} />
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 14px' }} disabled={isListening}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
