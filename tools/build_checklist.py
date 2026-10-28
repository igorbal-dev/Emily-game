"""Собирает страницу-чеклист листов для ChatGPT из docs/chatgpt-prompts.md."""
import re, json, html, sys
src = open('docs/chatgpt-prompts.md', encoding='utf-8').read()
blocks = re.findall(r'```\n(.*?)```', src, re.S)
header = blocks[0].strip()
sheets = []
for m in re.finditer(r'### Лист (\d+) — (\w+)\.png: ([^\n]+)\n(.*?)```\n(.*?)```', src, re.S):
    n, code, title, _, body = m.groups()
    grid = re.search(r'Grid: (\d+) columns x (\d+) rows', body)
    g = f"{grid.group(1)}×{grid.group(2)}"
    full = header.replace('{GRID}', g.replace('×', ' columns x ') + ' rows') + '\n\n' + body.strip()
    who = {'E': 'emily', 'M': 'mark', 'T': 'theo'}[code[0]]
    sheets.append({'n': int(n), 'id': code, 'who': who, 'title': title.strip(), 'grid': g, 'prompt': full})
# лист, переделанный во второй очереди, заменяет первый вариант (номер остаётся старый)
byid = {}
for sh in sheets:
    if sh['id'] in byid: sh['n'] = byid[sh['id']]['n']
    byid[sh['id']] = sh
sheets = sorted(byid.values(), key=lambda x: x['n'])
print(len(sheets), 'листов')
tpl = open('tools/checklist_template.html', encoding='utf-8').read()
out = tpl.replace('/*SHEETS*/[]', json.dumps(sheets, ensure_ascii=False))
open(sys.argv[1], 'w', encoding='utf-8').write(out)
print('ok', len(sheets))
