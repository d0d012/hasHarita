"""
sürdürülebilir şehirler hackathonu

orbit

tuğrap efe dikpınar
ahmet mert tezcan

tweet scraper :p
"""


#zaman aralıkları bir algortimaya oturtullmalı

#komutanım beni soğuk değil sizin mont sözünüz öldürdü

import time
import json
import random
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from fake_useragent import UserAgent
import re
import os
from dotenv import load_dotenv


# istanbul ankara izmir ikçe olarak eklenebilir ya da büyük ilçeler konya ereğli falan
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


_sorted_cities = sorted(SEHIRLER, key=len, reverse=True)
_city_pattern = re.compile(r"\b(" + "|".join(map(re.escape, _sorted_cities)) + r")(?:'?[dDbB][ea]|'?[dDtT][an]|'?[yY][ae])?\b", re.IGNORECASE)


def detect_city_from_text(text: str) -> str | None:

    if not text:
        return None
    # Basit normalize
    candidate = text.strip()
    m = _city_pattern.search(candidate)
    if m:
        # Orijinal şehir adını büyük/küçük/aksan açısından normalize et
        found = m.group(1)
        # Listeden tam eşleşen standard biçimi döndür
        for c in SEHIRLER:
            if c.lower() == found.lower():
                return c
        return found
    return None


