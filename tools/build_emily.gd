extends SceneTree
## Builds res://emily/emily.tscn: Skeleton2D + Bone2D, vector body (Polygon2D),
## head slots and all animations (computed: legs use IK so feet stay on the ground).
##
## godot --headless --path . --script res://tools/build_emily.gd

const S := preload("res://emily/emily_shapes.gd")
const FPS := 30.0
const HEAD_UNITS := 142.0   # head height (top of skull -> chin) in body units

var bone_paths := {}
var bone_names := []
var layout := {}

func _init() -> void:
	var f := FileAccess.open("res://emily/head/layout.json", FileAccess.READ)
	layout = JSON.parse_string(f.get_as_text())
	var root := build_scene()
	var packed := PackedScene.new()
	var err := packed.pack(root)
	assert(err == OK)
	err = ResourceSaver.save(packed, "res://emily/emily.tscn")
	print("saved emily.tscn: ", err)
	root.free()
	quit()

func own(n: Node, root: Node) -> void:
	n.owner = root
	for c in n.get_children():
		own(c, root)

func build_scene() -> Node2D:
	var root := Node2D.new()
	root.name = "Emily"
	root.set_script(load("res://emily/emily.gd"))
	var sk := Skeleton2D.new()
	sk.name = "Skeleton2D"
	root.add_child(sk)
	var nodes := {}
	for b in S.BONES:
		var bone := Bone2D.new()
		bone.name = b[0]
		bone.position = b[2]
		bone.rest = Transform2D(0.0, b[2])
		bone.set_autocalculate_length_and_angle(false)
		var up: bool = b[0] in ["Hips", "Torso", "Neck", "Head"]
		bone.set_bone_angle(-PI / 2 if up else PI / 2)
		bone.set_length(_bone_len(b[0]))
		var parent: Node = sk if b[1] == "" else nodes[b[1]]
		parent.add_child(bone)
		nodes[b[0]] = bone
		bone_names.append(b[0])
		bone_paths[b[0]] = "Skeleton2D/" + (str(sk.get_path_to(bone)) if false else _path(b[0]))
	# skin
	for piece in S.body_pieces():
		S.make_piece_nodes(nodes[piece["bone"]], piece, S.PALETTE["skin"], S.PALETTE["skin_line"], "body")
	# head slots
	var head: Node2D = nodes["Head"]
	var s := HEAD_UNITS / (float(layout["chin"]) - float(layout["head_top"]))
	var pivot := Vector2(layout["pivot"][0], layout["pivot"][1])
	var slots := [["HairBack", S.Z_HAIR_BACK, Vector2.ZERO, "res://emily/head/hair/pigtails_back.png"],
		["HeadBase", S.Z_HEAD, Vector2.ZERO, "res://emily/head/base.png"],
		["Eyes", S.Z_HEAD + 1, Vector2(layout["eyes_rect"][0], layout["eyes_rect"][1]), "res://emily/head/eyes/open.png"],
		["Mouth", S.Z_HEAD + 2, Vector2(layout["mouth_rect"][0], layout["mouth_rect"][1]), "res://emily/head/mouth/smile.png"],
		["HairFront", S.Z_HEAD + 10, Vector2.ZERO, "res://emily/head/hair/pigtails_front.png"]]
	for sl in slots:
		var sp := Sprite2D.new()
		sp.name = sl[0]
		sp.centered = false
		sp.scale = Vector2(s, s)
		sp.position = (sl[2] - pivot) * s
		sp.z_as_relative = false
		sp.z_index = sl[1]
		sp.texture = load(sl[3])
		head.add_child(sp)
	# animation players
	var ap := AnimationPlayer.new()
	ap.name = "AnimationPlayer"
	root.add_child(ap)
	var lib := AnimationLibrary.new()
	lib.add_animation("RESET", make_body_anim("RESET", 1.0 / FPS, false, pose_rest))
	lib.add_animation("idle", make_body_anim("idle", 3.0, true, pose_idle))
	lib.add_animation("walk", make_body_anim("walk", WALK_T, true, pose_walk))
	var wave := make_body_anim("wave", 2.4, false, pose_wave)
	add_face(wave, "eyes", [[0.0, "open"], [0.35, "happy"], [2.05, "open"]])
	add_face(wave, "mouth", [[0.0, "smile"], [0.4, "a"], [0.62, "laugh"], [1.9, "smile"]])
	lib.add_animation("wave", wave)
	var jump := make_body_anim("jump", 1.4, false, pose_jump)
	add_face(jump, "eyes", [[0.0, "open"], [0.46, "happy"], [1.08, "open"]])
	add_face(jump, "mouth", [[0.0, "smile"], [0.25, "m"], [0.44, "laugh"], [1.12, "smile"]])
	lib.add_animation("jump", jump)
	var talk := make_body_anim("talk", 2.4, true, pose_talk)
	add_face(talk, "mouth", TALK_MOUTH)
	lib.add_animation("talk", talk)
	var blink := Animation.new()
	blink.length = 0.26
	add_face(blink, "eyes", BLINK_EYES)
	lib.add_animation("blink", blink)
	ap.add_animation_library("", lib)
	ap.playback_default_blend_time = 0.2
	ap.autoplay = "idle"

	var fp := AnimationPlayer.new()
	fp.name = "FacePlayer"
	root.add_child(fp)
	var flib := AnimationLibrary.new()
	var b2 := Animation.new()
	b2.length = 0.26
	add_face(b2, "eyes", BLINK_EYES)
	flib.add_animation("blink", b2)
	var t2 := Animation.new()
	t2.length = 2.4
	t2.loop_mode = Animation.LOOP_LINEAR
	add_face(t2, "mouth", TALK_MOUTH)
	flib.add_animation("talk", t2)
	fp.add_animation_library("", flib)
	own(sk, root)
	ap.owner = root
	fp.owner = root
	return root

