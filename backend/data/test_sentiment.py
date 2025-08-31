import os, json, sys
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

# ---- Ayarlar ----
# -> Lokal snapshot klasörün (senin çıktındaki hash: f6070864...)
MODEL_PATH = os.path.expanduser(
    "~/.cache/huggingface/hub/models--savasy--bert-base-turkish-sentiment-cased/snapshots/f6070864c69990a669bf9b8c659a0093062d73e8"
)
JSONL_PATH = "backend/data/sentiment_demo.jsonl"

# 2-class (pos/neg) -> 3-class (pos/neu/neg) dönüşümü için eşik politikası
LOW, HIGH = 0.45, 0.55  # istersen 0.40/0.60 yapıp oynayabilirsin

def to_three_classes(base, low=LOW, high=HIGH):
    """
    base: [{'label': 'positive'|'negative', 'score': float}]
    Dönen tuple: (label3, confidence)
    """
    lab = base[0]["label"].lower()
    score = float(base[0]["score"])
    p_pos = score if lab == "positive" else 1.0 - score
    if p_pos >= high:
        return ("positive", p_pos)
    if p_pos <= low:
        return ("negative", 1.0 - p_pos)
    # Neutral güveni için basit bir hesap:
    return ("neutral", 1.0 - abs(p_pos - 0.5) * 2)

def main():
    # Tamamen yerelden çalış (internet kontrolü yapma)
    os.environ["HF_HUB_OFFLINE"] = "1"

    if not os.path.exists(JSONL_PATH):
        print(f"❌ Bulunamadı: {JSONL_PATH}", file=sys.stderr)
        print("Örnek oluşturmak istersen aşağıdakileri kaydedebilirsin:")
        print('{"text": "Bu proje harika oldu!"}')
        print('{"text": "Çok kötü bir deneyimdi."}')
        print('{"text": "Fena değil, idare eder."}')
        sys.exit(1)

    print("Loading tokenizer/model from local snapshot (offline)...")
    tok = AutoTokenizer.from_pretrained(MODEL_PATH, local_files_only=True)
    mdl = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH, local_files_only=True)

    print("Building pipeline on CPU...")
    pipe = pipeline("sentiment-analysis", model=mdl, tokenizer=tok, device=-1, truncation=True)

    with open(JSONL_PATH, "r", encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            rec = json.loads(line)
            text = rec.get("text", "").strip()
            if not text:
                print(f"[{i}] ⚠️ Boş 'text' alanı, atlandı.")
                continue
            base = pipe(text)
            label3, conf = to_three_classes(base)
            print(f"[{i}] {text}\n    -> {label3} (score={conf:.2f}) | raw={base}")

if __name__ == "__main__":
    main()
