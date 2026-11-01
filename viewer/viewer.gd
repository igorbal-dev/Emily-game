extends Node2D
## Phone-friendly character viewer (also exported to the web).
## Add a new character: put its scene into CHARACTERS. Optional on the character:
##   viewer_options() -> [{"tab", "title", "items": [[label, do Callable, is_on Callable]]}]
##   properties walk_speed / run_speed (or constants WALK_SPEED / RUN_SPEED), property `facing` (1 / -1), static ru(id) for Russian names.

const CHARACTERS := [
	{"name": "Эмили", "scene": "res://emily/emily.tscn"},
	{"name": "Абиха", "scene": "res://abiha/abiha.tscn"},
	{"name": "Марк", "scene": "res://mark/mark.tscn"},
	{"name": "Тео", "scene": "res://theo/theo.tscn"},
]
const CHAR_HEIGHT := 560.0          # character height in its own units (with hair)
const BG_TOP := Color(0.93, 0.96, 1.0)
const BG_BOTTOM := Color(0.99, 0.95, 0.9)
const GROUND := Color(0.82, 0.9, 0.7)
const GROUND_LINE := Color(0.6, 0.72, 0.5)

var ch: Node2D
var ap: AnimationPlayer
var ch_index := 0
var zoom := 1.0
var stroll := true
var slow := false
var stage := Rect2()
var ground_y := 0.0
var base_scale := 1.0
var cur_anim := "idle"

var ui: Control
var top_bar: HFlowContainer
var tabs: TabContainer
var buttons := []          # [Button, is_on Callable]
var anim_buttons := {}

func _ready() -> void:
	get_viewport().size_changed.connect(_layout)
	_build_ui()
	_load_character(0)
	_layout()

# ------------------------------------------------------------------ character
func _load_character(i: int) -> void:
	if ch:
		ch.queue_free()
	ch_index = i
	ch = load(CHARACTERS[i]["scene"]).instantiate()
	add_child(ch)
	ap = ch.get_node_or_null("AnimationPlayer")
	if ap:
		ap.animation_finished.connect(_on_anim_finished)
	_fill_tabs()
	_play("idle")
	_layout()

func _ru(id: String) -> String:
	if ch and ch.has_method("ru"):
		return ch.ru(id)
	return id

func _const(cname: String, fallback: float) -> float:
	var s: Script = ch.get_script()
	if s:
		var m := s.get_script_constant_map()
		if m.has(cname):
			return float(m[cname])
	return fallback

func _play(anim: String) -> void:
	if ap == null or not ap.has_animation(anim):
		return
	cur_anim = anim
	if ch.has_method("play"):
		ch.play(anim)
	else:
		ap.play(anim)
	ap.speed_scale = 0.35 if slow else 1.0
	_refresh()

func _on_anim_finished(anim: StringName) -> void:
	if anim in [&"wave", &"jump", &"blink", &"spin", &"shake", &"bark"]:
		cur_anim = "idle"
		if not ch.has_method("play"):
			ap.play("idle")
	_refresh()

func _process(delta: float) -> void:
	if ch == null:
		return
	if ap and ap.current_animation != "" and ap.current_animation != cur_anim and ap.current_animation in ["idle"]:
		cur_anim = "idle"
		_refresh()
	var moving := stroll and cur_anim in ["walk", "run"]
	if ch.has_method("speed_for"):
		moving = stroll and ch.speed_for(cur_anim) > 0.0
	var cx := stage.position.x + stage.size.x / 2.0
	if moving:
		var sp = ch.speed_for(cur_anim) if ch.has_method("speed_for") else ch.get("run_speed" if cur_anim == "run" else "walk_speed")
		var speed: float = (float(sp) if sp != null else _const("RUN_SPEED" if cur_anim == "run" else "WALK_SPEED", 230.0)) * ch.scale.y * (0.35 if slow else 1.0)
		var dir := float(ch.get("facing") if ch.get("facing") != null else 1)
		ch.position.x += dir * speed * delta
		var margin := 170.0 * ch.scale.y
		if ch.position.x > stage.end.x - margin and dir > 0:
			_set_facing(-1)
		elif ch.position.x < stage.position.x + margin and dir < 0:
			_set_facing(1)
	else:
		ch.position.x = lerpf(ch.position.x, cx, clampf(delta * 3.0, 0.0, 1.0))
	ch.position.y = ground_y
	queue_redraw()

func _set_facing(f: int) -> void:
	if ch.get("facing") != null:
		ch.set("facing", f)
	else:
		ch.scale.x = absf(ch.scale.x) * f