const BLINK_EYES := [[0.0, "open"], [0.04, "half"], [0.08, "closed"], [0.16, "half"], [0.21, "open"]]
const TALK_MOUTH := [[0.0, "m"], [0.1, "a"], [0.22, "e"], [0.34, "o"], [0.46, "a"], [0.58, "m"], [0.68, "e"],
	[0.8, "a"], [0.94, "o"], [1.08, "smile"], [1.3, "a"], [1.42, "e"], [1.54, "o"], [1.66, "a"], [1.8, "m"], [1.92, "smile"]]

func _path(bname: String) -> String:
	var chain := [bname]
	var cur := bname
	while true:
		var parent := ""
		for b in S.BONES:
			if b[0] == cur:
				parent = b[1]
		if parent == "":
			break
		chain.push_front(parent)
		cur = parent
	return "/".join(chain)

func _bone_len(bname: String) -> float:
	for b in S.BONES:
		if b[1] == bname:
			return b[2].length()
	match bname:
		"Head": return 120.0
		"HandL", "HandR": return 26.0
		"FootL", "FootR": return 26.0
	return 20.0

func add_face(anim: Animation, prop: String, keys: Array) -> void:
	var t := anim.add_track(Animation.TYPE_VALUE)
	anim.track_set_path(t, NodePath(".:" + prop))
	anim.value_track_set_update_mode(t, Animation.UPDATE_DISCRETE)
	for k in keys:
		anim.track_insert_key(t, k[0], k[1])

## pose function: t -> {"rot": {bone: radians}, "hips": Vector2 (absolute), "torso": Vector2 offset}
func make_body_anim(aname: String, length: float, loop: bool, pose: Callable) -> Animation:
	var anim := Animation.new()
	anim.length = length
	anim.loop_mode = Animation.LOOP_LINEAR if loop else Animation.LOOP_NONE
	var n := int(round(length * FPS))
	var samples := []
	var count := n if loop else n + 1
	for i in count:
		samples.append(pose.call(length * i / n))
	if aname == "walk":
		_smooth_hips(samples)
	for bname in bone_names:
		var tr := anim.add_track(Animation.TYPE_VALUE)
		anim.track_set_path(tr, NodePath(bone_paths[bname] + ":rotation"))
		anim.track_set_interpolation_type(tr, Animation.INTERPOLATION_LINEAR)
		for i in samples.size():
			anim.track_insert_key(tr, length * i / n, samples[i]["rot"].get(bname, 0.0))
		if loop:
			anim.track_insert_key(tr, length, samples[0]["rot"].get(bname, 0.0))
	for pb in [["Hips", "hips"], ["Torso", "torso"]]:
		var tr := anim.add_track(Animation.TYPE_VALUE)
		anim.track_set_path(tr, NodePath(bone_paths[pb[0]] + ":position"))
		for i in samples.size():
			anim.track_insert_key(tr, length * i / n, samples[i][pb[1]])
		if loop:
			anim.track_insert_key(tr, length, samples[0][pb[1]])
	return anim