class SeleniumTwitterScraper:
    def __init__(self, headless=True):
        """
        selenium twitter scraper 
        """
       
        self.headless = headless
        self.driver = None
        self.wait = None
        self.is_logged_in = False
        
        # manuel twitter girişi yapılıyor
        
      
        self.disaster_keywords = [
            'deprem', 'sel', 'yangın', 'heyelan', 'çığ' #ekleme yapılabilir
    
        ]
        
        # Afet hashtag'leri
        self.disaster_hashtags = [
            '#deprem', '#yangın', '#afet',

        ]
        
        
        self.tweets = []
        self.is_running = False
        
      
        
    def setup_driver(self):
        """chrome driver'ı kurar """
        try:
            
            options = Options()
            if self.headless:
                options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-blink-features=AutomationControlled')
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            
            
            ua = UserAgent()
            options.add_argument(f'--user-agent={ua.random}')
            
            # driver kur
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            self.wait = WebDriverWait(self.driver, 10)
            print("*** chrome driver başarıyla kuruldu")
            return True
            
        except Exception as e:
            print(f":(((((( driver kurulum hatası: {e}")
            return False
    
    def login_to_twitter(self):
        """twitter'a manuel giriş"""
        if not self.driver:
            if not self.setup_driver():
                return False
        
        try:
            print("--- twitter giriş sayfası açılıyor...")
            print("+++ giriş yaptıktan sonra bu terminal'e dönün ve enter'a basın")
            
            # Twitter giriş sayfasına git
            self.driver.get("https://twitter.com/login")
            
            # Manuel giriş için bekle
            input("+++ giriş yaptıktan sonra enter'a bas")
            
            # Giriş başarılı mı kontrol et
            print("--- giriş durumu kontrol ediliyor")
            
            # Ana sayfaya git
            self.driver.get("https://twitter.com/home")
            time.sleep(3)
            
            if "home" in self.driver.current_url:
                print("--- twitter'a başarıyla giriş yapıldı!")
                self.is_logged_in = True
                return True
            else:
                print("--- giriş durumu belirsiz, devam ediliyor")
                self.is_logged_in = True  # Manuel giriş yapıldığı varsayılıyor
                return True
                    
        except Exception as e:
            print(f"--- giriş hatası: {e}")
            return False
    
    def search_twitter(self, query, max_tweets=50, scroll_count=5):
        """
        twitter'da arama yapar
        
        Args:
            query (str): arama sorgusu
            max_tweets (int): maksimum tweet sayısı
            scroll_count (int): sayfa kaydırma sayısı
        """
        if not self.driver:
            if not self.setup_driver():
                return []
        
    
        if not self.is_logged_in:
            if not self.login_to_twitter():
                print("--- twitter'a giriş yapılamadı!")
                return []
        
        try:
            search_url = f"https://twitter.com/search?q={query}&src=typed_query&f=live"
            print(f"--- twitter'da aranıyor: {query}")
            print(f"--- url: {search_url}")
            
            self.driver.get(search_url)
            time.sleep(5) 
            
            # tweet'leri topla
            tweets = []
            last_height = self.driver.execute_script("return document.body.scrollHeight")
            
            for scroll in range(scroll_count):
                print(f"--- sayfa {scroll + 1}/{scroll_count} kaydırılıyor")
                
                
                tweet_selectors = [
                    '[data-testid="tweet"]',
                    'article[data-testid="tweet"]',
                    'div[data-testid="tweetText"]',
                    'div[lang]'
                ]
                
                tweet_elements = []
                for selector in tweet_selectors:
                    try:
                        elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                        if elements:
                            tweet_elements = elements
                            print(f"✅ Tweet selector bulundu: {selector}")
                            break
                    except:
                        continue
                
                if not tweet_elements:
                    print("⚠️ Tweet elementleri bulunamadı, sayfa yapısı kontrol ediliyor...")
                    page_source = self.driver.page_source
                    if "tweet" in page_source.lower():
                        print("📄 Sayfada tweet içeriği var ama selector bulunamadı")
                    else:
                        print("📄 Sayfa boş görünüyor")
                
                for tweet_element in tweet_elements:
                    if len(tweets) >= max_tweets:
                        break
                    
                    try:
                        tweet_data = self._extract_tweet_data(tweet_element, query)
                        if tweet_data and tweet_data not in tweets:
                            tweets.append(tweet_data)
                            print(f"📝 Tweet çekildi: {tweet_data['text'][:50]}...")
                    except Exception as e:
                        print(f"⚠️ Tweet çıkarma hatası: {e}")
                        continue
                
                # sayfayı aşağı kaydır
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(2)
                
                # yeni içerik yüklendi mi kontrol et
                new_height = self.driver.execute_script("return document.body.scrollHeight")
                if new_height == last_height:
                    print("--- sayfa sonuna ulaşıldı")
                    break
                last_height = new_height
                
                # rate limiting için bekle
                time.sleep(random.uniform(2, 4))
            
            print(f"--- toplam {len(tweets)} tweet çekildi")
            return tweets
            
        except Exception as e:
            print(f"--- arama hatası: {e}")
            return []
    
    def _extract_tweet_data(self, tweet_element, search_query):
        """tweet elementinden veri çıkarır"""
        try:
            # farklı tweet metni selector'larını dene
            text_selectors = [
                '[data-testid="tweetText"]',
                'div[lang]',
                'div[dir="ltr"]',
                'span'
            ]
            
            text = ""
            for selector in text_selectors:
                try:
                    text_element = tweet_element.find_element(By.CSS_SELECTOR, selector)
                    if text_element and text_element.text.strip():
                        text = text_element.text.strip()
                        break
                except:
                    continue
            
            # kullanıcı adı ve profil URL'si
            username = "unknown"
            profile_url = None
            try:
                # Kullanıcı adı genelde kartta ilk linklerden biri, /status/ içermeyen kullanıcı profiline gider
                links = tweet_element.find_elements(By.CSS_SELECTOR, 'a[role="link"]')
                for a in links:
                    href = a.get_attribute('href')
                    if href and re.match(r'^https?://(www\.)?twitter\.com/[^/]+/?$', href):
                        profile_url = href
                        # Link text'lerinden kullanıcı adını almayı dene
                        if a.text and a.text.strip():
                            username = a.text.strip()
                        break
            except:
                pass
            
            # tweet zamanı (adventure time reference
            time_element = None
            try:
                time_element = tweet_element.find_element(By.CSS_SELECTOR, 'time')
            except:
                pass
            tweet_time = time_element.get_attribute('datetime') if time_element else datetime.now().isoformat()
            
            # Tweet ID (URL'den çıkar)
            tweet_id = None
            try:
                tweet_link = tweet_element.find_element(By.CSS_SELECTOR, 'a[href*="/status/"]')
                href = tweet_link.get_attribute('href')
                if href:
                    tweet_id = href.split('/')[-1]
            except:
                pass
            
            # tweet'e ekli yer
            tweet_place = None
            try:
                place_link = tweet_element.find_element(By.CSS_SELECTOR, 'a[href^="/place/"]')
                if place_link and place_link.text.strip():
                    tweet_place = place_link.text.strip()
            except:
                try:
                    place_span = tweet_element.find_element(By.XPATH, ".//span[contains(@aria-label, 'Konum') or contains(@aria-label, 'Location')]")
                    if place_span and place_span.text.strip():
                        tweet_place = place_span.text.strip()
                except:
                    pass
            
            # afet ile ilgili mi kontrol et
            is_disaster_related = self._is_disaster_related(text)
            
            # metinden şehir çıkarımı
            location = detect_city_from_text(text)
            
            tweet_data = {
                'id': tweet_id,
                'text': text,
                'username': username,
                'created_at': tweet_time,
                'search_query': search_query,
                'disaster_related': is_disaster_related,
                'location': location,
                'scraping_method': 'twitter_scraper',
                'scraping_timestamp': datetime.now() #isoformat() da olabilir
            }
            
            return tweet_data
            
        except Exception as e:
            print(f"--- tweet veri çıkarma hatası: {e}")
            return None
    
    def _is_disaster_related(self, text):
        """tweet metninin afet ile ilgili olup olmadığını kontrol eder"""
        if not text:
            return False
        
        text_lower = text.lower()
        
        # anahtar kelime kontrolü
        for keyword in self.disaster_keywords:
            if keyword in text_lower:
                return True
        
        # hashtag kontrolü
        for hashtag in self.disaster_hashtags:
            if hashtag.lower() in text_lower:
                return True
        
        # acil durum kelimeleri lazım olur belki
        emergency_words = ['acil', 'kaza', 'felaket', 'emergency', 'accident', 'disaster']
        for word in emergency_words:
            if word in text_lower:
                return True
        
        return False
    
    def live_monitoring_mode(self, keywords=None, interval_seconds=30, max_tweets_per_search=20):
        """
        canlı izleme modu - belirli aralıklarla arama yapar
        
        Args:
            keywords (list): izlenecek anahtar kelimeler
            interval_seconds (int): arama aralığı (saniye)
            max_tweets_per_search (int): her aramada çekilecek tweet sayısı
        """
        if not keywords:
            keywords = self.disaster_keywords[:5] 
        
        print(f"--- canlı izleme modu başlatılıyor!")
        print(f"--- izlenen anahtar kelimeler: {', '.join(keywords)}")
        print(f"--- arama aralığı: {interval_seconds} saniye")
        print(f"--- her aramada tweet: {max_tweets_per_search}")
        print("--" * 60)
        
        self.is_running = True
        search_count = 0
        total_tweets = 0
        disaster_tweets = 0
        
        try:
            while self.is_running:
                search_count += 1
                current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                
                print(f"\n🕐 {current_time} - Arama #{search_count}")
                
                # anahtar kelimeleri sırayla ara
                keyword_index = (search_count - 1) % len(keywords)
                keyword = keywords[keyword_index]
                
                try:
                    tweets = self.search_twitter(
                        query=keyword,
                        max_tweets=max_tweets_per_search,
                        scroll_count=3
                    )
                    
                    if tweets:
                        # yeni tweet'leri kaydet
                        self.tweets.extend(tweets)
                        total_tweets += len(tweets)
                        
                        # afet tweet'lerini kontrol et
                        new_disaster_tweets = [t for t in tweets if t.get('disaster_related', False)]
                        disaster_tweets += len(new_disaster_tweets)
                        
                        if new_disaster_tweets:
                            print(f"🚨 {len(new_disaster_tweets)} afet tweet'i tespit edildi!")
                            for tweet in new_disaster_tweets[:3]:
                                print(f"  🚨 @{tweet['username']}: {tweet['text'][:80]}...")
                            
                            # Acil durum bildirimi
                            self._save_emergency_tweets(new_disaster_tweets)
                        
                        # istatistikleri göster
                        print(f"--- özet: {total_tweets} tweet, {disaster_tweets} afet tweet")
                    
                    # batch kaydetme
                    if search_count % 5 == 0:
                        self._save_tweets_batch()
                    
                except Exception as e:
                    print(f"--- {keyword} aramasında hata: {e}")
                    continue
                
                print(f"--- {interval_seconds} saniye bekleniyor... (durdurmak için Ctrl+C)")
                time.sleep(interval_seconds)
                
        except KeyboardInterrupt:
            print(f"\n--- canlı izleme durduruldu!")
            print(f"--- toplam: {search_count} arama, {total_tweets} tweet, {disaster_tweets} afet tweet")
            self._save_tweets_batch()
        except Exception as e:
            print(f"--- canlı izleme hatası: {e}")
        finally:
            self.is_running = False
    
    def _save_emergency_tweets(self, emergency_tweets):
        """acil durum tweet'lerini ayrı dosyaya kaydeder lazım olur belki"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"emergency_tweets_{timestamp}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(emergency_tweets, f, ensure_ascii=False, indent=2, default=str)
            
            print(f"--- acil durum tweet'leri kaydedildi: {filename}")
            
        except Exception as e:
            print(f"--- acil durum kaydetme hatası: {e}")
    
    def _save_tweets_batch(self):
        """tweet batch'ini dosyaya kaydeder"""
        try:
            if not self.tweets:
                return
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"selenium_tweets_batch_{timestamp}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.tweets, f, ensure_ascii=False, indent=2, default=str)
            
            print(f"💾 {len(self.tweets)} tweet {filename} dosyasına kaydedildi")
            
            # belleği temizle
            self.tweets = []
            
        except Exception as e:
            print(f"--- batch kaydetme hatası: {e}")
    
    def search_disaster_tweets(self, keyword="deprem", count=50):
        """belirli bir afet anahtar kelimesi için tweet'leri arar"""
        return self.search_twitter(query=keyword, max_tweets=count)
    
    def search_multiple_keywords(self, keywords, tweets_per_keyword=20):
        """birden fazla anahtar kelime için arama yapar"""
        all_tweets = []
        
        for keyword in keywords:
            print(f"🔍 {keyword} aranıyor...")
            tweets = self.search_twitter(query=keyword, max_tweets=tweets_per_keyword)
            all_tweets.extend(tweets)
            
            # rate limiting için bekle
            time.sleep(random.uniform(2, 5))
        
        return all_tweets
    
    def close(self):
        """driver'ı kapatır"""
        if self.driver:
            self.driver.quit()
            print("--- driver kapatıldı")

