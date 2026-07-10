import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await prisma.counselingSession.findUnique({ where: { id } });
    if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    let transcript = '';
    let summary = '';

    if (apiKey && session.audioUrl) {
      // Fetch audio from URL and send to Gemini
      try {
        const audioRes = await fetch(session.audioUrl);
        if (audioRes.ok) {
          const audioBuffer = await audioRes.arrayBuffer();
          const base64Audio = Buffer.from(audioBuffer).toString('base64');
          const mimeType = session.audioUrl.endsWith('.mp3') ? 'audio/mp3' : 'audio/webm';
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ inlineData: { mimeType, data: base64Audio } }, { text: 'Analyze this counseling session audio. Generate a transcript and structured summary. Return JSON: {"transcript": "...", "summary": "..."}' }] }], generationConfig: { responseMimeType: 'application/json' } }),
          });
          if (response.ok) {
            const data = await response.json() as any;
            const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (resultText) {
              const parsed = JSON.parse(resultText);
              transcript = parsed.transcript || '';
              summary = parsed.summary || '';
            }
          }
        }
      } catch (e) {
        console.error('Gemini analysis failed:', e);
      }
    }

    if (!transcript) {
      transcript = '[No audio file available for analysis or GEMINI_API_KEY not configured.]';
      summary = 'Analysis not available.';
    }

    const updatedSession = await prisma.counselingSession.update({ where: { id }, data: { transcript, summary } });
    return NextResponse.json({ success: true, session: updatedSession });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to analyze audio recording.' }, { status: 500 });
  }
}
