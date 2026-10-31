extends SceneTree
## Выгружает анимации Эмили в JSON для веб-версии демо (web/).
## Для каждого кадра (30 в секунду) записывает положение каждой картинки-части.
##
## Запуск: godot --headless --path . --script res://editor_tools/export_web_data.gd -- web/emily_data.json

const FPS := 30.0
const ANIMS := ["idle", "wave", "walk", "run", "jump", "crouch", "hide"]


var emily: Node2D
var _frames_waited := 0


func _initialize() -> void:
	emily = load("res://scenes/emily.tscn").instantiate()
	emily.start_animation = ""
	root.add_child(emily)


func _process(_delta: float) -> bool:
	# ждём пару кадров, чтобы сцена и AnimationPlayer полностью запустились
	_frames_waited += 1
	if _frames_waited < 3:
		return false
	_export()
	return true


func _export() -> void:
	var out_path := "web/emily_data.json"
	var args := OS.get_cmdline_user_args()
	if args.size() > 0:
		out_path = args[0]
	var player: AnimationPlayer = emily.get_node("AnimationPlayer")

	# все картинки в порядке рисования: сначала по z_index, при равенстве — по порядку в сцене
	var sprites: Array = []
	_collect(emily, sprites)
	var idx := {}
	for i in sprites.size():
		idx[sprites[i]] = i
	sprites.sort_custom(func(a, b):
		if a.z_index != b.z_index:
			return a.z_index < b.z_index
		return idx[a] < idx[b])

	var info: Array = []
	for s: Sprite2D in sprites:
		info.append({"name": s.name, "tex": s.texture.resource_path.get_file()})

	var anims := {}
	for anim_name in ANIMS:
		var anim: Animation = player.get_animation(anim_name)
		var n := int(round(anim.length * FPS))
		var frames: Array = []
		player.play(anim_name)
		for f in n:
			player.seek(f / FPS, true)
			var frame: Array = []
			for s: Sprite2D in sprites:
				if not s.visible:
					frame.append(0)
					continue
				var g := s.get_global_transform()
				var o := g * s.offset
				frame.append([snappedf(g.x.x, 0.0001), snappedf(g.x.y, 0.0001),
					snappedf(g.y.x, 0.0001), snappedf(g.y.y, 0.0001),
					snappedf(o.x, 0.01), snappedf(o.y, 0.01)])
			frames.append(frame)
		anims[anim_name] = {"length": anim.length, "frames": frames}

	var data := {"fps": FPS, "sprites": info, "anims": anims, "titles": emily.TITLES}
	var f := FileAccess.open(out_path, FileAccess.WRITE)
	f.store_string(JSON.stringify(data))
	f.close()
	print("Сохранено: ", out_path, ", картинок: ", sprites.size())


func _collect(node: Node, acc: Array) -> void:
	for c in node.get_children():
		if c is Sprite2D:
			acc.append(c)
		_collect(c, acc)
