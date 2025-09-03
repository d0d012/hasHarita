"""
sürdürülebilir şehirler hackathonu

orbit

tuğrap efe dikpınar
ahmet mert tezcan

şimşek scraper :q
"""

import asyncio
import websockets
import json
import logging
import time
from datetime import datetime
from typing import Dict, Any, Optional
import base64
import zlib

# Logging ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('lightning_data.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class LightningDataScraper:
    def __init__(self, websocket_url: str = "wss://ws1.blitzortung.org/"):
        self.websocket_url = websocket_url
        self.websocket = None
        self.running = False
        self.strike_count = 0
        self.turkey_strike_count = 0
        
    def decode_message(self, data: str) -> str:
        try:
            # decode
            dictionary = {}
            result = []
            
            
            current = data[0]
            result.append(current)
            
            
            for i in range(256):
                dictionary[i] = chr(i)
            
            next_code = 256
            
            # LZW decode
            for i in range(1, len(data)):
                char_code = ord(data[i])
                
                if char_code < 256:
                   
                    entry = data[i]
                elif char_code in dictionary:
                    
                    entry = dictionary[char_code]
                else:
                    
                    entry = current + current[0]
                
                result.append(entry)
                
                
                if len(current) > 0:
                    dictionary[next_code] = current + entry[0]
                    next_code += 1
                
                current = entry
            
            return ''.join(result)
            
        except Exception as e:
            logger.error(f"mesaj decode edilemedi: {e}")
            return data
    
    def parse_strike_data(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        şimşek hazır mısın? 
        """
        try:
            
            required_fields = ['delay', 'time', 'lat', 'lon']
            if not all(field in data for field in required_fields):
                return None
            
           
            lat = data['lat']
            lon = data['lon']
            
            if 'latc' in data:
                lat += data['latc']
            if 'lonc' in data:
                lon += data['lonc']
            
            # şimşek verisi oluştur
            strike = {
                'timestamp': datetime.now().isoformat(),
                'strike_time': data.get('time', 0),
                'latitude': lat,
                'longitude': lon,
                'delay': data.get('delay', 0),
                'mds': data.get('mds', 0), 
                'status': data.get('status', 0),
                'detectors': []
            }
            
         
            if 'sig' in data:
                for detector in data['sig']:
                    strike['detectors'].append({
                        'lat': detector.get('lat', 0),
                        'lon': detector.get('lon', 0),
                        'status': detector.get('status', 0)
                    })
            
            return strike
            
        except Exception as e:
            logger.error(f"şimşek verisi parse edilemedi: {e}")
            return None
    
    def save_strike_data(self, strike_data: Dict[str, Any], filename: str = "lightning_strikes.jsonl"):
        """
        şimşek verilerini JSONL formatında dosyaya kaydeder
        """
        try:
            with open(filename, 'a', encoding='utf-8') as f:
                f.write(json.dumps(strike_data, ensure_ascii=False) + '\n')
        except Exception as e:
            logger.error(f"Veri kaydedilemedi: {e}")
    
    def is_in_turkey(self, lat: float, lon: float) -> bool:
        """
        şimşeğin Türkiye sınırları içinde olup olmadığını kontrol eder
        """
        turkey_bounds = {
            'north': 42.0,
            'south': 35.8,
            'east': 45.0,
            'west': 25.7
        }
        
        return (turkey_bounds['west'] <= lon <= turkey_bounds['east'] and
                turkey_bounds['south'] <= lat <= turkey_bounds['north'])
    
    async def connect_and_listen(self):
        """
        websocket'e bağlanır ve şimşek verilerini dinler
        """
        try:
            logger.info(f"websocket'e bağlanılıyor: {self.websocket_url}")
            
            async with websockets.connect(self.websocket_url) as websocket:
                self.websocket = websocket
                self.running = True
                
              
                import random
                mode = 'a'
                key = 111
                rnd = random.randint(50, 90)
                
                initial_message = {mode: key}
                await websocket.send(json.dumps(initial_message))
                logger.info("bağlantı kuruldu ve ilk mesaj gönderildi.")
                
                #
                async for message in websocket:
                    if not self.running:
                        break
                    
                    try:
                    
                        decoded_message = self.decode_message(message)
                        data = json.loads(decoded_message)
                        
                   
                        if self.is_strike_data(data):
                            strike_data = self.parse_strike_data(data)
                            if strike_data:
                                self.strike_count += 1
                                
                               
                                self.save_strike_data(strike_data)
                                
                                # türkiye'deki şimşekleri özel olarak logla ve ayrı dosyaya kaydet
                                if self.is_in_turkey(strike_data['latitude'], strike_data['longitude']):
                                    self.turkey_strike_count += 1
                                    logger.info(f"🇹🇷🇹🇷🇹🇷🇹🇷🇹🇷🇹🇷🇹🇷🇹🇷🇹🇷🇹🇷🇹🇷🇹🇷🇹🇷🇹🇷 TÜRKİYE'DE ŞİMŞEK! #{self.turkey_strike_count} - "
                                              f"lat: {strike_data['latitude']:.4f}, "
                                              f"lon: {strike_data['longitude']:.4f}, "
                                              f"gecikme: {strike_data['delay']}s")
                                 
                                    self.save_strike_data(strike_data, "turkey_lightning_strikes.jsonl")
                                
                                # her 100 şimşekte bir özet
                                if self.strike_count % 100 == 0:
                                    logger.info(f"toplam {self.strike_count} şimşek verisi toplandı")
                        
                        
                        if 'timeout' in data:
                            logger.warning("websocket timeout - yeniden bağlanılıyor...")
                            break
                            
                    except json.JSONDecodeError as e:
                        logger.error(f"JSON parse hatası: {e}")
                    except Exception as e:
                        logger.error(f"mesaj işleme hatası: {e}")
                        
        except websockets.exceptions.ConnectionClosed:
            logger.warning("websocket bağlantısı kapandı")
        except Exception as e:
            logger.error(f"websocket bağlantı hatası: {e}")
        finally:
            self.running = False
            self.websocket = None
    
    def is_strike_data(self, data: Dict[str, Any]) -> bool:
        """
        gelen verinin şimşek verisi olup olmadığını kontrol eder
        """
        required_fields = ['delay', 'time', 'lat', 'lon']
        return all(field in data for field in required_fields)
    
    async def start(self):
        """
        scraper'ı başlatır
        """
        logger.info("şimşek verisi toplama başlatılıyor...")
        
        while True:
            try:
                await self.connect_and_listen()
                
                if self.running:
                    logger.info("5 saniye bekleyip yeniden bağlanılıyor...")
                    await asyncio.sleep(5)
                else:
                    break
                    
            except KeyboardInterrupt:
                logger.info("kullanıcı tarafından durduruldu")
                break
            except Exception as e:
                logger.error(f"beklenmeyen hata: {e}")
                await asyncio.sleep(10)
        
        logger.info(f"toplam {self.strike_count} şimşek verisi toplandı (türkiye: {self.turkey_strike_count})")
    
    def stop(self):
        """
        scraper'ı durdurur
        """
        self.running = False
        if self.websocket:
            asyncio.create_task(self.websocket.close())

async def main():
    """
    ana fonksiyon
    """
    scraper = LightningDataScraper()
    
    try:
        await scraper.start()
    except KeyboardInterrupt:   
        logger.info("program sonlandırılıyor...")
        scraper.stop()

if __name__ == "__main__":
    print("lightning data scraper")
    print("=" * 50)
    print("websocket: wss://ws1.blitzortung.org/")
    print("veriler lightning_strikes.jsonl dosyasına kaydedilecek")
    print("türkiye'deki şimşekler özel olarak loglanacak")
    print("=" * 50)
    
    asyncio.run(main())
