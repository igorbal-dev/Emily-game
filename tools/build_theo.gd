extends SceneTree
## Builds res://theo/theo.tscn from res://theo/frames.json (run tools/make_theo.py first, then --import):
##   godot --headless --path . --script res://tools/build_theo.gd

var F := {}

func _init() -> void:
	F = JSON.parse_string(FileAccess.open("res://theo/frames.json", FileAccess.READ).get_as_text())
	var root := Node2D.new()
	root.name = "Theo"
	root.set_script(load("res://theo/theo.gd"))
	var tail := Sprite2D.new()
	tail.name = "Tail"
	tail.centered = false
	tail.texture = load("res://theo/" + F["tail"]["file"])
	tail.scale = Vector2(0.5, 0.5)
	tail.position = Vector2(F["tail"]["pivot"][0], F["tail"]["pivot"][1])
	tail.offset = Vector2(F["tail"]["offset"][0], F["tail"]["offset"][1]) * 2.0
	tail.visible = false
	root.add_child(tail)
	var body := Sprite2D.new()
	body.name = "Body"
	body.centered = false
	body.scale = Vector2(0.5, 0.5)
	root.add_child(body)
	_set_frame(body, "stand")
	var ap := AnimationPlayer.new()
	ap.name = "AnimationPlayer"
	root.add_child(ap)
	var lib := AnimationLibrary.new()
	var A := {}
	A["RESET"] = anim(0.1, false, [[0, "stand"]])
	A["idle"] = anim(3.2, true, [[0, "stand"], [2.75, "stand_blink"], [2.9, "stand"]], breathe(3.2, 0.006))
	var wm := breathe(1.0, 0.004)
	wm["tail"] = [[0, -0.12], [0.25, 0.2], [0.5, -0.12], [0.75, 0.2], [1.0, -0.12]]
	A["wag"] = anim(1.0, true, [[0, "stand_notail"]], wm)
	A["happy"] = anim(0.5, true, seq("wag_happy", 4, 0.125))
	A["walk"] = anim(0.6, true, seq("walk", 6, 0.1))
	A["run"] = anim(6.0 / 14.0, true, seq("run", 6, 1.0 / 14.0))
	var sh := []
	for r in 3:
		for i in 4:
			sh.append([(r * 4 + i) / 12.0, "shake_%d" % i])
	sh.append([1.0, "stand"])
	A["shake"] = anim(1.25, false, sh)
	A["jump"] = anim(1.25, false, [[0, "stand"], [0.1, "land"], [0.28, "jump_up"], [0.45, "jump_air"], [0.82, "land"], [1.05, "stand"]],
		{"y": [[0, 0.0], [0.1, 0.0], [0.28, -12.0], [0.45, -70.0], [0.6, -95.0], [0.75, -55.0], [0.82, 0.0], [1.25, 0.0]],
		 "x": [[0, 0.0], [0.28, 0.0], [0.82, 60.0], [1.25, 60.0]]})
	A["bark"] = anim(1.3, false, [[0, "bark"], [0.2, "stand"], [0.4, "bark"], [0.6, "stand"], [0.8, "bark"], [1.0, "stand"]],
		{"y": [[0, -6.0], [0.08, 0.0], [0.4, -6.0], [0.48, 0.0], [0.8, -6.0], [0.88, 0.0], [1.3, 0.0]]})
	A["sit"] = anim(4.0, true, [[0, "sit"], [3.5, "sit_blink"], [3.65, "sit"]], breathe(4.0, 0.006))
	A["tilt"] = anim(2.0, true, [[0, "tilt"]], {"rot": [[0, 0.0], [0.5, 0.05], [1.0, 0.05], [1.5, 0.0], [2.0, 0.0]]})
	A["beg"] = anim(1.2, true, [[0, "beg"]], {"y": [[0, 0.0], [0.3, -10.0], [0.6, 0.0], [0.9, -10.0], [1.2, 0.0]]})
	A["sniff"] = anim(2.4, true, [[0, "sniff"]], {"x": [[0, 0.0], [0.6, 6.0], [1.2, 2.0], [1.8, 8.0], [2.4, 0.0]],
		"rot": [[0, 0.0], [0.3, 0.015], [0.6, 0.0], [0.9, 0.015], [1.2, 0.0], [2.4, 0.0]]})
	A["dig"] = anim(0.4, true, [[0, "dig"]], {"y": [[0, 0.0], [0.1, -4.0], [0.2, 0.0], [0.3, -4.0], [0.4, 0.0]],
		"rot": [[0, 0.0], [0.1, -0.025], [0.2, 0.0], [0.3, 0.025], [0.4, 0.0]]})
	A["lie"] = anim(3.0, true, [[0, "lie"]], breathe(3.0, 0.006))
	A["sleep"] = anim(3.6, true, [[0, "sleep"]], breathe(3.6, 0.02))
	A["hide"] = anim(2.0, true, [[0, "hide"]], {"x": [[0, -8.0], [0.6, 0.0], [1.6, 0.0], [2.0, -8.0]]})
	A["front"] = anim(3.0, true, [[0, "front"]], breathe(3.0, 0.006))
	A["back"] = anim(3.0, true, [[0, "back"]], breathe(3.0, 0.006))
	A["blink"] = anim(0.3, false, [[0, "stand_blink"], [0.15, "stand"]])
	for n in A:
		lib.add_animation(n, A[n]["anim"])
	ap.add_animation_library("", lib)
	ap.autoplay = "idle"
	for c in root.get_children():
		c.owner = root
	var packed := PackedScene.new()
	packed.pack(root)
	print("saved theo.tscn: ", ResourceSaver.save(packed, "res://theo/theo.tscn"))
	root.free()
	quit()

