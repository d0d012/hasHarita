"""
sürdürülebilir şehirler hackathonu

orbit

tuğrap efe dikpınar
ahmet mert tezcan

reddit scraper :f
"""

#reddit scaper twitter'da tespit edilen trendleri, veri desteği sağlamak için kullanılabilir.

#r/depremanlik yanında şüpheli şehirlerin subredditleri hatta ve hatta yüksek trendlerde r/turkey, r/vlandiya, r/kgbtr scraper'ları da olabilir.

import requests
import json
import time
from datetime import datetime
import os
from typing import Dict, List, Optional

class RedditScraper:
    def __init__(self, subreddit: str, user_agent: str = "hasHarita-RedditScraper/1.0"):
        self.subreddit = subreddit
        self.base_url = f"https://www.reddit.com/r/{subreddit}/.json"
        self.headers = {
            'User-Agent': user_agent
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def fetch_latest_posts(self, limit: int = 25) -> Optional[Dict]:
        """
        reddit'ten en son postları çeker
        """
        try:
            params = {
                'limit': min(limit, 100),
                't': 'hour'  # son 1 saatteki postlar
            }
            
            response = self.session.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            print(f"reddit API'den veri çekilirken hata: {e}")
            return None
        except json.JSONDecodeError as e:
            print(f"json parse hatası: {e}")
            return None
    
    def parse_posts(self, data: Dict) -> List[Dict]:
        """
        reddit API response'unu düzenler
        """
        posts = []
        
        if not data or 'data' not in data or 'children' not in data['data']:
            return posts
        
        for post in data['data']['children']:
            post_data = post['data']
            
            # reddit post metnini birleştir (title + selftext)
            text = post_data.get('title', '')
            if post_data.get('selftext'):
                text += '\n\n' + post_data.get('selftext', '')
            
            # afet ile ilgili mi kontrol et
            is_disaster_related = self._is_disaster_related(text)
            
            # metinden şehir çıkarımı
            location = self._detect_city_from_text(text)
            
            parsed_post = {
                'id': post_data.get('id'),
                'text': text,
                'username': post_data.get('author'),
                'created_at': datetime.fromtimestamp(post_data.get('created_utc', 0)).isoformat(),
                'search_query': f"r/{self.subreddit}",
                'disaster_related': is_disaster_related,
                'location': location,
                'scraping_method': 'reddit_scraper',
                'scraping_timestamp': datetime.now().isoformat()
            }
            
            posts.append(parsed_post)
        
        return posts
    
    def save_to_file(self, posts: List[Dict], filename: str = None) -> str:

        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"reddit_posts_{self.subreddit}_{timestamp}.json"
        
        # data scrapers klasörüne kaydet
        filepath = os.path.join("data scrapers", filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump({
                'metadata': {
                    'subreddit': self.subreddit,
                    'scraped_at': datetime.now().isoformat(),
                    'total_posts': len(posts)
                },
                'posts': posts
            }, f, ensure_ascii=False, indent=2)
        
        return filepath
    
    def _is_disaster_related(self, text):
        """post metninin afet ile ilgili olup olmadığını kontrol eder"""
        if not text:
            return False
        
        text_lower = text.lower()
        
        disaster_keywords = [
            'deprem', 'earthquake', 'tremor', 'seismic',
            'afet', 'disaster', 'emergency', 'acil',
            'kaza', 'accident', 'felaket', 'catastrophe',
            'tsunami', 'volkan', 'volcano', 'yangın', 'fire',
            'sel', 'flood', 'heyelan', 'landslide', 'çığ', 'avalanche' #düzenleriz
        ]
        
        for keyword in disaster_keywords:
            if keyword in text_lower:
                return True
        
     
        disaster_hashtags = [
            '#deprem', '#earthquake', '#afet', '#disaster',
            '#acil', '#emergency', '#kaza', '#accident' #düzenleriz
        ]
        
        for hashtag in disaster_hashtags:
            if hashtag.lower() in text_lower:
                return True
        
        return False
    
    def _detect_city_from_text(self, text):
        """Metinden şehir adı çıkarımı yapar"""
        if not text:
            return None
        
        ## istanbul ankara izmir ikçe olarak eklenebilir ya da büyük ilçeler konya ereğli falan
        SEHIRLER = [
            'Adana','Adıyaman','Afyonkarahisar','Ağrı','Amasya','Ankara','Antalya','Artvin','Aydın','Balıkesir',
            'Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli',
            'Diyarbakır','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari',
            'Hatay','Isparta','Mersin','İstanbul','İzmir','Kars','Kastamonu','Kayseri','Kırklareli','Kırşehir',
            'Kocaeli','Konya','Kütahya','Malatya','Manisa','Kahramanmaraş','Mardin','Muğla','Muş','Nevşehir',
            'Niğde','Ordu','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Tekirdağ','Tokat',
            'Trabzon','Tunceli','Şanlıurfa','Uşak','Van','Yozgat','Zonguldak','Aksaray','Bayburt','Karaman',
            'Kırıkkale','Batman','Şırnak','Bartın','Ardahan','Iğdır','Yalova','Karabük','Kilis','Osmaniye',
            'Düzce'
        ]
        
        text_lower = text.lower()
        
        for city in SEHIRLER:
            if city in text_lower:
                return city.title()
        
        return None
    
    def live_monitor(self, interval: int = 60, max_iterations: int = None):
     
        print(f"--- reddit canlı izleme başlatıldı: r/{self.subreddit}")
        print(f"--- kontrol aralığı: {interval} saniye")
        print(f"--- maksimum iterasyon: {'Sınırsız' if max_iterations is None else max_iterations}")
        print("-" * 50)
        
        iteration = 0
        last_post_ids = set()
        
        try:
            while max_iterations is None or iteration < max_iterations:
                iteration += 1
                current_time = datetime.now().strftime("%H:%M:%S")
                
                print(f"\n[{current_time}] iterasyon {iteration}: veri çekiliyor...")
                
                # en son postları çek
                data = self.fetch_latest_posts(limit=25)
                if not data:
                    print("--- veri çekilemedi, tekrar deneniyor")
                    time.sleep(interval)
                    continue
                
                posts = self.parse_posts(data)
                current_post_ids = {post['id'] for post in posts}
                
              
                new_posts = [post for post in posts if post['id'] not in last_post_ids]
                
                if new_posts:
                    print(f"--- {len(new_posts)} yeni post bulundu!")
                    
                    # yeni postları göster
                    for post in new_posts[:5]:  # ilk 5 yeni postu göster
                        print(f"   {post['text'][:60]} -- u/{post['username']}")
                        print(f"      {post['location'] or 'bilinmiyor'} | afet: {'evet' if post['disaster_related'] else 'hayır'}")
                    
                    # dosyaya kaydet
                    filename = f"reddit_live_{self.subreddit}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                    filepath = self.save_to_file(posts, filename)
                    print(f"--- veriler kaydedildi: {filepath}")
                    
                    # post id'lerini güncelle
                    last_post_ids = current_post_ids
                else:
                    print("--- yeni post bulunamadı")
                
                print(f"--- {interval} saniye bekleniyor...")
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n\n--- canlı izleme kullanıcı tarafından durduruldu")
        except Exception as e:
            print(f"\n--- beklenmeyen hata: {e}")

def main():
    # deprem anlık subreddit'ini izle
    scraper = RedditScraper("depremanlik")
    
    print("--- reddit scraper başlatılıyor...")
    print(f"--- hedef: r/{scraper.subreddit}")
    print()
    
    # tek seferlik veri çekme
    print("--- ilk veri çekiliyor...")
    data = scraper.fetch_latest_posts(limit=50)
    
    if data:
        posts = scraper.parse_posts(data)
        print(f"--- {len(posts)} post başarıyla çekildi!")
  
        
       
        filepath = scraper.save_to_file(posts)
        print(f"--- veriler kaydedildi: {filepath}")
        
        # canlı izleme başlat
        print("\n" + "="*50)
        response = input("--- canlı izleme başlatılsın mı? (e/h): ").lower().strip()
        
        if response in ['e', 'evet', 'yes', 'y']:
            scraper.live_monitor(interval=60)  # 1 dakikada kontrol ediyor optimize edilebilir
        else:
            print("--- program sonlandırılıyor...")
    
    else:
        print("--- veri çekilemedi!")

if __name__ == "__main__":
    main()
