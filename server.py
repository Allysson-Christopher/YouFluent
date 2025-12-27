from flask import Flask, jsonify, request
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
import re

app = Flask(__name__)
CORS(app)

# Instancia a API uma vez
ytt_api = YouTubeTranscriptApi()

def chunk_transcript(transcript_data, max_duration=20):
    """Divide a transcricao em chunks de aproximadamente max_duration segundos"""
    chunks = []
    current_chunk = {
        'start': 0,
        'end': 0,
        'text': '',
        'segments': []
    }

    for segment in transcript_data:
        segment_end = segment['start'] + segment['duration']

        if current_chunk['segments']:
            chunk_duration = segment_end - current_chunk['start']

            if chunk_duration > max_duration:
                current_chunk['end'] = current_chunk['segments'][-1]['start'] + current_chunk['segments'][-1]['duration']
                current_chunk['text'] = ' '.join([s['text'] for s in current_chunk['segments']])
                chunks.append(current_chunk)

                current_chunk = {
                    'start': segment['start'],
                    'end': segment_end,
                    'text': '',
                    'segments': [segment]
                }
            else:
                current_chunk['segments'].append(segment)
        else:
            current_chunk['start'] = segment['start']
            current_chunk['segments'].append(segment)

    if current_chunk['segments']:
        current_chunk['end'] = current_chunk['segments'][-1]['start'] + current_chunk['segments'][-1]['duration']
        current_chunk['text'] = ' '.join([s['text'] for s in current_chunk['segments']])
        chunks.append(current_chunk)

    return [{
        'start': c['start'],
        'end': c['end'],
        'text': c['text']
    } for c in chunks]

@app.route('/api/transcript/<video_id>')
def get_transcript(video_id):
    """Busca a transcricao de um video do YouTube"""
    try:
        # Lista as transcricoes disponiveis
        transcript_list = ytt_api.list(video_id)

        # Tenta encontrar transcricao em ingles primeiro
        transcript = None
        try:
            transcript = transcript_list.find_transcript(['en', 'en-US', 'en-GB'])
        except:
            try:
                transcript = transcript_list.find_transcript(['pt', 'pt-BR', 'es'])
            except:
                # Pega a primeira disponivel
                for t in transcript_list:
                    transcript = t
                    break

        if not transcript:
            return jsonify({
                'success': False,
                'error': 'Nenhuma legenda encontrada'
            }), 400

        # Busca os dados da transcricao
        fetched = transcript.fetch()

        # Converte para formato de dicionario
        transcript_data = fetched.to_raw_data()

        # Divide em chunks
        chunks = chunk_transcript(transcript_data, max_duration=15)

        return jsonify({
            'success': True,
            'video_id': video_id,
            'language': transcript.language,
            'chunks': chunks,
            'total_chunks': len(chunks)
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


if __name__ == '__main__':
    print("Servidor rodando em http://localhost:5000")
    app.run(port=5000, debug=True)
