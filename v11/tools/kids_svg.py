#!/usr/bin/env python3
"""Рисует кодом новых детей — Софию (девочка 5 лет) и Леона (мальчик 5–6 лет, задира) — в том же стиле, что Изабель и Пауль
(svg 240×420, ноги, туфли, одежда, руки-линии, голова r60). Позы: idle blink talk wave jump laugh sad,
у Софии ещё dance, у Леона throw (кидает песок), mud (в грязи, смеётся), mudsad (в грязи, обижен), sly (хитрый), shy (смущённый).
Файлы — assets/img/<md5>.svg, ключи — в art/talk_img.json. Запуск: python3 tools/kids_svg.py"""
import hashlib, json, math, os

OUT = 'assets/img'
LINE = 'rgba(60,30,10,.35)'

def arm(sx, sy, hx, hy, skin, sleeve, k=.32):
    mx, my = sx + (hx - sx)*k, sy + (hy - sy)*k
    return (f'<line x1="{sx}" y1="{sy}" x2="{hx}" y2="{hy}" stroke="{LINE}" stroke-width="22" stroke-linecap="round"/>'
            f'<line x1="{sx}" y1="{sy}" x2="{hx}" y2="{hy}" stroke="{skin}" stroke-width="17" stroke-linecap="round"/>'
            f'<line x1="{sx}" y1="{sy}" x2="{mx:.1f}" y2="{my:.1f}" stroke="{sleeve}" stroke-width="20" stroke-linecap="round"/>'
            f'<circle cx="{hx}" cy="{hy}" r="12" fill="{skin}" stroke="{LINE}" stroke-width="3"/>')

def legs(skin, sock, shoe, jump=False):
    if jump:
        return (f'<path d="M104 300 L84 360 M136 300 L156 360" stroke="{LINE}" stroke-width="22" stroke-linecap="round"/>'
                f'<path d="M104 300 L84 360 M136 300 L156 360" stroke="{skin}" stroke-width="17" stroke-linecap="round"/>'
                f'<ellipse cx="80" cy="368" rx="20" ry="11" fill="{shoe}" stroke="{LINE}" stroke-width="3"/>'
                f'<ellipse cx="160" cy="368" rx="20" ry="11" fill="{shoe}" stroke="{LINE}" stroke-width="3"/>')
    s = ''
    for x in (95, 127):
        s += f'<rect x="{x}" y="280" width="18" height="110" rx="8" fill="{skin}" stroke="{LINE}" stroke-width="3"/><rect x="{x}" y="364" width="18" height="24" fill="{sock}"/>'
    return s + ''.join(f'<ellipse cx="{x}" cy="398" rx="21" ry="12" fill="{shoe}" stroke="{LINE}" stroke-width="3"/>' for x in (100, 140))

def eyes(kind, iris='#2a1a10'):
    if kind == 'blink':
        return f'<path d="M92 98 q8 7 16 0 M132 98 q8 7 16 0" stroke="{iris}" stroke-width="4" fill="none" stroke-linecap="round"/>'
    if kind == 'happy':
        return f'<path d="M92 100 q8 -10 16 0 M132 100 q8 -10 16 0" stroke="{iris}" stroke-width="5" fill="none" stroke-linecap="round"/>'
    if kind == 'sly':
        return (f'<path d="M90 92 l20 6 M150 92 l-20 6" stroke="{iris}" stroke-width="4" stroke-linecap="round"/>'
                f'<ellipse cx="100" cy="101" rx="7" ry="6" fill="{iris}"/><ellipse cx="140" cy="101" rx="7" ry="6" fill="{iris}"/>')
    if kind == 'sad':
        return (f'<path d="M90 86 l18 -6 M150 86 l-18 -6" stroke="{iris}" stroke-width="4" stroke-linecap="round"/>'
                f'<ellipse cx="100" cy="98" rx="8" ry="9" fill="{iris}"/><ellipse cx="140" cy="98" rx="8" ry="9" fill="{iris}"/>'
                f'<circle cx="103" cy="94" r="3" fill="#fff"/><circle cx="143" cy="94" r="3" fill="#fff"/>')
    return (f'<ellipse cx="100" cy="96" rx="8" ry="10" fill="{iris}"/><ellipse cx="140" cy="96" rx="8" ry="10" fill="{iris}"/>'
            f'<circle cx="103" cy="92" r="3" fill="#fff"/><circle cx="143" cy="92" r="3" fill="#fff"/>')

