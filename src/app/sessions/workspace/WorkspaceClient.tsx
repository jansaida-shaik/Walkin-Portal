'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../../lib/auth';
import { saveSessionNotes, endCounsellingSession, uploadSessionAudio, analyzeSessionAudio } from '../../../actions/walkinActions';
import StudentDetailsRecord from '../../../components/StudentDetailsRecord';

interface Session {
  id: string; studentId: string; counselorId: string;
  startTime: Date | string | null; endTime: Date | string | null;
  duration: number | null; status: string; notes: string | null; followUpStatus: string | null;
  audioUrl?: string | null;
  transcript?: string | null;
  summary?: string | null;
}
interface Student {
  id: string; name: string; phone: string; course: string; branchName?: string;
  walkinDate: Date | string; status: string; remarks: string | null;
  source: string; details: any; sessions: Session[];
}
interface Counselor { id: string; name: string; branchId: string; branchName: string; }
interface WorkspaceClientProps {
  student: Student;
  counselors: Counselor[];
  user: SessionUser | null;
}

const FOLLOWUP_OPTIONS = [
  { value: 'No Follow-up', label: 'No Follow-up (Direct Admission)' },
  { value: 'Follow-up Required', label: 'Follow-up Required' },
  { value: 'Ready to Enroll', label: 'Ready to Enroll' },
  { value: 'Not Interested', label: 'Not Interested' },
  { value: 'Callback Scheduled', label: 'Callback Scheduled' },
];

