from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import re

# Carrega variaveis do .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Instancia a API uma vez
ytt_api = YouTubeTranscriptApi()

# Cliente OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def chunk_transcript(transcript_data, max_duration=20):
    """Divide a transcricao em chunks de aproximadamente max_duration segundos"""
    chunks = []
    current_chunk = {
        'start': 0,
        'end': 0,
        'text': '',
        'segments': []
    }

    for i, segment in enumerate(transcript_data):
        # Usa o inicio do proximo segmento como fim real, ou start + duration se for o ultimo
        if i + 1 < len(transcript_data):
            segment_end = transcript_data[i + 1]['start']
        else:
            segment_end = segment['start'] + segment['duration']

        if current_chunk['segments']:
            chunk_duration = segment_end - current_chunk['start']

            if chunk_duration > max_duration:
                # Usa o inicio do segmento atual como fim do chunk anterior
                current_chunk['end'] = segment['start']
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
        # Para o ultimo chunk, usa o fim do ultimo segmento
        last_seg = current_chunk['segments'][-1]
        current_chunk['end'] = last_seg['start'] + min(last_seg['duration'], 3)  # Max 3s para o ultimo
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
        chunks = chunk_transcript(transcript_data, max_duration=10)

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


@app.route('/api/generate-lesson', methods=['POST'])
def generate_lesson():
    """Gera uma aula completa para um chunk usando GPT-5-mini"""
    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text:
            return jsonify({'success': False, 'error': 'Texto nao fornecido'}), 400

        prompt = f"""Voce e um professor de ingles para brasileiros. Analise o seguinte trecho de video em ingles e crie uma aula completa.

Trecho: "{text}"

Responda APENAS com um JSON valido (sem markdown, sem ```json), no seguinte formato:
{{
    "translation": "traducao natural para portugues brasileiro",
    "explanation": "explicacao breve sobre gramatica, expressoes ou pronuncia importante do trecho (max 2 frases)",
    "vocabulary": [
        {{"word": "palavra1", "meaning": "significado em portugues"}},
        {{"word": "palavra2", "meaning": "significado em portugues"}}
    ],
    "exercise": {{
        "question": "pergunta sobre o trecho em portugues",
        "options": ["opcao1", "opcao2", "opcao3", "opcao4"],
        "correct": 0
    }}
}}

Regras:
- Vocabulario: escolha 2-4 palavras/expressoes mais uteis do trecho
- Exercicio: crie uma pergunta que teste compreensao (correct e o indice 0-3 da resposta certa)
- Seja conciso e pratico"""

        response = client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": "Voce e um professor de ingles. Responda apenas com JSON valido."},
                {"role": "user", "content": prompt}
            ],
            max_completion_tokens=4000
        )

        print(f"Response completo: {response}")  # Debug

        if not response.choices:
            return jsonify({'success': False, 'error': 'Sem choices na resposta'}), 500

        message = response.choices[0].message

        # Verifica se houve recusa
        if hasattr(message, 'refusal') and message.refusal:
            return jsonify({'success': False, 'error': f'IA recusou: {message.refusal}'}), 500

        result = message.content

        if not result:
            # Retorna info de debug
            return jsonify({
                'success': False,
                'error': 'Resposta vazia da IA',
                'debug': {
                    'finish_reason': response.choices[0].finish_reason,
                    'message_type': str(type(message)),
                    'content_value': repr(message.content),
                    'content_len': len(message.content) if message.content else 0
                }
            }), 500

        result = result.strip()
        print(f"Resposta da IA: {result[:200]}...")  # Debug

        # Tenta parsear o JSON
        try:
            lesson = json.loads(result)
        except json.JSONDecodeError:
            # Se falhar, tenta limpar o resultado
            clean_result = result.replace('```json', '').replace('```', '').strip()
            try:
                lesson = json.loads(clean_result)
            except json.JSONDecodeError as e:
                return jsonify({'success': False, 'error': f'JSON invalido: {str(e)}', 'raw': result[:500]}), 500

        return jsonify({
            'success': True,
            'lesson': lesson
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/')
def index():
    """Serve o frontend"""
    return send_file('index.html')


if __name__ == '__main__':
    print("Servidor rodando em http://localhost:5000")
    app.run(port=5000, debug=True)