def mouth(kind):
    return {'smile': '<path d="M104 122 Q120 138 136 122" stroke="#8a2a2a" stroke-width="4" fill="none" stroke-linecap="round"/>',
            'talk': '<ellipse cx="120" cy="128" rx="12" ry="10" fill="#8a2a2a"/>',
            'laugh': '<path d="M100 120 Q120 150 140 120 Z" fill="#8a2a2a" stroke="#8a2a2a" stroke-width="3" stroke-linejoin="round"/><path d="M110 138 q10 6 20 0" fill="#ff8f8f"/>',
            'sad': '<path d="M106 132 Q120 120 134 132" stroke="#8a2a2a" stroke-width="4" fill="none" stroke-linecap="round"/>',
            'grin': '<path d="M102 122 Q122 140 140 118" stroke="#8a2a2a" stroke-width="4" fill="none" stroke-linecap="round"/>',
            'shy': '<path d="M110 126 q10 5 20 0" stroke="#8a2a2a" stroke-width="4" fill="none" stroke-linecap="round"/>',
            'oh': '<ellipse cx="120" cy="128" rx="7" ry="9" fill="#8a2a2a"/>'}[kind]

def face(skin, e, m, cheeks=True):
    s = (f'<circle cx="62" cy="102" r="13" fill="{skin}" stroke="{LINE}" stroke-width="3"/><circle cx="178" cy="102" r="13" fill="{skin}" stroke="{LINE}" stroke-width="3"/>'
         f'<circle cx="120" cy="98" r="60" fill="{skin}" stroke="{LINE}" stroke-width="3"/>')
    return s, eyes(e) + (f'<circle cx="86" cy="118" r="10" fill="#ff8f8f" opacity=".45"/><circle cx="154" cy="118" r="10" fill="#ff8f8f" opacity=".45"/>' if cheeks else '') + \
        f'<path d="M116 110 q4 4 8 0" stroke="{LINE}" stroke-width="3" fill="none" stroke-linecap="round"/>' + mouth(m)

def svg(body, h=420):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 {h}" width="240" height="{h}"><g transform="translate(0,0)">{body}</g></svg>'

# руки: idle — вниз, wave — правая вверх, jump — обе вверх, dance — одна вверх, другая в сторону, throw — правая вперёд-вверх
ARMS = {'idle': ((64, 262), (176, 262)), 'wave': ((64, 262), (198, 96)), 'jump': ((40, 110), (200, 110)),
        'dance': ((30, 170), (186, 70)), 'throw': ((64, 262), (214, 140)), 'sad': ((88, 268), (152, 268)),
        'laugh': ((52, 236), (178, 214)), 'shy': ((104, 250), (136, 250))}

