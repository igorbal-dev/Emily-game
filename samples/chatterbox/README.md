# Пробы Chatterbox

Устройство: `cpu`, seed: 42

| Файл | Модель | Язык | Пресет | Голос | Параметры | Текст | Длит. | Генерация |
|---|---|---|---|---|---|---|---|---|
| [en_greeting__neutral__default.wav](en_greeting__neutral__default.wav) | tts | en | neutral | default | exaggeration=0.3, cfg_weight=0.5 | Hi, I'm Emily. I didn't expect anyone to find this place... but I'm glad you did. | 4.52s | 48.9s |
| [en_greeting__default__default.wav](en_greeting__default__default.wav) | tts | en | default | default | exaggeration=0.5, cfg_weight=0.5 | Hi, I'm Emily. I didn't expect anyone to find this place... but I'm glad you did. | 3.72s | 33.9s |
| [en_greeting__dramatic__default.wav](en_greeting__dramatic__default.wav) | tts | en | dramatic | default | exaggeration=0.8, cfg_weight=0.3 | Hi, I'm Emily. I didn't expect anyone to find this place... but I'm glad you did. | 4.04s | 36.7s |
| [en_fear__default__default.wav](en_fear__default__default.wav) | tts | en | default | default | exaggeration=0.5, cfg_weight=0.5 | Wait. Did you hear that? Something is moving behind the door. Please, don't open it! | 4.52s | 40.4s |
| [en_fear__dramatic__default.wav](en_fear__dramatic__default.wav) | tts | en | dramatic | default | exaggeration=0.8, cfg_weight=0.3 | Wait. Did you hear that? Something is moving behind the door. Please, don't open it! | 4.44s | 39.5s |
| [en_joy__default__default.wav](en_joy__default__default.wav) | tts | en | default | default | exaggeration=0.5, cfg_weight=0.5 | We did it! I can't believe we actually did it! Come on, let's see what's inside! | 4.16s | 37.4s |
| [en_joy__dramatic__default.wav](en_joy__dramatic__default.wav) | tts | en | dramatic | default | exaggeration=0.8, cfg_weight=0.3 | We did it! I can't believe we actually did it! Come on, let's see what's inside! | 3.6s | 33.6s |
| - | mtl | | | | | ОШИБКА: load failed: Attempting to deserialize object on a CUDA device but torch.cuda.is_available() is False. If you are running on a CPU-only machine, please use torch.load with map_location=torch.device('cpu') to map your storages to the CPU. | | |
| [turbo_greeting__default__default.wav](turbo_greeting__default__default.wav) | turbo | en | default | default | temperature=0.8 | Hi, I'm Emily. [chuckle] I didn't expect anyone to find this place... but I'm glad you did. | 6.12s | 16.7s |
| [turbo_tired__default__default.wav](turbo_tired__default__default.wav) | turbo | en | default | default | temperature=0.8 | [sigh] Another locked door. Okay, okay... [laugh] at least this time we have the key. | 6.4s | 17.3s |
