# HW Vault — Hot Wheels Collector Portfolio App

> Cursor / AI agent için hazırlanmış proje paketi. Kodlamaya başlamadan önce tüm belgeleri sırayla oku.

---

## Bu Klasördeki Belgeler

| Dosya | Ne İçin |
|---|---|
| `AGENT_PROMPT.md` | **Buradan başla.** Cursor'a verilecek ana prompt. Tech stack, proje yapısı, adım adım implementasyon. |
| `REQUIREMENTS.md` | Gereksinim belgesi. DB şeması, API endpoint listesi, tüm feature detayları. |
| `DATA_SOURCES.md` | Hot Wheels verisini nereden al, nasıl import et, hangi GitHub repolarını kullan. |
| `COMMERCIAL_ROADMAP.md` | v1 sonrası ticari büyüme planı. Monetizasyon fikirleri. Mimari kararlar için referans. |

---

## Kullanım

1. `AGENT_PROMPT.md` dosyasını Cursor'a ver (tüm içeriğiyle)
2. Agent'a "Bu klasördeki diğer belgeleri de oku" de
3. Agent otomatik olarak `REQUIREMENTS.md`, `DATA_SOURCES.md` ve `COMMERCIAL_ROADMAP.md` dosyalarına başvuracak
4. `docker-compose up` ile çalışır hale gelmeli

---

## Veri Kaynağı

Ana seed verisi: **https://github.com/pvwnthem/Hotwheels-Data**
- 1974–2023 arası neredeyse tüm Hot Wheels arabaları
- JSON formatı, direkt import edilebilir
- Ayrıntılar: `DATA_SOURCES.md`

---

## Proje Adı

**HW Vault** — değiştirebilirsin, agent'a söyle.

---

## Araştırma Notları

Araştırma sırasında tespit edilen en iyi kaynaklar:

- [pvwnthem/Hotwheels-Data](https://github.com/pvwnthem/Hotwheels-Data) — 1974–2023 JSON dataset
- [joedots1/fast_wheels](https://github.com/joedots1/fast_wheels) — FastAPI + MongoDB referans implementasyonu
- [Hot Wheels Fandom Wiki](https://hotwheels.fandom.com/wiki/Hot_Wheels) — Scraping için ana kaynak
- [collecthw.com](https://collecthw.com) — TH/STH doğrulama için
- [Mattel Official Showcase](https://creations.mattel.com/pages/hot-wheels-showcase) — Resmi referans
