"""
Quick test with explicit tokenizer loading
"""
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification

# Load tokenizer and model separately
print("Loading tokenizer and model separately...")
model_name = "joeddav/xlm-roberta-large-xnli"

tokenizer = AutoTokenizer.from_pretrained(
    model_name,
    use_fast=False  # Force slow tokenizer to avoid issues
)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# Create pipeline with loaded components
classifier = pipeline(
    "zero-shot-classification",
    model=model,
    tokenizer=tokenizer,
    device=-1
)

# Test texts
texts = [
    "Kadıköy'de elektrik kesintisi var.",
    "Yoğun yağış nedeniyle trafik felç oldu."
]

labels = [
    "elektrik kesintisi",
    "su kesintisi", 
    "trafik",
    "yağış",
    "sel"
]

print("\nClassifying...")
results = classifier(
    texts,
    candidate_labels=labels,
    hypothesis_template="Bu metin {} hakkında.",
    multi_label=True
)

# Print results
if not isinstance(results, list):
    results = [results]

for i, result in enumerate(results):
    print(f"\nText {i+1}: {texts[i]}")
    print("Topics:")
    for label, score in zip(result['labels'][:3], result['scores'][:3]):
        print(f"  - {label}: {score:.3f}")