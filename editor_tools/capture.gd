extends Node2D
## Служебный инструмент для проверки: делает снимки Эмили в нужных кадрах анимаций.
## godot --path . res://editor_tools/capture.tscn -- --out=/tmp/shots --shots=idle:0,wave:0.6 [--ref]
## --ref — положить под Эмили полупрозрачный оригинал emily_idle.png (подложка).

func _ready() -> void:
	var args := {}
	for a in OS.get_cmdline_user_args():
		var kv := a.trim_prefix("--").split("=", true, 1)
		args[kv[0]] = kv[1] if kv.size() > 1 else "1"
	var out: String = args.get("out", "/tmp/shots")
	DirAccess.make_dir_recursive_absolute(out)
	var scale_k := float(args.get("scale", "0.8"))
	RenderingServer.set_default_clear_color(Color(1, 1, 1))
	var emily: Node2D = load("res://scenes/emily.tscn").instantiate()
	emily.start_animation = ""
	emily.position = Vector2(640, 700) if not args.has("ground") else Vector2(640, float(args["ground"]))
	emily.scale = Vector2(scale_k, scale_k)
	if args.has("ref"):
		var ref := Sprite2D.new()
		ref.texture = load("res://assets/emily/reference/emily_idle.png")
		# 1 пиксель оригинала = 1.5 пикселя скелета; низ ступней оригинала (y=509) — на полу
		ref.position = emily.position + Vector2((141.5 - 141.0) * 1.5, (257.5 - 509.0) * 1.5) * scale_k
		ref.scale = Vector2(1.5, 1.5) * scale_k
		ref.modulate = Color(1, 1, 1, float(args.get("ref_alpha", "0.45")))
		ref.z_index = 100 if args.has("ref_top") else -100
		add_child(ref)
	add_child(emily)
	await get_tree().process_frame
	var player: AnimationPlayer = emily.get_node("AnimationPlayer")
	for shot in String(args.get("shots", "idle:0")).split(","):
		var p := shot.split(":")
		player.play(p[0])
		player.seek(float(p[1]), true)
		player.pause()
		await get_tree().process_frame
		await get_tree().process_frame
		var img := get_viewport().get_texture().get_image()
		img.save_png("%s/%s_%s.png" % [out, p[0], p[1]])
	get_tree().quit()