function formatHHMMSS(s: number) {
  if (isNaN(s) || s < 0) return '00:00:00';
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), Math.floor(s % 60)]
    .map(n => String(n).padStart(2, '0')).join(':');
}
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function CustomDropdown({ value, onChange, isOpen, onToggle, onClose, disabled }: {
  value: string;
  onChange: (v: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  disabled?: boolean;
}) {
  const options = FOLLOWUP_OPTIONS;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(t) &&
        triggerRef.current && !triggerRef.current.contains(t)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', fn);
    return () => {
      document.removeEventListener('mousedown', fn);
    };
  }, [isOpen, onClose]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={disabled ? undefined : onToggle}
        disabled={disabled}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 10, padding: '11px 14px', minHeight: 44,
          borderRadius: 10,
          border: isOpen ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
          background: isOpen ? 'var(--surface-alt)' : 'var(--surface)',
          color: 'var(--text)',
          fontSize: '0.88rem', fontFamily: 'inherit', fontWeight: 500,
          cursor: disabled ? 'not-allowed' : 'pointer', outline: 'none', textAlign: 'left',
          boxShadow: isOpen ? '0 0 0 3px var(--primary-glow)' : 'none',
          transition: 'border-color 0.18s, box-shadow 0.18s',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span style={{
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: selected ? 'var(--text)' : 'var(--muted)',
        }}>
          {selected ? selected.label : 'Select Follow-up Status'}
        </span>
        <svg viewBox="0 0 12 8" fill="none" width="11" height="11"
          style={{ flexShrink: 0, opacity: 0.5, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          style={{
            position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: 6,
            zIndex: 9999, background: 'var(--surface)', border: '1.5px solid var(--border)',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ padding: '5px' }}>
            {options.map(opt => {
              const isSel = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); onToggle(); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 10, padding: '10px 12px', border: 'none', borderRadius: 8,
                    background: isSel ? 'var(--primary-glow)' : 'transparent',
                    color: isSel ? 'var(--primary)' : 'var(--text)',
                    fontSize: '0.875rem', fontFamily: 'inherit', fontWeight: isSel ? 700 : 400,
                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(99,102,241,0.07)'; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{opt.label}</span>
                  {isSel && (
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const C: Record<string, { bg: string; color: string; border: string; dot?: string }> = {
    'Assigned': { bg: 'var(--primary-glow)', color: 'var(--primary)', border: 'var(--border)', dot: 'var(--primary)' },
    'In Session': { bg: 'var(--warning-glow)', color: 'var(--warning)', border: 'var(--border)', dot: 'var(--warning)' },
    'Completed': { bg: 'var(--success-glow)', color: 'var(--success)', border: 'var(--border)', dot: 'var(--success)' },
    'Waiting': { bg: 'var(--info-glow)', color: 'var(--info)', border: 'var(--border)', dot: 'var(--info)' },
  };
  const c = C[status] || { bg: 'var(--surface-alt)', color: 'var(--muted)', border: 'var(--border)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 999,
      fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em',
      textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0,
      background: c.bg, color: c.color, border: `1.5px solid ${c.border}`,
    }}>
      {c.dot && <span style={{
        width: 6, height: 6, borderRadius: '50%', background: c.dot,
        display: 'inline-block', boxShadow: `0 0 5px ${c.dot}`,
        animation: status === 'In Session' ? 'pulseDot 1.4s ease-in-out infinite' : undefined,
      }} />}
      {status}
    </span>
  );
}

export default function WorkspaceClient({ student, counselors, user }: WorkspaceClientProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [notes, setNotes] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [followUp, setFollowUp] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const ses = student.sessions.find(s => s.status === 'ASSIGNED' || s.status === 'IN_SESSION');

  // MediaRecorder references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [micWarning, setMicWarning] = useState<boolean>(false);
  const [dspActive, setDspActive] = useState<boolean>(false);

  // Audio Context & Analyser references
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Speech Recognition references
  const recognitionRef = useRef<any>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [speechLanguage, setSpeechLanguage] = useState<string>('te-IN');

  // Draft protection check
  const isUnsaved = notes !== (ses?.notes || '') || followUp !== (ses?.followUpStatus || '');

  // Warn on browser reload/close with unsaved changes
  useEffect(() => {
    if (!isUnsaved) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes in your counselling notes.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isUnsaved]);

  // Mount logic: Load from DB, then override with localStorage draft if it exists
  useEffect(() => {
    if (ses) {
      setNotes(ses.notes || '');
      setFollowUp(ses.followUpStatus || '');
      setSummary(ses.summary || '');

      const draftKey = `session_notes_draft_${ses.id}`;
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.notes) setNotes(parsed.notes);
          if (parsed.followUp) setFollowUp(parsed.followUp);
          if (parsed.summary) setSummary(parsed.summary);
          
          if (parsed.notes !== (ses.notes || '') || parsed.followUp !== (ses.followUpStatus || '')) {
            // Delay toast slightly to ensure layout is mounted
            setTimeout(() => showToast('📝 Restored unsaved draft notes from local storage.', 'success'), 500);
          }
        } catch (e) {
          console.error('Failed to parse saved draft notes', e);
        }
      }
    }
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [student, ses]);

  // Save changes to local storage draft key
  useEffect(() => {
    if (!ses?.id) return;
    const draftKey = `session_notes_draft_${ses.id}`;
    localStorage.setItem(draftKey, JSON.stringify({ notes, followUp, summary }));
  }, [ses?.id, notes, followUp, summary]);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startRecording = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('MediaDevices API not supported in this browser.');
        }

        // Request audio access with industry-standard hardware constraints for voice processing
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000
          }
        });
        activeStream = stream;
        streamRef.current = stream;
        chunksRef.current = [];

        // --- Web Audio API DSP Noise-cancelling & Normalization Pipeline ---
        let finalSourceStream = stream;
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;

            const source = audioCtx.createMediaStreamSource(stream);

            // 1. High-pass filter: Eliminate low frequency rumble/AC hum (< 85Hz)
            const hpFilter = audioCtx.createBiquadFilter();
            hpFilter.type = 'highpass';
            hpFilter.frequency.value = 85; 

            // 2. Low-pass filter: Cut high frequency hiss (> 8000Hz)
            const lpFilter = audioCtx.createBiquadFilter();
            lpFilter.type = 'lowpass';
            lpFilter.frequency.value = 8000;

            // 3. Dynamics Compressor: Normalize speech levels
            const compressor = audioCtx.createDynamicsCompressor();
            compressor.threshold.value = -24; // dB
            compressor.knee.value = 30; // dB
            compressor.ratio.value = 12; // Compression ratio
            compressor.attack.value = 0.003; // 3ms
            compressor.release.value = 0.25; // 250ms

            // 4. Analyser Node for Real-time Visuals
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            // Connect graph
            source.connect(hpFilter);
            hpFilter.connect(lpFilter);
            lpFilter.connect(compressor);
            compressor.connect(analyser);

            // Destination stream for recording the processed audio
            const destination = audioCtx.createMediaStreamDestination();
            analyser.connect(destination);

            finalSourceStream = destination.stream;
            setDspActive(true);
            console.log('🎙️ DSP Noise-cancelling & normalizer pipeline initialized.');
          }
        } catch (audioErr) {
          console.warn('Failed to initialize Web Audio API DSP pipeline, using raw stream:', audioErr);
        }

        // Check if MediaRecorder is available
        const options = { mimeType: 'audio/webm' };
        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(finalSourceStream, options);
        } catch (e) {
          console.warn('webm mimeType not supported, falling back to default options');
          recorder = new MediaRecorder(finalSourceStream);
        }

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        recorder.start(1000); // collect chunks every 1 second
        mediaRecorderRef.current = recorder;
        setMicWarning(false);
        console.log('🎙️ Background session recording started successfully.');

        // MediaRecorder started successfully.
      } catch (err: any) {
        console.error('Failed to access microphone or start recording:', err);
        setMicWarning(true);
        setDspActive(false);
        showToast('⚠️ Microphone not found or access denied. Audio recording is disabled.', 'info');
      }
    };

    if (student.status === 'In Session' && ses) {
      startRecording();
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(e => console.error(e));
        audioContextRef.current = null;
      }
    };
  }, [student.status, ses?.id]);

  // Speech Recognition Effect - handles starting/restarting dynamically on language change
  useEffect(() => {
    let rec: any = null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (student.status === 'In Session' && ses && SpeechRecognition) {
      try {
        rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = speechLanguage;

        rec.onresult = (event: any) => {
          let finalStr = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalStr += event.results[i][0].transcript + ' ';
            }
          }
          if (finalStr) {
            setTranscript(prev => prev + finalStr);
          }
        };

        rec.onerror = (e: any) => {
          if (e.error === 'no-speech') return; // ignore harmless silence timeouts
          console.error('Speech recognition error:', e.error || e);
        };

        rec.onend = () => {
          // Restart if the session is still active and recording is running
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            try { rec.start(); } catch (err) { console.error('Failed to restart speech recognition:', err); }
          }
        };

        rec.start();
        recognitionRef.current = rec;
        console.log(`🗣️ Speech recognition started with language: ${speechLanguage}`);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }

    return () => {
      if (rec) {
        rec.onend = null;
        try { rec.stop(); } catch (err) { console.error(err); }
      }
      recognitionRef.current = null;
    };
  }, [student.status, ses?.id, speechLanguage]);

  // Canvas visualization loop for real-time waveform drawing
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      const analyser = analyserRef.current;
      
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);

      if (!analyser || micWarning) {
        // Draw elegant idle wave
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      ctx.lineWidth = 3;
      // Multi-stop beautiful indigo gradient for high-end look
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#818cf8');
      gradient.addColorStop(0.5, '#6366f1');
      gradient.addColorStop(1, '#4f46e5');
      ctx.strokeStyle = gradient;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // scale value from 0-255 to -1.0 to +1.0
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [micWarning]);

  const showToast = (txt: string, t: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg(txt);
    setToastType(t);
    if (t !== 'error') {
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleGenerateSummary = () => {
    if (!transcript) return;
    showToast('🪄 Analyzing transcript and generating summary...', 'info');
    
    // Heuristic summarizer: formats key items, questions, and topics from transcript
    setTimeout(() => {
      const sentences = transcript.split(/[.।?!\n]/).map(s => s.trim()).filter(Boolean);
      let summaryText = "🎙️ **Audio Session Key Highlights:**\n\n";
      
      const topics: { category: string; text: string }[] = [];
      const questions: string[] = [];
      const keywords = {
        placements: ["placement", "job", "career", "ప్లేస్‌మెంట్స్", "ఉద్యోగం", "नौकरी"],
        fees: ["fee", "payment", "discount", "ఫీజు", "డిస్కౌంట్", "फीस"],
        batch: ["batch", "class", "time", "date", "క్లాస్", "బ్యాచ్", "समय"],
        course: ["python", "java", "coding", "web", "కోర్సు", "పైథాన్", "कोर्स"]
      };

      sentences.forEach(s => {
        const lower = s.toLowerCase();
        if (lower.includes("?") || lower.includes("ఎప్పుడు") || lower.includes("ఎలా") || lower.includes("ఏమిటి") || lower.includes("क्या") || lower.includes("कब")) {
          questions.push(s);
        }
        for (const [key, list] of Object.entries(keywords)) {
          if (list.some(word => lower.includes(word))) {
            topics.push({ category: key, text: s });
          }
        }
      });

      if (topics.length > 0) {
        summaryText += "📌 **Key Topics Discussed:**\n";
        const uniqueCats = Array.from(new Set(topics.map(t => t.category)));
        uniqueCats.slice(0, 3).forEach(cat => {
          const item = topics.find(t => t.category === cat);
          if (item) {
            summaryText += `- **${cat.toUpperCase()}**: Discussed details regarding "${item.text.slice(0, 70)}..."\n`;
          }
        });
        summaryText += "\n";
      }

      if (questions.length > 0) {
        summaryText += "❓ **Questions Asked:**\n";
        questions.slice(0, 3).forEach(q => {
          summaryText += `- ${q}?\n`;
        });
        summaryText += "\n";
      }

      summaryText += "📝 **Overall Discussion Draft:**\n";
      summaryText += sentences.slice(0, 4).join(". ") + (sentences.length > 4 ? "..." : ".");

      setSummary(summaryText);
      showToast('✅ Audio summary generated!', 'success');
    }, 1000);
  };

  const handleSaveNotes = async () => {
    setLoading(true);
    showToast('Saving notes...', 'info');
    const r = await saveSessionNotes(student.id, notes, followUp, summary);
    if (r.success) {
      showToast('✅ Notes saved successfully.', 'success');
      router.refresh();
    } else {
      showToast(r.error || 'Failed to save notes.', 'error');
    }
    setLoading(false);
  };

  const handleEndCounselling = async () => {
    if (!followUp) {
      showToast('⚠️ Please select a Follow-up Status before ending the session.', 'error');
      return;
    }
    setLoading(true);
    showToast('Ending session and saving notes...', 'info');
    await saveSessionNotes(student.id, notes, followUp, summary);

    // Stop recording and get the audio blob
    let audioBlob: Blob | null = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const stopPromise = new Promise<Blob | null>((resolve) => {
        if (!mediaRecorderRef.current) return resolve(null);
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          resolve(blob);
        };
        mediaRecorderRef.current.stop();
      });

      // Stop all microphone tracks to turn off the recording light
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(e => console.error('Error closing AudioContext:', e));
        audioContextRef.current = null;
      }

      audioBlob = await stopPromise;
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }

    // Upload recording
    if (audioBlob && ses?.id && !micWarning) {
      showToast('Uploading session recording...', 'info');
      const uploadRes = await uploadSessionAudio(ses.id, audioBlob);
      if (uploadRes.success) {
        showToast('🪄 Analyzing recording & generating AI summary...', 'info');
        await analyzeSessionAudio(ses.id);
      } else {
        console.error('Audio upload failed:', uploadRes.error);
        showToast('⚠️ Recording upload failed, but saving session...', 'info');
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    const r = await endCounsellingSession(student.id, notes, followUp, transcript, summary);
    if (r.success) {
      if (ses?.id) {
        localStorage.removeItem(`session_notes_draft_${ses.id}`);
      }
      showToast('✅ Session ended successfully.', 'success');
      setTimeout(() => {
        router.push('/sessions');
      }, 1500);
    } else {
      showToast(r.error || 'Failed to end session.', 'error');
    }
    setLoading(false);
  };

  const handleExitWorkspace = () => {
    if (isUnsaved) {
      if (!confirm('You have unsaved changes in your counselling notes. Are you sure you want to exit? Your draft is saved locally but not submitted.')) {
        return;
      }
    }
    router.push('/sessions');
  };

  // Timer logic
  let elapsed = 0;
  if (ses?.startTime) {
    elapsed = Math.max(0, Math.floor((currentTime - new Date(ses.startTime).getTime()) / 1000));
  }

  return (
    <section className="dash-page" style={{ paddingBottom: 40 }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 11000,
          background: toastType === 'success' ? 'var(--success)' : toastType === 'error' ? 'var(--danger)' : 'var(--primary)',
          color: '#fff', padding: '12px 24px', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1.5px solid var(--border)',
          animation: 'ddIn 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}>
          {toastMsg}
        </div>
      )}

      {/* Real Page Header */}
      <div style={{
        background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '16px',
        padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.1rem', color: '#fff',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            boxShadow: '0 3px 10px var(--primary-glow)',
          }}>
            {getInitials(student.name)}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {student.name}
              <StatusPill status={student.status} />
            </h1>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>
              Record ID: <strong>#{student.id}</strong> | Course: <strong>{student.course}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Microphone Status Banner */}
          {student.status === 'In Session' && (
            micWarning ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'var(--danger-glow)', border: '1.5px solid var(--danger)',
                padding: '8px 14px', borderRadius: '10px', color: 'var(--danger)',
                fontSize: '0.82rem', fontWeight: 700
              }}>
                <span>⚠️</span>
                <span>Mic off / not found (Recording disabled)</span>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'var(--success-glow)', border: '1.5px solid var(--success)',
                padding: '8px 14px', borderRadius: '10px', color: 'var(--success)',
                fontSize: '0.82rem', fontWeight: 700
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--success)',
                  boxShadow: '0 0 6px var(--success)', display: 'inline-block',
                  animation: 'pulseDot 1.4s infinite'
                }} />
                <span>🎙️ Recording Active</span>
              </div>
            )
          )}

          {/* Session Timer */}
          {student.status === 'In Session' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--warning-glow)', border: '1.5px solid var(--warning-glow)',
              padding: '8px 16px', borderRadius: '10px'
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)', boxShadow: '0 0 8px var(--warning)', animation: 'pulseDot 1.4s infinite' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--warning)', fontFamily: 'monospace' }}>
                {formatHHMMSS(elapsed)}
              </span>
            </div>
          )}

          <button
            type="button"
            className="primary-btn"
            style={{
              height: '40px', padding: '0 20px', fontSize: '0.86rem',
              background: 'var(--accent-gradient)', border: 'none', borderRadius: '10px'
            }}
            onClick={handleSaveNotes}
            disabled={loading}
          >
            Save Notes
          </button>

          <button
            type="button"
            className="primary-btn"
            style={{
              height: '40px', padding: '0 20px', fontSize: '0.86rem',
              background: 'linear-gradient(135deg, var(--danger), #ef4444)', border: 'none', borderRadius: '10px'
            }}
            onClick={handleEndCounselling}
            disabled={loading}
          >
            End Session
          </button>

          <button
            type="button"
            className="outline-btn"
            style={{ height: '40px', padding: '0 16px', fontSize: '0.86rem', borderRadius: '10px' }}
            onClick={handleExitWorkspace}
          >
            Exit Workspace
          </button>
        </div>
      </div>

      {/* ─── Draft protection warning banner ─── */}
      {isUnsaved && (
        <div style={{
          background: 'var(--warning-glow)', border: '1.5px solid var(--warning)', color: 'var(--warning)',
          padding: '12px 20px', borderRadius: '12px', fontSize: '0.86rem', fontWeight: 700,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px',
          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.08)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span>
            <span>You have unsaved changes in your counselling notes draft.</span>
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(notes);
                showToast('📋 Copied notes to clipboard!', 'success');
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)', border: '1px solid var(--warning)', borderRadius: '8px',
                color: 'var(--text)', padding: '5px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
            >
              Copy Notes
            </button>
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={loading}
              style={{
                background: 'var(--warning)', border: 'none', borderRadius: '8px',
                color: 'var(--bg)', padding: '5px 14px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)', opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </div>
      )}

      {/* Main Page Layout Flow */}
      <div className="workspace-split-container">

        {/* Left Column: Student Academic History and Intake Profile Context */}
        <div className="workspace-left-panel">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 3, height: 22, borderRadius: 2, background: 'var(--primary)', flexShrink: 0 }} />
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)' }}>
                Student Submission Record Sheet
              </h2>
            </div>
            <StudentDetailsRecord student={student} counselors={counselors} />
          </div>
        </div>

        {/* Right Column: Counselling notes form, recording audio details and transcription canvas */}
        <div className="workspace-right-panel">
          
          {/* Counselling Notes & Follow-up Panel */}
          <div style={{
            background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '16px',
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', paddingBottom: '8px', margin: 0 }}>
              Active Session Records
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              {/* Counselling Notes Textarea */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  Counselling Notes
                </label>
                <textarea
                  style={{
                    width: '100%', height: '160px', padding: '12px 14px', borderRadius: '10px',
                    border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)',
                    fontSize: '.875rem', fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical', outline: 'none'
                  }}
                  placeholder="Type student background, qualification, and interested fields..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              {/* Dropdown & Remarks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                    Follow-up Status
                  </label>
                  <CustomDropdown
                    value={followUp}
                    onChange={v => setFollowUp(v)}
                    isOpen={isOpen}
                    onToggle={() => setIsOpen(!isOpen)}
                    onClose={() => setIsOpen(false)}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                    Intake Remarks
                  </span>
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', color: 'var(--text)', background: 'var(--surface)', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', lineHeight: 1.6 }}>
                    {student.remarks || 'No remarks added at registration.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Audio Session Summary block */}
            {student.status === 'In Session' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--primary)' }}>
                    🎙️ Audio Session Summary
                  </label>
                  {transcript && (
                    <button
                      type="button"
                      onClick={handleGenerateSummary}
                      style={{
                        background: 'var(--primary-glow)',
                        border: '1px solid var(--primary-glow)',
                        color: 'var(--primary)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        padding: '6px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--primary)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'var(--primary-glow)';
                        e.currentTarget.style.color = 'var(--primary)';
                      }}
                    >
                      🪄 Generate Audio Summary
                    </button>
                  )}
                </div>
                <textarea
                  style={{
                    width: '100%', height: '120px', padding: '12px 14px', borderRadius: '10px',
                    border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)',
                    fontSize: '.875rem', fontFamily: 'inherit', lineHeight: 1.6, resize: 'none', outline: 'none'
                  }}
                  placeholder="Click 'Generate Audio Summary' once you speak in any language, or type a summary of the verbal audio discussion here..."
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                />
              </div>
            )}

            {/* Live Transcript & DSP Processing Display */}
            {student.status === 'In Session' && (
              <div style={{
                marginTop: '16px',
                padding: '20px',
                background: 'var(--card-glow)',
                border: '1.5px solid var(--primary-glow)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                
                {/* Top Row: Title, Canvas Waveform Visualizer & DSP Status Indicators */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'pulseDot 1.4s infinite' }} />
                        🎙️ Voice Processing & Transcription
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                        Industry-level real-time audio filtering, noise reduction, and level normalization
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Language:
                      </label>
                      <select
                        value={speechLanguage}
                        onChange={e => {
                          setSpeechLanguage(e.target.value);
                          showToast(`🗣️ Switched speech language to ${e.target.options[e.target.selectedIndex].text}`, 'info');
                        }}
                        style={{
                          background: 'var(--surface)',
                          border: '1.5px solid var(--border)',
                          color: 'var(--text)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="te-IN">తెలుగు (Telugu)</option>
                        <option value="en-IN">English (India)</option>
                        <option value="hi-IN">हिन्दी (Hindi)</option>
                        <option value="en-US">English (US)</option>
                      </select>
                    </div>
                  </div>

                  {/* DSP status badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                      padding: '3px 8px', borderRadius: '6px',
                      background: dspActive ? 'var(--success-glow)' : 'var(--border)',
                      color: dspActive ? 'var(--success)' : 'var(--muted)',
                      border: dspActive ? '1px solid var(--success-glow)' : '1px solid var(--border)'
                    }}>
                      {dspActive ? '🟢 Web Audio DSP Active' : '⚪ Web Audio DSP Offline'}
                    </span>
                    <span style={{
                      fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                      padding: '3px 8px', borderRadius: '6px',
                      background: 'var(--primary-glow)',
                      color: 'var(--primary)',
                      border: '1px solid var(--primary-glow)'
                    }}>
                      🛡️ Highpass 85Hz
                    </span>
                    <span style={{
                      fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                      padding: '3px 8px', borderRadius: '6px',
                      background: 'var(--primary-glow)',
                      color: 'var(--primary)',
                      border: '1px solid var(--primary-glow)'
                    }}>
                      ⚡ Lowpass 8kHz
                    </span>
                    <span style={{
                      fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                      padding: '3px 8px', borderRadius: '6px',
                      background: 'var(--primary-glow)',
                      color: 'var(--primary)',
                      border: '1px solid var(--primary-glow)'
                    }}>
                      🎚️ Dynamics Compressor
                    </span>
                  </div>
                </div>

                {/* Middle Row: Live Waveform Visualizer & Level Indicator */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'var(--surface)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.04em' }}>
                    Live Signal Wave
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '36px' }}>
                    <canvas
                      ref={canvasRef}
                      width={480}
                      height={36}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '6px',
                        background: 'var(--surface-alt)'
                      }}
                    />
                  </div>
                </div>

                {/* Bottom Row: Speech transcript text container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      📝 Live Speech Transcription
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>
                      Speak in the selected language; transcription is saved automatically on session completion
                    </span>
                  </div>
                  <div style={{
                    maxHeight: '120px',
                    overflowY: 'auto',
                    fontSize: '0.88rem',
                    color: 'var(--text)',
                    lineHeight: 1.6,
                    padding: '12px 14px',
                    background: 'var(--surface)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    minHeight: '60px',
                    fontStyle: transcript ? 'normal' : 'italic'
                  }}>
                    {transcript || 'No speech detected yet... Start speaking to generate the transcript.'}
                  </div>
                </div>

              </div>
            )}
          </div>
          
        </div>

      </div>
    </section>
  );
}