def main():
    """ana fonksiyon"""
    print("--- selenium tabanlı twitter afet scraper")
    print("--" * 50)
    
    try:
        # scraper'ı başlat
        scraper = SeleniumTwitterScraper(headless=False)
        
        print("--- mod seçin:")
        print("1. tek arama")
        print("2. çoklu anahtar kelime arama")
        print("3. canlı izleme modu")
        print("4. twitter'a giriş yap")
        
        choice = input("\nseçiminiz (1-5): ").strip()
        
        if choice == "1":
            keyword = input("arama anahtar kelimesi (varsayılan: deprem): ").strip() or "deprem"
            count = input("tweet sayısı (varsayılan: 50): ").strip()
            count = int(count) if count.isdigit() else 50
            
            tweets = scraper.search_disaster_tweets(keyword, count)
            
        elif choice == "2":
            keywords_input = input("Anahtar kelimeler (virgülle ayırın): ").strip()
            keywords = [k.strip() for k in keywords_input.split(',')] if keywords_input else ['deprem', 'sel', 'yangın']
            tweets_per_keyword = input("Her anahtar kelime için tweet sayısı (varsayılan: 20): ").strip()
            tweets_per_keyword = int(tweets_per_keyword) if tweets_per_keyword.isdigit() else 20
            
            tweets = scraper.search_multiple_keywords(keywords, tweets_per_keyword)
            
        elif choice == "3":
            print("--- canlı izleme modu seçildi!")
            keywords_input = input("izlenecek anahtar kelimeler (virgülle ayırın, boş=varsayılan): ").strip()
            keywords = [k.strip() for k in keywords_input.split(',')] if keywords_input else None
            
            interval = input("arama aralığı (saniye, varsayılan: 30): ").strip()
            interval = int(interval) if interval.isdigit() else 30
            
            max_tweets = input("her aramada tweet sayısı (varsayılan: 20): ").strip()
            max_tweets = int(max_tweets) if max_tweets.isdigit() else 20
            
            scraper.live_monitoring_mode(keywords, interval, max_tweets)
            return
            
        elif choice == "4":
            print("--- twitter'a giriş yapılıyor...")
            if scraper.login_to_twitter():
                print("--- giriş başarılı! şimdi arama yapabilirsiniz.")
            else:
                print("--- giriş başarısız!")
            return
            
        else:
            print("--- geçersiz seçim, varsayılan olarak deprem araması yapılacak")
            tweets = scraper.search_disaster_tweets("deprem", 50)
        
        if tweets:
            # tweet'leri kaydet
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"selenium_tweets_{timestamp}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(tweets, f, ensure_ascii=False, indent=2, default=str)
            
            print(f"\n--- özet:")
            print(f"  • toplam tweet: {len(tweets)}")
            print(f"  • kayıt dosyası: {filename}") 
            
          
            disaster_count = sum(1 for tweet in tweets if tweet.get('disaster_related', False))
            print(f"  • afet ile ilgili tweet: {disaster_count}")
            
          
        
    except Exception as e:
        print(f"--- hata oluştu: {e}")
    finally:
        # driver'ı kapat
        if 'scraper' in locals():
            scraper.close()

if __name__ == "__main__":
    main()