# ---------- София: светлая кожа, рыжеватые косички с голубыми бантами, голубое платье (её любимый цвет) ----------
S_SKIN, S_HAIR, S_DRESS, S_BOW = '#f9d9c2', '#c8642e', '#7ab8f5', '#2f80ed'
def sofia(pose):
    e = {'blink': 'blink', 'laugh': 'happy', 'sad': 'sad', 'dance': 'happy', 'jump': 'happy'}.get(pose, 'open')
    m = {'talk': 'talk', 'laugh': 'laugh', 'sad': 'sad', 'jump': 'laugh', 'dance': 'talk', 'wave': 'smile'}.get(pose, 'smile')
    (lx, ly), (rx, ry) = ARMS.get(pose, ARMS['idle'])
    b = legs(S_SKIN, '#fff', '#ff6b8a', pose == 'jump')
    b += (f'<path d="M84 162 Q120 152 156 162 L186 304 Q120 316 54 304 Z" fill="{S_DRESS}" stroke="{LINE}" stroke-width="3" stroke-linejoin="round"/>'
          f'<path d="M98 160 Q120 180 142 160 Q120 170 98 160 Z" fill="#fff" stroke="{LINE}" stroke-width="2"/>'
          f'<path d="M60 288 Q120 300 180 288" stroke="#fff" stroke-width="6" fill="none" opacity=".8"/>'
          '<g fill="#fff" opacity=".85"><circle cx="100" cy="226" r="4"/><circle cx="138" cy="244" r="4"/><circle cx="118" cy="270" r="4"/></g>')
    b += arm(84, 176, lx, ly, S_SKIN, S_DRESS) + arm(156, 176, rx, ry, S_SKIN, S_DRESS)
    b += f'<rect x="110" y="148" width="20" height="18" fill="{S_SKIN}"/>'
    # косички по бокам
    for cx, d in ((44, -1), (196, 1)):
        b += (f'<ellipse cx="{cx}" cy="128" rx="16" ry="30" fill="{S_HAIR}" stroke="{LINE}" stroke-width="3" transform="rotate({d*-14} {cx} 128)"/>'
              f'<ellipse cx="{cx + d*4}" cy="166" rx="12" ry="16" fill="{S_HAIR}" stroke="{LINE}" stroke-width="3"/>'
              f'<path d="M{cx - 14} 92 l14 8 l-14 8 z M{cx + 14} 92 l-14 8 l14 8 z" fill="{S_BOW}" stroke="#1f5fb0" stroke-width="2" stroke-linejoin="round"/><circle cx="{cx}" cy="100" r="5" fill="#8ec5ff"/>')
    ears, fc = face(S_SKIN, e, m)
    b += ears
    b += (f'<path d="M58 104 Q56 36 120 34 Q184 36 182 104 Q170 70 150 62 Q136 80 116 66 Q96 82 78 66 Q64 80 58 104 Z" fill="{S_HAIR}" stroke="{LINE}" stroke-width="3" stroke-linejoin="round"/>')
    b += fc
    if pose == 'sad':
        b += '<path d="M98 112 q-3 10 0 16" stroke="#5aa8f0" stroke-width="5" fill="none" stroke-linecap="round"/>'
    return svg(b)