func _set_frame(body: Sprite2D, n: String) -> void:
	body.texture = load("res://theo/" + F[n]["file"])
	body.offset = Vector2(F[n]["offset"][0], F[n]["offset"][1]) * 2.0

func seq(prefix: String, k: int, dt: float) -> Array:
	var out := []
	for i in k:
		out.append([i * dt, "%s_%d" % [prefix, i]])
	return out

func breathe(length: float, amount: float) -> Dictionary:
	return {"sy": [[0, 0.0], [length / 2.0, amount], [length, 0.0]]}

## frames: [[t, frame name]], motion: {"x"/"y": [[t, units]], "rot": [[t, rad]], "sy": [[t, extra y scale]]}
func anim(length: float, loop: bool, frames: Array, motion := {}) -> Dictionary:
	var a := Animation.new()
	a.length = length
	a.loop_mode = Animation.LOOP_LINEAR if loop else Animation.LOOP_NONE
	var tt := a.add_track(Animation.TYPE_VALUE)
	a.track_set_path(tt, NodePath("Body:texture"))
	a.value_track_set_update_mode(tt, Animation.UPDATE_DISCRETE)
	var to := a.add_track(Animation.TYPE_VALUE)
	a.track_set_path(to, NodePath("Body:offset"))
	a.value_track_set_update_mode(to, Animation.UPDATE_DISCRETE)
	for f in frames:
		a.track_insert_key(tt, f[0], load("res://theo/" + F[f[1]]["file"]))
		a.track_insert_key(to, f[0], Vector2(F[f[1]]["offset"][0], F[f[1]]["offset"][1]) * 2.0)
	# body position / rotation / scale (always keyed, so every animation resets them)
	var xs: Array = motion.get("x", [[0, 0.0]])
	var ys: Array = motion.get("y", [[0, 0.0]])
	var tp := a.add_track(Animation.TYPE_VALUE)
	a.track_set_path(tp, NodePath("Body:position"))
	var times := {}
	for k in xs + ys:
		times[float(k[0])] = true
	var tl := times.keys()
	tl.sort()
	for t in tl:
		a.track_insert_key(tp, t, Vector2(_at(xs, t), _at(ys, t)))
	var tr := a.add_track(Animation.TYPE_VALUE)
	a.track_set_path(tr, NodePath("Body:rotation"))
	for k in motion.get("rot", [[0, 0.0]]):
		a.track_insert_key(tr, k[0], k[1])
	var ts := a.add_track(Animation.TYPE_VALUE)
	a.track_set_path(ts, NodePath("Body:scale"))
	for k in motion.get("sy", [[0, 0.0]]):
		a.track_insert_key(ts, k[0], Vector2(0.5, 0.5 * (1.0 + k[1])))
	# separate wagging tail (only "wag": on stand_notail)
	var tv := a.add_track(Animation.TYPE_VALUE)
	a.track_set_path(tv, NodePath("Tail:visible"))
	a.value_track_set_update_mode(tv, Animation.UPDATE_DISCRETE)
	a.track_insert_key(tv, 0.0, motion.has("tail"))
	var trt := a.add_track(Animation.TYPE_VALUE)
	a.track_set_path(trt, NodePath("Tail:rotation"))
	for k in motion.get("tail", [[0, 0.0]]):
		a.track_insert_key(trt, k[0], k[1])
	return {"anim": a}

func _at(keys: Array, t: float) -> float:
	if t <= keys[0][0]:
		return keys[0][1]
	for i in keys.size() - 1:
		if t <= keys[i + 1][0]:
			var u: float = (t - keys[i][0]) / (keys[i + 1][0] - keys[i][0])
			return lerpf(keys[i][1], keys[i + 1][1], u)
	return keys[-1][1]
