"""
Topic Classification Service for HasHarita
Multi-label classification using zero-shot learning
"""

from typing import List, Dict, Optional
import torch
from transformers import pipeline
import logging

logger = logging.getLogger(__name__)

class TopicClassificationService:
    """Zero-shot topic classification service for Turkish texts"""
    
    # Domain-specific topic labels
    TOPIC_LABELS = [
        "altyapı",
        "trafik", 
        "yağış",
        "sel",
        "yardım",
        "elektrik kesintisi",
        "su kesintisi",
        "çevre kirliliği",
        "atık/çöp",
        "gürültü",
        "enerji",
        "yeşil alan",
        "ulaşım",
        "barınma",
        "sağlık",
        "eğitim",
        "yangın",
        "deprem",
        "kamusal alan",
        "sosyal yardım"
    ]
    
    # Post-processing parameters
    TOP_K = 3
    MIN_SCORE = 0.30
    
    # Model configuration - daha basit model kullan
    MODEL_NAME = "facebook/bart-large-mnli"
    HYPOTHESIS_TEMPLATE = "Bu metin {} hakkında."
    MAX_LENGTH = 256
    MAX_BATCH = 32  # Adjust based on CPU memory
    
    def __init__(self):
        """Initialize service (lazy loading)"""
        self._classifier = None
        logger.info("TopicClassificationService initialized (lazy loading)")
    
    @property
    def classifier(self):
        if self._classifier is None: #lazy load
            logger.info(f"Loading topic model: {self.MODEL_NAME}")
            from transformers import AutoTokenizer, AutoModelForSequenceClassification
            
            # load tokenizer and model separately to avoid issues
            tokenizer = AutoTokenizer.from_pretrained(
                self.MODEL_NAME,
                use_fast=False  # tokenizer sorunlarını önlemek için yavaş zorlayıcıyı kullan
            )
            model = AutoModelForSequenceClassification.from_pretrained(self.MODEL_NAME)
            
            self._classifier = pipeline(
                "zero-shot-classification",
                model=model,
                tokenizer=tokenizer,
                device=-1,  # CPU
                max_length=self.MAX_LENGTH,
                truncation=True
            )
            logger.info("Topic model loaded successfully")
        return self._classifier
    
    def classify_batch(self, texts: List[str]) -> List[List[Dict[str, float]]]:
        if not texts:
            return []
        
        results = []
        for i in range(0, len(texts), self.MAX_BATCH):
            batch = texts[i:i + self.MAX_BATCH]
            batch_results = self._process_batch(batch)
            results.extend(batch_results)
        
        return results
    
    def _process_batch(self, texts: List[str]) -> List[List[Dict[str, float]]]:
        """Process a single batch of texts"""
        try:
            # Run zero-shot classification
            outputs = self.classifier(
                texts,
                candidate_labels=self.TOPIC_LABELS,
                hypothesis_template=self.HYPOTHESIS_TEMPLATE,
                multi_label=True
            )
            
            if not isinstance(outputs, list):
                outputs = [outputs]
            
            batch_results = []
            for output in outputs:
                topics = self._process_single_output(output)
                batch_results.append(topics)
            
            return batch_results
            
        except Exception as e:
            logger.error(f"Error in topic classification: {e}")
            return [[] for _ in texts]
    
    def _process_single_output(self, output: Dict) -> List[Dict[str, float]]:
        topics = []
        
        labels = output.get('labels', [])
        scores = output.get('scores', [])
        
        for label, score in zip(labels, scores):
            if score >= self.MIN_SCORE:
                topics.append({
                    'label': label,
                    'score': round(float(score), 3)
                })
        
        topics = topics[:self.TOP_K]
        
        return topics
    
    def classify_single(self, text: str) -> List[Dict[str, float]]:
        results = self.classify_batch([text])
        return results[0] if results else []


# Singleton instance
_service_instance = None

def get_topic_service() -> TopicClassificationService:
    global _service_instance
    if _service_instance is None:
        _service_instance = TopicClassificationService()
    return _service_instance