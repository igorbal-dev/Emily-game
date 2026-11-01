@tool
class_name Emily
extends Node2D
## Emily puppet: vector body on Skeleton2D, swappable clothes, PNG head slots.
##
##   emily.set_outfit({"top": "tshirt_pink", "bottom": "leggings_grey", "socks": "socks_pink"})
##   emily.set_outfit({"top": "tshirt_yellow"})   # change only the T-shirt
##   emily.set_outfit({"bottom": null})           # take off the trousers (bodysuit stays)
##   emily.set_hair("braids")
##   emily.eyes = "happy"; emily.mouth = "laugh"
##   emily.play("walk")  # idle, walk, run, wave, jump, spin, talk, blink
##   emily.talking = true  # mouth moves on top of any body animation
##   emily.facing = -1     # look left

signal action_finished(anim: String)

## Emily's values. Other characters (Mark...) use the same script with other
## body / head_dir / outfit_dir set in their scene (tools/build_emily.gd -- <name>).
const OUTFIT_DIR := "res://emily/outfits/"
const HEAD_DIR := "res://emily/head/"
## Units per second the body moves when the "walk" animation plays (feet don't slide), for Emily.
const WALK_SPEED := 231.0
## Units per second for "run", for Emily.
const RUN_SPEED := 594.0

## Body proportions: a key of EmilyShapes.BODIES ("emily", "mark").
@export var body := "emily"
@export var head_dir := HEAD_DIR
@export var outfit_dir := OUTFIT_DIR
## The always-worn base layer (slot "base").
@export var base_outfit := "bodysuit"

## walk / run speed of THIS character (the viewer uses these)
var walk_speed: float:
	get: return WALK_SPEED * EmilyShapes.motion(EmilyShapes.body(body))
var run_speed: float:
	get: return RUN_SPEED * EmilyShapes.motion(EmilyShapes.body(body))

const DEFAULT_OUTFIT := {"base": "bodysuit", "top": "tshirt_pink", "bottom": "leggings_grey", "socks": "socks_pink"}

@export var outfit: Dictionary = DEFAULT_OUTFIT.duplicate():
	set(v):
		outfit = v
		if is_inside_tree():
			_rebuild_clothes()
@export var hair := "pigtails":
	set(v):
		hair = v
		_apply_head()
@export var eyes := "open":
	set(v):
		eyes = v
		_apply_face()
@export var mouth := "smile":
	set(v):
		mouth = v
		_apply_face()
@export var skin_color := Color("fbbf94"):
	set(v):
		skin_color = v
		_apply_skin()
@export_range(-1, 1, 2) var facing := 1:
	set(v):
		facing = 1 if v >= 0 else -1
		scale.x = absf(scale.x) * facing
@export var auto_blink := true
@export var talking := false:
	set(v):
		talking = v
		if is_inside_tree() and not Engine.is_editor_hint():
			if v:
				face_player.play("talk")
			else:
				face_player.stop()
				mouth = "smile"

@onready var skeleton: Skeleton2D = $Skeleton2D
@onready var player: AnimationPlayer = $AnimationPlayer
@onready var face_player: AnimationPlayer = $FacePlayer

var _layout := {}
var _tex_cache := {}
var _blink_timer := 3.0

func _ready() -> void:
	_load_layout()
	_rebuild_clothes()
	_apply_head()
	_apply_face()
	_apply_skin()
	if not Engine.is_editor_hint():
		player.animation_finished.connect(_on_anim_finished)
		if player.has_animation("idle") and not player.is_playing():
			player.play("idle")

func _process(delta: float) -> void:
	if Engine.is_editor_hint() or not auto_blink:
		return
	_blink_timer -= delta
	if _blink_timer <= 0.0:
		_blink_timer = randf_range(2.2, 5.0)
		if eyes == "open" and not face_player.is_playing() and player.current_animation != "blink":
			face_player.play("blink")

# ------------------------------------------------------------------ animations
func play(anim: String) -> void:
	if not player.has_animation(anim):
		return
	if anim in ["idle", "walk", "run"]:
		eyes = "open"
		if not talking:
			mouth = "smile"
	player.play(anim)

## one-shot actions (wave, jump, blink) return to idle by themselves
func _on_anim_finished(anim: StringName) -> void:
	action_finished.emit(anim)
	if anim in [&"wave", &"jump", &"blink", &"spin"]:
		play("idle")

