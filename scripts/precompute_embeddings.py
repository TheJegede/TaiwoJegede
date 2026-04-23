"""
Run once after filling in knowledge/*.md files:
    1. Create scripts/.env with: GEMINI_API_KEY=your_key_here
    2. pip install requests python-dotenv
    3. python scripts/precompute_embeddings.py

Outputs: worker/embeddings.json
Re-run whenever knowledge files change, then redeploy the Worker.
"""

import os
import json
import time
from pathlib import Path

import requests
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / '.env')

KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), '..', 'knowledge')
OUTPUT_FILE   = os.path.join(os.path.dirname(__file__), '..', 'worker', 'embeddings.json')
EMBED_MODEL   = 'models/gemini-embedding-001'
EMBED_URL     = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent'
MAX_WORDS     = 120
OVERLAP       = 20


def chunk_markdown(text, source, max_words=MAX_WORDS, overlap=OVERLAP):
    """
    Paragraph-aware chunking:
    1. Split on double newlines (natural markdown boundaries).
    2. For paragraphs exceeding max_words, slide a window with overlap
       to avoid losing context at chunk edges.
    """
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    chunks = []

    for para in paragraphs:
        words = para.split()
        if len(words) <= max_words:
            chunks.append({'text': para, 'source': source})
        else:
            start = 0
            while start < len(words):
                end = min(start + max_words, len(words))
                chunks.append({'text': ' '.join(words[start:end]), 'source': source})
                if end == len(words):
                    break
                start += (max_words - overlap)

    return chunks


def embed_one(text, api_key):
    payload = {
        'model': EMBED_MODEL,
        'content': {'parts': [{'text': text}]},
        'taskType': 'RETRIEVAL_DOCUMENT',
    }
    res = requests.post(EMBED_URL, params={'key': api_key}, json=payload)
    if not res.ok:
        raise RuntimeError(f'Gemini embed failed: {res.status_code} {res.text}')
    return res.json()['embedding']['values']


def main():
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise SystemExit('Error: GEMINI_API_KEY environment variable not set.')

    doc_files = ['resume.md', 'extended_profile.md', 'projects_detail.md', 'faq.md']
    all_chunks = []

    for fname in doc_files:
        path = os.path.join(KNOWLEDGE_DIR, fname)
        if not os.path.exists(path):
            print(f'  Skipping {fname} (not found)')
            continue
        with open(path, 'r', encoding='utf-8') as f:
            text = f.read()
        chunks = chunk_markdown(text, fname)
        all_chunks.extend(chunks)
        print(f'  {fname}: {len(chunks)} chunks')

    print(f'\nTotal chunks: {len(all_chunks)}')
    print('Embedding via Gemini text-embedding-004...')

    texts = [c['text'] for c in all_chunks]

    for i, text in enumerate(texts):
        raw = embed_one(text, api_key)
        all_chunks[i]['embedding'] = [round(v, 5) for v in raw]
        print(f'\r  Embedded {i + 1}/{len(texts)} chunks', end='', flush=True)
        if (i + 1) % 10 == 0:
            time.sleep(0.5)  # gentle rate limiting every 10 calls
    print()

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_chunks, f, separators=(',', ':'))  # compact JSON

    size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f'\nDone. Wrote {len(all_chunks)} chunks to worker/embeddings.json ({size_kb:.1f} KB)')
    print('Next: wrangler deploy')


if __name__ == '__main__':
    main()