# ---------- Леон: смуглее, взъерошенные тёмные волосы, веснушки, красно-белая полосатая футболка, синие шорты ----------
L_SKIN, L_HAIR, L_SHIRT, L_PANTS = '#e8b48c', '#3b2414', '#e8505b', '#34508a'
def leon(pose):
    e = {'blink': 'blink', 'laugh': 'happy', 'mud': 'happy', 'mudsad': 'sad', 'sad': 'sad', 'sly': 'sly', 'throw': 'sly', 'shy': 'blink', 'jump': 'happy'}.get(pose, 'open')
    m = {'talk': 'talk', 'laugh': 'laugh', 'mud': 'laugh', 'mudsad': 'sad', 'sad': 'sad', 'sly': 'grin', 'throw': 'grin', 'shy': 'shy', 'jump': 'laugh', 'oh': 'oh'}.get(pose, 'grin')
    (lx, ly), (rx, ry) = ARMS.get({'mud': 'laugh', 'mudsad': 'sad', 'sly': 'idle', 'oh': 'jump'}.get(pose, pose), ARMS['idle'])
    b = legs(L_SKIN, '#fff', '#2f2f2f', pose == 'jump')
    b += f'<rect x="78" y="246" width="84" height="54" rx="10" fill="{L_PANTS}" stroke="{LINE}" stroke-width="3"/><path d="M120 252 V298" stroke="{LINE}" stroke-width="3"/>'
    b += f'<path d="M82 162 Q120 152 158 162 L170 262 L70 262 Z" fill="#fff" stroke="{LINE}" stroke-width="3" stroke-linejoin="round"/>'
    b += ''.join(f'<path d="M{74 + i*0.6:.0f} {182 + i*20} H{166 - i*0.6:.0f}" stroke="{L_SHIRT}" stroke-width="10"/>' for i in range(4))
    b += arm(84, 176, lx, ly, L_SKIN, L_SHIRT) + arm(156, 176, rx, ry, L_SKIN, L_SHIRT)
    b += f'<rect x="110" y="148" width="20" height="18" fill="{L_SKIN}"/>'
    ears, fc = face(L_SKIN, e, m, cheeks=False)
    b += ears
    b += (f'<path d="M58 100 Q54 40 92 32 L86 14 L110 30 L114 8 L132 30 L146 12 L150 34 Q186 44 182 100 Q172 72 152 64 L146 78 L132 62 L120 78 L106 62 L94 78 L86 62 Q66 74 58 100 Z" '
          f'fill="{L_HAIR}" stroke="{LINE}" stroke-width="3" stroke-linejoin="round"/>')
    b += fc
    b += '<g fill="#b8784e" opacity=".7"><circle cx="88" cy="112" r="2.4"/><circle cx="96" cy="118" r="2.4"/><circle cx="84" cy="120" r="2.4"/><circle cx="152" cy="112" r="2.4"/><circle cx="144" cy="118" r="2.4"/><circle cx="156" cy="120" r="2.4"/></g>'
    if pose == 'shy':
        b += '<circle cx="86" cy="118" r="12" fill="#ff6b6b" opacity=".45"/><circle cx="154" cy="118" r="12" fill="#ff6b6b" opacity=".45"/>'
    if pose == 'sad':
        b += '<path d="M98 112 q-3 10 0 16" stroke="#5aa8f0" stroke-width="5" fill="none" stroke-linecap="round"/>'
    if pose in ('mud', 'mudsad'):   # весь в грязи: пятна на одежде, лице и носу
        mud = '#7a5230'
        b += (f'<g fill="{mud}" opacity=".92"><ellipse cx="96" cy="210" rx="20" ry="14"/><ellipse cx="146" cy="236" rx="16" ry="12"/><ellipse cx="110" cy="278" rx="26" ry="12"/>'
              f'<ellipse cx="72" cy="142" rx="10" ry="8"/><ellipse cx="170" cy="126" rx="9" ry="12"/><circle cx="120" cy="110" r="9"/>'
              f'<ellipse cx="100" cy="396" rx="24" ry="10"/><ellipse cx="140" cy="396" rx="24" ry="10"/><ellipse cx="88" cy="56" rx="14" ry="8"/></g>'
              f'<g fill="{mud}"><circle cx="150" cy="150" r="4"/><circle cx="64" cy="200" r="5"/><circle cx="176" cy="290" r="4"/></g>')
    return svg(b)

POSES = {'sofia': (sofia, ['idle', 'blink', 'talk', 'wave', 'jump', 'laugh', 'sad', 'dance']),
         'leon': (leon, ['idle', 'blink', 'talk', 'wave', 'jump', 'laugh', 'sad', 'throw', 'mud', 'mudsad', 'sly', 'shy', 'oh'])}

if __name__ == '__main__':
    talk = json.load(open('art/talk_img.json'))
    for name, (fn, poses) in POSES.items():
        for p in poses:
            s = fn(p); h = hashlib.md5(s.encode()).hexdigest()[:12]; path = f'{OUT}/{h}.svg'
            open(path, 'w').write(s)
            old = talk.get(f'{name}_{p}')
            if old and old[0] != path and os.path.exists(old[0]) and old[0] not in [v[0] for k, v in talk.items() if k != f'{name}_{p}']: os.remove(old[0])
            talk[f'{name}_{p}'] = [path, 240, 420]
    json.dump(talk, open('art/talk_img.json', 'w'), indent=1)
    print('готово:', ', '.join(f'{n}: {len(p[1])}' for n, p in POSES.items()))
