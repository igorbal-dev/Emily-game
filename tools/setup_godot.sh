#!/bin/sh
# Ставит Godot 4.3 и web-шаблоны экспорта в облачный контейнер (≈60 МБ, не 1 ГБ: из архива шаблонов берутся только web-файлы).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
mkdir -p /opt/godot && cd /opt/godot
[ -x Godot_v4.3-stable_linux.x86_64 ] || { curl -sSL -o g.zip https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_linux.x86_64.zip && unzip -qo g.zip; }
T=~/.local/share/godot/export_templates/4.3.stable
if [ ! -f $T/web_nothreads_release.zip ]; then
  python3 "$HERE/get_web_templates.py" https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_export_templates.tpz /tmp/tpl
  mkdir -p $T && cp /tmp/tpl/templates/* $T/
fi
pip install -q scipy opencv-python-headless 2>/dev/null || true
echo "GODOT=/opt/godot/Godot_v4.3-stable_linux.x86_64"
