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
##   emily.play("walk")  # idle, walk, wave, jump, talk, blink
##   emily.talking = true  # mouth moves on top of any body animation
##   emily.facing = -1     # look left

signal action_finished(anim: String)

const OUTFIT_DIR := "res://emily/outfits/"
const HEAD_DIR := "res://emily/head/"
## Units per second the body moves when the "walk" animation plays (feet don't slide).
const WALK_SPEED := 231.0

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
	if anim in ["idle", "walk"]:
		eyes = "open"
		if not talking:
			mouth = "smile"
	player.play(anim)

## one-shot actions (wave, jump, blink) return to idle by themselves
func _on_anim_finished(anim: StringName) -> void:
	action_finished.emit(anim)
	if anim in [&"wave", &"jump", &"blink"]:
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
	outfit = o

func get_outfit_item(id) -> OutfitItem:
	if id is OutfitItem:
		return id
	var path := OUTFIT_DIR + str(id) + ".tres"
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
	var o := outfit.duplicate()
	if not o.has("base"):
		o["base"] = "bodysuit"
	for slot in o:
		var item := get_outfit_item(o[slot])
		if item == null:
			continue
		for piece in EmilyShapes.cloth_pieces(item):
			var bone := _bone(piece["bone"])
			if bone == null:
				continue
			var fill: Color = piece.get("color", item.color)
			var line: Color = piece.get("outline", item.get_outline())
			EmilyShapes.make_piece_nodes(bone, piece, fill, line, "cloth")

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
	var f := FileAccess.open(HEAD_DIR + "layout.json", FileAccess.READ)
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
	head.get_node("HairBack").texture = _tex(HEAD_DIR + "hair/%s_back.png" % hair)
	head.get_node("HairFront").texture = _tex(HEAD_DIR + "hair/%s_front.png" % hair)

func _apply_face() -> void:
	if not is_inside_tree() or not has_node("Skeleton2D"):
		return
	var head := _bone("Head")
	if head == null:
		return
	var e: Sprite2D = head.get_node("Eyes")
	var m: Sprite2D = head.get_node("Mouth")
	e.texture = _tex(HEAD_DIR + "eyes/%s.png" % eyes)
	m.texture = _tex(HEAD_DIR + "mouth/%s.png" % mouth)