# ------------------------------------------------------------------ clothes
## items: slot -> outfit id (String), OutfitItem, or null/"" to take it off.
## Only the given slots change. The bodysuit (slot "base") can be replaced but never removed.
func set_outfit(items: Dictionary) -> void:
	var o := outfit.duplicate()
	for slot in items:
		var v = items[slot]
		if v == null or (v is String and v == ""):
			if slot == "base":
				continue
			o.erase(slot)
		else:
			o[slot] = v
			# a dress replaces the top and the bottom (and the other way round)
			if slot == "dress":
				o.erase("top")
				o.erase("bottom")
			elif slot in ["top", "bottom"]:
				o.erase("dress")
	outfit = o

func get_outfit_item(id) -> OutfitItem:
	if id is OutfitItem:
		return id
	var path := outfit_dir + str(id) + ".tres"
	if ResourceLoader.exists(path):
		return load(path)
	push_warning("Emily: no outfit item " + path)
	return null

func _rebuild_clothes() -> void:
	if not has_node("Skeleton2D"):
		return
	for n in _all_polys():
		if n.get_meta("tag", "") == "cloth":
			n.get_parent().remove_child(n)
			n.queue_free()
	var B := EmilyShapes.body(body)
	var o := outfit.duplicate()
	if not o.has("base"):
		o["base"] = base_outfit
	if o.has("dress"):
		o.erase("top")
		o.erase("bottom")
	for slot in o:
		var item := get_outfit_item(o[slot])
		if item == null:
			continue
		for piece in EmilyShapes.cloth_pieces(item, B):
			var bone := _bone(piece["bone"])
			if bone == null:
				continue
			var fill: Color = piece.get("color", item.color)
			var line: Color = piece.get("outline", item.get_outline())
			EmilyShapes.make_piece_nodes(bone, piece, fill, line, "cloth", B)

func _all_polys() -> Array:
	var out := []
	var stack: Array = [get_node("Skeleton2D")]
	while stack.size() > 0:
		var n: Node = stack.pop_back()
		for c in n.get_children():
			if c is Polygon2D:
				out.append(c)
			else:
				stack.append(c)
	return out

func _bone(bname: String) -> Node2D:
	var stack: Array = [get_node("Skeleton2D")]
	while stack.size() > 0:
		var n: Node = stack.pop_back()
		if n.name == bname:
			return n
		for c in n.get_children():
			if c is Bone2D:
				stack.append(c)
	return null

func _apply_skin() -> void:
	if not is_inside_tree():
		return
	var line := Color.from_hsv(skin_color.h, minf(1.0, skin_color.s * 1.25), skin_color.v * 0.78)
	for n in _all_polys():
		match n.get_meta("paint", ""):
			"skin": n.color = skin_color
			"skin_line": n.color = line

# ------------------------------------------------------------------ head
func _load_layout() -> void:
	var f := FileAccess.open(head_dir + "layout.json", FileAccess.READ)
	if f:
		_layout = JSON.parse_string(f.get_as_text())
		if _layout.has("skin"):
			skin_color = Color(_layout["skin"])

func _tex(path: String) -> Texture2D:
	if _tex_cache.has(path):
		return _tex_cache[path]
	var t: Texture2D = load(path) if ResourceLoader.exists(path) else null
	_tex_cache[path] = t
	return t

func set_hair(style: String) -> void:
	hair = style

func set_eyes(state: String) -> void:
	eyes = state

func set_mouth(state: String) -> void:
	mouth = state

func _apply_head() -> void:
	if not is_inside_tree() or not has_node("Skeleton2D"):
		return
	var head := _bone("Head")
	if head == null:
		return
	head.get_node("HairBack").texture = _tex(head_dir + "hair/%s_back.png" % hair)
	head.get_node("HairFront").texture = _tex(head_dir + "hair/%s_front.png" % hair)

func _apply_face() -> void:
	if not is_inside_tree() or not has_node("Skeleton2D"):
		return
	var head := _bone("Head")
	if head == null:
		return
	var e: Sprite2D = head.get_node("Eyes")
	var m: Sprite2D = head.get_node("Mouth")
	e.texture = _tex(head_dir + "eyes/%s.png" % eyes)
	m.texture = _tex(head_dir + "mouth/%s.png" % mouth)