# ------------------------------------------------------------------ layout
func _layout() -> void:
	var vs := get_viewport_rect().size
	var portrait := vs.y > vs.x
	if portrait:
		stage = Rect2(0, 70, vs.x, vs.y * 0.6 - 70)
		ui.position = Vector2(0, 0)
		ui.size = vs
		tabs.position = Vector2(8, stage.end.y + 4)
		tabs.size = Vector2(vs.x - 16, vs.y - stage.end.y - 12)
	else:
		var sw := vs.x * 0.55
		stage = Rect2(0, 70, sw, vs.y - 70)
		ui.position = Vector2.ZERO
		ui.size = vs
		tabs.position = Vector2(sw + 8, 70)
		tabs.size = Vector2(vs.x - sw - 16, vs.y - 78)
	top_bar.position = Vector2(8, 8)
	top_bar.size = Vector2(vs.x - 16, 60)
	ground_y = stage.end.y - stage.size.y * 0.08
	base_scale = (stage.size.y * 0.86) / CHAR_HEIGHT
	if ch:
		var s := base_scale * zoom
		var f := signf(ch.scale.x) if ch.scale.x != 0 else 1.0
		ch.scale = Vector2(s * f, s)
		ch.position = Vector2(stage.position.x + stage.size.x / 2.0, ground_y)
	queue_redraw()

func _draw() -> void:
	var vs := get_viewport_rect().size
	draw_rect(Rect2(Vector2.ZERO, vs), BG_BOTTOM)
	# soft sky gradient over the stage
	var steps := 24
	for i in steps:
		var y0 := stage.position.y - 70 + (ground_y - stage.position.y + 70) * i / steps
		var y1 := stage.position.y - 70 + (ground_y - stage.position.y + 70) * (i + 1) / steps
		draw_rect(Rect2(stage.position.x, y0, stage.size.x, y1 - y0 + 1), BG_TOP.lerp(BG_BOTTOM, float(i) / steps))
	draw_rect(Rect2(stage.position.x, ground_y, stage.size.x, stage.end.y - ground_y), GROUND)
	draw_line(Vector2(stage.position.x, ground_y), Vector2(stage.end.x, ground_y), GROUND_LINE, 3.0)
	# contact shadow
	if ch:
		var w := 70.0 * ch.scale.y
		draw_set_transform(Vector2(ch.position.x, ground_y + 4), 0, Vector2(1, 0.22))
		draw_circle(Vector2.ZERO, w, Color(0, 0, 0, 0.12))
		draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)

# ------------------------------------------------------------------ UI
func _btn(text: String, on_press: Callable, is_on := Callable(), toggle := true) -> Button:
	var b := Button.new()
	b.text = text
	b.toggle_mode = toggle
	b.focus_mode = Control.FOCUS_NONE
	b.custom_minimum_size = Vector2(150, 64)
	b.pressed.connect(func():
		on_press.call()
		_refresh())
	if is_on.is_valid():
		buttons.append([b, is_on])
	return b

func _build_ui() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	ui = Control.new()
	ui.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(ui)
	var theme := Theme.new()
	theme.default_font_size = 24
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(1, 1, 1, 0.92)
	sb.set_corner_radius_all(16)
	sb.border_color = Color(0.85, 0.78, 0.82)
	sb.set_border_width_all(2)
	sb.content_margin_left = 12
	sb.content_margin_right = 12
	var sbp := sb.duplicate()
	sbp.bg_color = Color(0.98, 0.6, 0.75)
	sbp.border_color = Color(0.85, 0.4, 0.58)
	var sbh := sb.duplicate()
	sbh.bg_color = Color(1, 0.93, 0.96)
	theme.set_stylebox("normal", "Button", sb)
	theme.set_stylebox("hover", "Button", sbh)
	theme.set_stylebox("pressed", "Button", sbp)
	theme.set_stylebox("hover_pressed", "Button", sbp)
	theme.set_stylebox("focus", "Button", StyleBoxEmpty.new())
	theme.set_color("font_color", "Button", Color(0.3, 0.22, 0.28))
	theme.set_color("font_pressed_color", "Button", Color.WHITE)
	theme.set_color("font_hover_pressed_color", "Button", Color.WHITE)
	theme.set_color("font_hover_color", "Button", Color(0.3, 0.22, 0.28))
	var panel := StyleBoxFlat.new()
	panel.bg_color = Color(1, 0.98, 0.96, 0.96)
	panel.set_corner_radius_all(18)
	panel.content_margin_left = 10
	panel.content_margin_right = 10
	panel.content_margin_top = 10
	panel.content_margin_bottom = 10
	theme.set_stylebox("panel", "TabContainer", panel)
	theme.set_font_size("font_size", "TabContainer", 24)
	theme.set_constant("side_margin", "TabContainer", 0)
	var tab_sel := sbp.duplicate()
	tab_sel.content_margin_top = 10
	tab_sel.content_margin_bottom = 10
	tab_sel.content_margin_left = 18
	tab_sel.content_margin_right = 18
	var tab_un := sb.duplicate()
	tab_un.content_margin_top = 10
	tab_un.content_margin_bottom = 10
	tab_un.content_margin_left = 18
	tab_un.content_margin_right = 18
	theme.set_stylebox("tab_selected", "TabContainer", tab_sel)
	theme.set_stylebox("tab_unselected", "TabContainer", tab_un)
	theme.set_stylebox("tab_hovered", "TabContainer", tab_un)
	theme.set_color("font_selected_color", "TabContainer", Color.WHITE)
	theme.set_color("font_unselected_color", "TabContainer", Color(0.3, 0.22, 0.28))
	theme.set_color("font_hovered_color", "TabContainer", Color(0.3, 0.22, 0.28))
	theme.set_color("font_color", "Label", Color(0.45, 0.35, 0.4))
	theme.set_font_size("font_size", "Label", 20)
	ui.theme = theme

	top_bar = HFlowContainer.new()
	top_bar.add_theme_constant_override("h_separation", 8)
	ui.add_child(top_bar)
	tabs = TabContainer.new()
	ui.add_child(tabs)