func _smooth_hips(samples: Array) -> void:
	var n := samples.size()
	for pass_i in 3:
		var ys := []
		for i in n:
			ys.append(samples[i]["hips"].y)
		for i in n:
			var y: float = (ys[(i - 1 + n) % n] + 2.0 * ys[i] + ys[(i + 1) % n]) / 4.0
			samples[i]["hips"] = Vector2(samples[i]["hips"].x, y)
	# legs must be re-solved after smoothing the hips
	for smp in samples:
		_solve_legs(smp)

# ------------------------------------------------------------------ helpers
static func deg(v: float) -> float:
	return deg_to_rad(v)

## Smooth curve through keys [[t, v], ...] (cubic Hermite, Catmull-Rom tangents, flat ends).
static func curve(keys: Array, t: float) -> float:
	if t <= keys[0][0]:
		return keys[0][1]
	if t >= keys[-1][0]:
		return keys[-1][1]
	var i := 0
	while i < keys.size() - 2 and t > keys[i + 1][0]:
		i += 1
	var t0: float = keys[i][0]
	var t1: float = keys[i + 1][0]
	var v0: float = keys[i][1]
	var v1: float = keys[i + 1][1]
	var h := t1 - t0
	var m0 := 0.0
	var m1 := 0.0
	if i > 0:
		m0 = (v1 - keys[i - 1][1]) / (t1 - keys[i - 1][0]) * h
	if i + 2 < keys.size():
		m1 = (keys[i + 2][1] - v0) / (keys[i + 2][0] - t0) * h
	var u := (t - t0) / h
	var u2 := u * u
	var u3 := u2 * u
	return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * m1

static func smooth01(x: float) -> float:
	x = clampf(x, 0.0, 1.0)
	return x * x * (3.0 - 2.0 * x)

## ankle height above ground so that the lowest sole point touches y=0 for foot angle phi
static func ankle_y_for(phi: float) -> float:
	var m := -1e9
	for p in S.SOLE:
		m = maxf(m, (p as Vector2).rotated(phi).y)
	return -m

func base_pose() -> Dictionary:
	return {"rot": {}, "hips": S.local_pos("Hips"), "torso": S.local_pos("Torso"),
		"ankle": {"L": null, "R": null}, "foot": {"L": 0.0, "R": 0.0}, "hips_rot": 0.0}

## Solves both legs with IK: ankle targets in pose["ankle"] (null = planted at rest),
## foot global angle in pose["foot"].
func _solve_legs(p: Dictionary) -> void:
	var hips_rot: float = p["hips_rot"]
	p["rot"]["Hips"] = hips_rot
	for s in ["L", "R"]:
		var hip: Vector2 = p["hips"] + S.local_pos("Thigh" + s).rotated(hips_rot)
		var target = p["ankle"][s]
		if target == null:
			target = S.rest_global("Foot" + s) + Vector2(0, ankle_y_for(p["foot"][s]) - S.rest_global("Foot" + s).y)
		var ik := S.leg_ik(hip, target, hips_rot)
		p["rot"]["Thigh" + s] = ik[0]
		p["rot"]["Shin" + s] = ik[1]
		var shin_g: float = hips_rot + ik[0] + ik[1]
		p["rot"]["Foot" + s] = p["foot"][s] - shin_g

# ------------------------------------------------------------------ poses
func pose_rest(_t: float) -> Dictionary:
	var p := base_pose()
	for b in bone_names:
		p["rot"][b] = 0.0
	return p

func pose_idle(t: float) -> Dictionary:
	var p := base_pose()
	var ph := TAU * t / 3.0
	var b := sin(ph)
	p["hips"] += Vector2(0, 1.6 + 0.7 * b)
	p["torso"] += Vector2(0, -0.9 * (b + 1.0))
	p["rot"]["Torso"] = deg(0.8 + 0.6 * b)
	p["rot"]["Neck"] = deg(-0.5)
	p["rot"]["Head"] = deg(1.5 * sin(ph - 0.7))
	p["rot"]["UpperArmR"] = deg(4.0 + 1.2 * b)
	p["rot"]["UpperArmL"] = deg(-3.0 - 1.2 * b)
	p["rot"]["ForearmR"] = deg(-8.0 - 2.0 * sin(ph - 0.5))
	p["rot"]["ForearmL"] = deg(-9.0 - 2.0 * sin(ph - 0.5))
	p["rot"]["HandR"] = deg(-3.0)
	p["rot"]["HandL"] = deg(-4.0)
	_solve_legs(p)
	return p