# ------------------------------------------------------------------ viewer (viewer/viewer.gd)
const RU := {
	"idle": "Стоит", "walk": "Идёт", "run": "Бежит", "jump": "Прыжок", "wave": "Машет",
	"spin": "Кружится", "talk": "Говорит", "blink": "Моргает",
	"tshirt_pink": "Розовая футболка", "tshirt_yellow": "Жёлтая футболка", "longsleeve_mint": "Мятная кофта",
	"leggings_grey": "Серые леггинсы", "shorts_denim": "Шорты", "skirt_lilac": "Юбка",
	"socks_pink": "Розовые носки", "socks_white": "Белые носки",
	"pigtails": "Два хвостика", "ponytail": "Хвостик", "braids": "Косички", "headband": "Ободок",
	"bun": "Пучок", "stars": "Звёздочки", "flowers": "Венок", "cap": "Кепка",
	"curls": "Кудряшки", "hat": "Шапка", "romper": "Комбинезон",
	"jacket_navy": "Куртка", "trousers_navy": "Штаны", "boots_brown": "Ботинки",
	"sweater_mustard": "Свитер с мишкой", "joggers_navy": "Джоггеры", "socks_navy": "Синие носки",
	"shirt_white": "Рубашка с бабочкой", "vest_grey": "Жилетка", "trousers_grey": "Серые брюки", "shoes_brown": "Туфли",
	"tshirt_black": "Чёрная футболка", "cargo_purple": "Штаны-карго", "sneakers_pink": "Кроссовки",
	"dress_pink": "Розовое", "dress_lilac": "Сиреневое", "dress_denim": "Джинсовое", "dress_rainbow": "Радужное", "dress_green": "Зелёное",
	"sneakers_white": "Белые кроссовки", "shoes_lilac": "Туфельки",
	"open": "Открыты", "half": "Прищур", "closed": "Закрыты", "happy": "Радость", "surprised": "Удивление", "sad": "Грусть",
	"smile": "Улыбка", "a": "А", "o": "О", "e": "И", "m": "М", "laugh": "Смех",
}

static func ru(id: String) -> String:
	return RU.get(id, id)

## Everything the phone viewer can switch. Returns [{"tab": ..., "title": ..., "items": [[label, Callable, is_on Callable]]}]
## New items appear by themselves: any .tres in emily/outfits/, any hair PNG in emily/head/hair/.
func viewer_options() -> Array:
	var groups := []
	var by_slot := {}
	for f in _list(outfit_dir, ".tres"):
		var item: OutfitItem = load(outfit_dir + f + ".tres")
		if item == null or item.slot == "base":
			continue
		if not by_slot.has(item.slot):
			by_slot[item.slot] = []
		by_slot[item.slot].append(f)
	var slot_titles := {"top": "Верх", "bottom": "Низ", "socks": "Носки", "shoes": "Обувь", "outer": "Жилетка", "dress": "Платье"}
	for slot in ["dress", "top", "outer", "bottom", "socks", "shoes"] + by_slot.keys().filter(func(s): return not s in ["dress", "top", "outer", "bottom", "socks", "shoes"]):
		if not by_slot.has(slot):
			continue
		var items := []
		for id in by_slot[slot]:
			items.append([ru(id), func(): set_outfit({slot: id}), func(): return str(outfit.get(slot, "")) == id])
		items.append(["Без", func(): set_outfit({slot: null}), func(): return not outfit.has(slot)])
		groups.append({"tab": "Одежда", "title": slot_titles.get(slot, slot), "items": items})
	var hairs := []
	for f in _list(head_dir + "hair/", "_front.png"):
		hairs.append([ru(f), func(): set_hair(f), func(): return hair == f])
	if hairs.size() > 1:
		groups.append({"tab": "Причёски", "title": "", "items": hairs})
	var ev := []
	for f in _list(head_dir + "eyes/", ".png"):
		ev.append([ru(f), func(): eyes = f, func(): return eyes == f])
	if ev.size() > 0:
		groups.append({"tab": "Лицо", "title": "Глаза", "items": ev})
	var mv := []
	for f in _list(head_dir + "mouth/", ".png"):
		mv.append([ru(f), func(): mouth = f, func(): return mouth == f])
	if mv.size() > 0:
		mv.append(["Болтает", func(): talking = not talking, func(): return talking])
		groups.append({"tab": "Лицо", "title": "Рот", "items": mv})
	return groups

## file names (without suffix) in a res:// folder; works in exported builds too (.import / .remap)
func _list(dir: String, suffix: String) -> Array:
	var out := []
	for f in DirAccess.get_files_at(dir):
		f = f.trim_suffix(".import").trim_suffix(".remap")
		if f.ends_with(suffix):
			var id := f.trim_suffix(suffix)
			if not id in out:
				out.append(id)
	out.sort()
	# keep a nice fixed order for the known ones
	var order := ["tshirt_pink", "tshirt_yellow", "longsleeve_mint", "leggings_grey", "shorts_denim", "skirt_lilac",
		"socks_pink", "socks_white", "pigtails", "ponytail", "braids", "headband", "bun", "stars", "flowers", "cap", "curls", "hat",
		"open", "half", "closed", "happy", "surprised", "sad", "smile", "a", "o", "e", "m", "laugh"]
	out.sort_custom(func(x, y): return (order.find(x) if x in order else 999) < (order.find(y) if y in order else 999))
	return out