func _fill_tabs() -> void:
	buttons.clear()
	for c in top_bar.get_children():
		c.queue_free()
	for c in tabs.get_children():
		tabs.remove_child(c)
		c.queue_free()
	# top bar: characters + view controls
	if CHARACTERS.size() > 1:
		for i in CHARACTERS.size():
			var idx := i
			var b := _btn(CHARACTERS[i]["name"], func(): _load_character.call_deferred(idx), func(): return ch_index == idx)
			b.custom_minimum_size = Vector2(110, 52)
			top_bar.add_child(b)
	for spec in [["−", _zoom_out], ["+", _zoom_in], ["Развернуть", _flip]]:
		var b := _btn(spec[0], spec[1], Callable(), false)
		b.custom_minimum_size = Vector2(60 if spec[0].length() == 1 else 140, 52)
		top_bar.add_child(b)
	var bs := _btn("Медленно", _toggle_slow, func(): return slow)
	bs.custom_minimum_size = Vector2(130, 52)
	top_bar.add_child(bs)
	var bw := _btn("Гуляет", _toggle_stroll, func(): return stroll)
	bw.custom_minimum_size = Vector2(120, 52)
	top_bar.add_child(bw)

	# tab: animations
	var anims := []
	if ap:
		for a in ap.get_animation_list():
			if a != "RESET":
				anims.append(a)
	var order: Array = ["idle", "walk", "run", "jump", "spin", "wave", "talk", "blink"]
	if ch.get("anim_order") != null:
		order = ch.get("anim_order")
	anims.sort_custom(func(x, y): return (order.find(x) if x in order else 99) < (order.find(y) if y in order else 99))
	var move_items := []
	for a in anims:
		var an: String = a
		move_items.append([_ru(an), func(): _play(an), func(): return cur_anim == an])
	var groups := [{"tab": "Движения", "title": "", "items": move_items}]
	if ch.has_method("viewer_options"):
		groups.append_array(ch.viewer_options())
	var pages := {}
	for g in groups:
		if not pages.has(g["tab"]):
			var scroll := ScrollContainer.new()
			scroll.name = g["tab"]
			scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
			var vb := VBoxContainer.new()
			vb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			vb.add_theme_constant_override("separation", 8)
			scroll.add_child(vb)
			tabs.add_child(scroll)
			pages[g["tab"]] = vb
		var vbox: VBoxContainer = pages[g["tab"]]
		if g["title"] != "":
			var l := Label.new()
			l.text = g["title"]
			vbox.add_child(l)
		var flow := HFlowContainer.new()
		flow.add_theme_constant_override("h_separation", 8)
		flow.add_theme_constant_override("v_separation", 8)
		flow.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		vbox.add_child(flow)
		for it in g["items"]:
			flow.add_child(_btn(it[0], it[1], it[2]))
	_refresh()

func _refresh() -> void:
	for pair in buttons:
		var b: Button = pair[0]
		if is_instance_valid(b):
			b.set_pressed_no_signal(bool(pair[1].call()))

func _zoom_out() -> void:
	zoom = maxf(0.5, zoom / 1.2)
	_layout()

func _zoom_in() -> void:
	zoom = minf(2.6, zoom * 1.2)
	_layout()

func _flip() -> void:
	_set_facing(-int(signf(ch.scale.x)))

func _toggle_slow() -> void:
	slow = not slow
	if ap:
		ap.speed_scale = 0.35 if slow else 1.0

func _toggle_stroll() -> void:
	stroll = not stroll