const WALK_T := 0.9
const STRIDE := 125.0
const DUTY := 0.6

func _walk_foot(q: float) -> Array:
	# returns [x offset from hip, lift above ground, foot global angle]
	var x := 0.0
	var lift := 0.0
	var phi := 0.0
	if q < DUTY:
		x = STRIDE / 2.0 - STRIDE * q / DUTY
		if q < 0.1:
			phi = lerpf(-14.0, 0.0, smooth01(q / 0.1))
		elif q > 0.42:
			phi = 20.0 * smooth01((q - 0.42) / (DUTY - 0.42))
	else:
		var s := (q - DUTY) / (1.0 - DUTY)
		x = -STRIDE / 2.0 + STRIDE * (0.5 - 0.5 * cos(PI * s))
		lift = 26.0 * pow(sin(PI * pow(s, 0.8)), 1.2)
		if s < 0.35:
			phi = lerpf(20.0, 0.0, smooth01(s / 0.35))
		else:
			phi = lerpf(0.0, -14.0, smooth01((s - 0.35) / 0.65))
	return [x, lift, deg(phi)]

func pose_walk(t: float) -> Dictionary:
	var p := base_pose()
	var ph := t / WALK_T
	var hips_rot := deg(1.8 * sin(TAU * ph))
	p["hips_rot"] = hips_rot
	var lowest := -1e9
	var R := 0.982 * (S.THIGH_LEN + S.SHIN_LEN)
	var feet := {}
	for s in ["R", "L"]:
		var q := fposmod(ph + (0.0 if s == "R" else 0.5), 1.0)
		var w := _walk_foot(q)
		var hip_x: float = S.local_pos("Thigh" + s).x
		var ankle := Vector2(hip_x + w[0], ankle_y_for(w[2]) - w[1])
		feet[s] = ankle
		p["ankle"][s] = ankle
		p["foot"][s] = w[2]
		if q < DUTY:
			var dx := ankle.x - hip_x
			var hy := ankle.y - sqrt(maxf(R * R - dx * dx, 1.0))
			lowest = maxf(lowest, hy - S.local_pos("Thigh" + s).y)
	p["hips"] = Vector2(0, lowest)
	var lean := 4.5
	p["rot"]["Torso"] = deg(lean + 1.2 * sin(TAU * 2.0 * ph + 0.6)) - hips_rot * 0.6
	p["rot"]["Neck"] = deg(-1.5)
	p["rot"]["Head"] = deg(-lean * 0.6 + 1.6 * sin(TAU * 2.0 * ph + 1.4))
	for s in ["R", "L"]:
		var aph := TAU * (ph + (0.0 if s == "R" else 0.5))
		p["rot"]["UpperArm" + s] = deg(24.0 * cos(aph - 0.25) - 3.0)
		p["rot"]["Forearm" + s] = deg(-(22.0 - 13.0 * cos(aph - 0.7)))
		p["rot"]["Hand" + s] = deg(-6.0 - 5.0 * cos(aph - 1.0))
	_solve_legs(p)
	return p

func pose_wave(t: float) -> Dictionary:
	var p := pose_idle(fmod(t, 3.0))
	var e := smooth01(t / 0.42) * (1.0 - smooth01((t - 1.95) / 0.42))
	var w := 0.0
	if t > 0.3:
		w = sin(TAU * (t - 0.3) / 0.5) * smooth01((t - 0.3) / 0.25) * (1.0 - smooth01((t - 1.75) / 0.3))
	var wl := 0.0
	if t > 0.36:
		wl = sin(TAU * (t - 0.36) / 0.5) * smooth01((t - 0.36) / 0.25) * (1.0 - smooth01((t - 1.8) / 0.3))
	p["rot"]["UpperArmR"] = lerpf(p["rot"]["UpperArmR"], deg(122.0 + 3.0 * w), e)
	p["rot"]["ForearmR"] = lerpf(p["rot"]["ForearmR"], deg(22.0 + 20.0 * w), e)
	p["rot"]["HandR"] = lerpf(p["rot"]["HandR"], deg(6.0 + 14.0 * wl), e)
	p["rot"]["Torso"] += deg(-2.5) * e
	p["rot"]["Head"] += deg(6.0 + 1.5 * w) * e
	p["rot"]["ForearmL"] += deg(-8.0) * e
	_solve_legs(p)
	return p

