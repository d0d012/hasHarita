#!/usr/bin/env python3
"""
Test data generator for HasHarita backend
Backend'e test verisi gönderir
"""

import requests
import json
import time
import random
from datetime import datetime, timezone

# Backend URL
BASE_URL = "http://localhost:8000"

# Test şehirleri
CITIES = [
    "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", 
    "Gaziantep", "Mersin", "Diyarbakır", "Kayseri", "Eskişehir", "Urfa", 
    "Malatya", "Erzurum", "Van", "Batman", "Elazığ", "Isparta", "Trabzon",
    "Ordu", "Samsun", "Kahramanmaraş", "Sakarya", "Aydın", "Muğla", "Denizli"
]

# Test topic'leri
TOPICS = [
    "gürültü", "hava kirliliği", "su kalitesi", "trafik", "enerji", 
    "atık yönetimi", "yeşil alan", "ulaşım", "güvenlik", "sağlık",
    "eğitim", "konut", "altyapı", "çevre", "ekonomi"
]

# Test sentiment'ları
SENTIMENTS = ["positive", "neutral", "negative"]

def generate_test_data():
    """Test verisi oluşturur"""
    test_data = []
    
    for i in range(50):  # 50 test kaydı
        city = random.choice(CITIES)
        topic = random.choice(TOPICS)
        sentiment = random.choice(SENTIMENTS)
        
        # Random timestamp (son 7 gün içinde)
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Test kaydı oluştur
        record = {
            "id": f"test_{i}_{int(time.time())}",
            "text": f"{city} şehrinde {topic} konusunda test verisi. Sentiment: {sentiment}",
            "city": city,
            "district": None,
            "timestamp": timestamp,
            "lang": "tr"
        }
        
        test_data.append(record)
    
    return test_data

def send_to_backend(data):
    """Veriyi backend'e gönderir"""
    try:
        # Sentiment analizi için batch request
        sentiment_items = []
        for record in data:
            sentiment_items.append({
                "id": record["id"],
                "text": record["text"],
                "lang": record.get("lang", "tr"),
                "timestamp": record["timestamp"]
            })
        
        # Sentiment analizi yap
        print(f"📤 {len(sentiment_items)} kayıt için sentiment analizi yapılıyor...")
        sentiment_response = requests.post(
            f"{BASE_URL}/predict/sentiment",
            json={"items": sentiment_items},
            headers={"Content-Type": "application/json"}
        )
        
        if sentiment_response.status_code == 200:
            print("✅ Sentiment analizi başarılı")
            sentiment_results = sentiment_response.json()["items"]
            
            # Topic classification için batch request
            topic_items = []
            for record in data:
                topic_items.append({
                    "id": record["id"],
                    "text": record["text"],
                    "lang": record.get("lang", "tr")
                })
            
            print(f"📤 {len(topic_items)} kayıt için topic classification yapılıyor...")
            topic_response = requests.post(
                f"{BASE_URL}/predict/topics",
                json={"items": topic_items},
                headers={"Content-Type": "application/json"}
            )
            
            if topic_response.status_code == 200:
                print("✅ Topic classification başarılı")
                topic_results = topic_response.json()["items"]
                
                # Sonuçları birleştir
                enriched_data = []
                for i, record in enumerate(data):
                    enriched_record = {
                        **record,
                        "sentiment": sentiment_results[i]["sentiment"],
                        "topics": topic_results[i]["topics"]
                    }
                    enriched_data.append(enriched_record)
                
                print(f"✅ {len(enriched_data)} kayıt başarıyla işlendi")
                return enriched_data
            else:
                print(f"❌ Topic classification hatası: {topic_response.status_code}")
                print(topic_response.text)
        else:
            print(f"❌ Sentiment analizi hatası: {sentiment_response.status_code}")
            print(sentiment_response.text)
            
    except Exception as e:
        print(f"❌ Backend'e veri gönderilirken hata: {e}")
    
    return None

def check_aggregated_data():
    """Aggregated data'yı kontrol eder"""
    try:
        response = requests.get(f"{BASE_URL}/map/aggregates?level=city&window=15m")
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Aggregated data: {len(data['items'])} item")
            for item in data['items'][:5]:  # İlk 5 item'ı göster
                print(f"  - {item['city']}: {item['topic']} ({item['count']} adet)")
        else:
            print(f"❌ Aggregated data alınamadı: {response.status_code}")
    except Exception as e:
        print(f"❌ Aggregated data kontrol hatası: {e}")

def main():
    print("🚀 HasHarita Test Data Generator")
    print("=" * 50)
    
    # Backend sağlık kontrolü
    try:
        health_response = requests.get(f"{BASE_URL}/healthz")
        if health_response.status_code == 200:
            print("✅ Backend çalışıyor")
        else:
            print("❌ Backend sağlık kontrolü başarısız")
            return
    except Exception as e:
        print(f"❌ Backend'e bağlanılamadı: {e}")
        return
    
    # Test verisi oluştur
    print("\n📝 Test verisi oluşturuluyor...")
    test_data = generate_test_data()
    print(f"✅ {len(test_data)} test kaydı oluşturuldu")
    
    # Backend'e gönder
    print("\n📤 Backend'e veri gönderiliyor...")
    enriched_data = send_to_backend(test_data)
    
    if enriched_data:
        print("\n⏳ Backend'in veriyi işlemesi için 5 saniye bekleniyor...")
        time.sleep(5)
        
        # Aggregated data'yı kontrol et
        print("\n📊 Aggregated data kontrol ediliyor...")
        check_aggregated_data()
    
    print("\n🎉 Test tamamlandı!")

if __name__ == "__main__":
    main()