func pose_jump(t: float) -> Dictionary:
	var p := base_pose()
	var hy := curve([[0.0, 0.0], [0.28, 38.0], [0.40, 4.0], [0.48, -46.0], [0.68, -100.0], [0.88, -40.0],
		[0.97, 2.0], [1.06, 30.0], [1.2, 6.0], [1.4, 0.0]], t)
	var tuck := curve([[0.0, 0.0], [0.46, 0.0], [0.64, 1.0], [0.78, 1.0], [0.93, 0.0], [1.4, 0.0]], t)
	var air := smooth01((-hy - 4.0) / 26.0)
	p["hips"] += Vector2(0, hy)
	var lean := curve([[0.0, 0.0], [0.28, 14.0], [0.42, -3.0], [0.68, -6.0], [0.95, 4.0], [1.06, 13.0], [1.4, 0.0]], t)
	p["rot"]["Torso"] = deg(lean)
	p["rot"]["Neck"] = 0.0
	p["rot"]["Head"] = deg(curve([[0.0, 0.0], [0.28, -8.0], [0.68, -9.0], [1.06, -6.0], [1.4, 0.0]], t))
	# near arm (R) goes forward-up but stays below the face, far arm (L) goes high behind the head
	var arm := curve([[0.0, 0.0], [0.28, 42.0], [0.46, -88.0], [0.68, -100.0], [0.92, -55.0], [1.06, -8.0], [1.4, 0.0]], t)
	var arm2 := curve([[0.0, 0.0], [0.3, 40.0], [0.49, -140.0], [0.7, -165.0], [0.95, -60.0], [1.1, -6.0], [1.4, 0.0]], t)
	p["rot"]["UpperArmR"] = deg(arm)
	p["rot"]["UpperArmL"] = deg(arm2)
	var fa := curve([[0.0, -6.0], [0.28, -10.0], [0.5, -20.0], [0.7, -12.0], [1.06, -18.0], [1.4, -6.0]], t)
	p["rot"]["ForearmR"] = deg(fa + 4.0 * curve([[0.0, 0.0], [0.4, 0.0], [0.6, 1.0], [0.9, 1.0], [1.1, 0.0], [1.4, 0.0]], t))
	p["rot"]["ForearmL"] = deg(fa - 4.0)
	p["rot"]["HandR"] = deg(-5.0)
	p["rot"]["HandL"] = deg(-5.0)
	for s in ["L", "R"]:
		var hip: Vector2 = p["hips"] + S.local_pos("Thigh" + s)
		var phi := deg(22.0 * air)
		var ground := Vector2(hip.x, ankle_y_for(phi))
		var reach := 0.999 * (S.THIGH_LEN + S.SHIN_LEN)
		if hip.distance_to(ground) > reach - 0.5 or tuck > 0.0:
			var hang := hip + Vector2(0, reach)
			var tucked := hip + Vector2(-34.0, 128.0) + Vector2(-8.0 if s == "L" else 0.0, -6.0 if s == "L" else 0.0)
			var tgt := hang.lerp(tucked, tuck)
			if tgt.y > ground.y:
				tgt = ground
			p["ankle"][s] = tgt
		else:
			p["ankle"][s] = ground
		p["foot"][s] = phi
	_solve_legs(p)
	return p

func pose_talk(t: float) -> Dictionary:
	var p := pose_idle(t * 1.25)
	var g := curve([[0.0, 0.0], [0.45, 1.0], [1.4, 1.0], [1.9, 0.0], [2.4, 0.0]], t)
	var beat := sin(TAU * t / 0.48)
	p["rot"]["UpperArmR"] = lerpf(p["rot"]["UpperArmR"], deg(-14.0), g)
	p["rot"]["ForearmR"] = lerpf(p["rot"]["ForearmR"], deg(-62.0 + 7.0 * beat), g)
	p["rot"]["HandR"] = lerpf(p["rot"]["HandR"], deg(-12.0 + 6.0 * beat), g)
	p["rot"]["Head"] += deg(2.6 * sin(TAU * t / 1.2) + 1.5 * sin(TAU * t / 0.8))
	p["rot"]["Neck"] += deg(1.0 * sin(TAU * t / 2.4))
	p["rot"]["Torso"] += deg(1.0 * sin(TAU * t / 2.4))
	_solve_legs(p)
	return p
