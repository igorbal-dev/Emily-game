extends SceneTree
## Сборщик Эмили: создаёт scenes/emily.tscn — скелет (Skeleton2D + Bone2D),
## картинки частей на костях и все анимации.
##
## Запуск (из папки проекта):
##   godot --headless --path . --script res://editor_tools/build_emily.gd
##
## Все координаты — в пикселях «скелета»: 1 пиксель оригинала emily_idle.png = 1.5 пикселя.
## Начало координат — между ступнями, на полу. Ось Y смотрит вниз (как в Godot).
## Углы костей — «куда смотрит кость» в градусах: 90 = вниз, -90 = вверх, 0 = вправо, 180 = влево.
## R = левая сторона экрана (правая рука Эмили), L = правая сторона экрана.

const P := "res://assets/emily/parts/"
const OUT := "res://scenes/emily.tscn"

# --- Опорные точки деталей (в пикселях картинок из assets/emily/parts) ---
const TORSO_HIP := Vector2(102, 246)       # низ туловища (сустав с тазом)
const TORSO_NECK := Vector2(102, 29)       # шея (сустав с головой)
const TORSO_SHOULDER_R := Vector2(36, 57)
const TORSO_SHOULDER_L := Vector2(167, 57)
const PELVIS_TOP := Vector2(75, 22)       # где таз крепится к кости Hips
const PELVIS_HIP_R := Vector2(36, 52)     # тазобедренные суставы
const PELVIS_HIP_L := Vector2(114, 52)
const HEAD_NECK := Vector2(107, 212)      # шея на картинке головы
const HEAD_EYE_R := Vector2(72, 124)
const HEAD_EYE_L := Vector2(142, 124)
const HEAD_MOUTH := Vector2(107, 170)
const HEAD_FACE := Vector2(107, 150)      # носик и румянец
const HEAD_HAIR := Vector2(107, 40)       # куда на голове ставится точка HAIR_ON_HEAD волос
const HAIR_ON_HEAD := Vector2(207, 112)
const FACE_DETAILS_CENTER := Vector2(75, 28)

# --- Опорные точки поз (из оригинала) ---
const HIPS_POS := Vector2(-12, -264)
const NECK_TARGET := Vector2(-7.5, -471)
const HEAD_TILT := 9.0                    # наклон головы, как на оригинале
const WRIST_R := Vector2(-33, -262)
const ELBOW_R := Vector2(-104, -338)    # локти — как на оригинале
const ELBOW_L := Vector2(68, -356)       # кисти сложены перед собой
const WRIST_L := Vector2(15, -262)
const ANKLE_R := Vector2(-60, -72)
const ANKLE_L := Vector2(4, -72)

var anchors := {}
var bones := {}          # имя -> Bone2D
var order: Array = []    # кости в порядке от корня
var parent_of := {}
var rest_local := {}     # имя -> {pos, rot}
var length := {}         # длина кости (до следующего сустава)
var scene_root: Node2D
var skel: Skeleton2D


func _init() -> void:
	anchors = JSON.parse_string(FileAccess.get_file_as_string(P + "anchors.json"))
	scene_root = Node2D.new()
	scene_root.name = "Emily"
	scene_root.set_script(load("res://scripts/emily.gd"))
	skel = Skeleton2D.new()
	skel.name = "Skeleton"
	_add(scene_root, skel)
	_build_skeleton()
	_build_animations()
	var ps := PackedScene.new()
	var err := ps.pack(scene_root)
	assert(err == OK)
	err = ResourceSaver.save(ps, OUT)
	print("Сохранено: ", OUT, " (код ", err, ")")
	scene_root.free()
	quit()


# ---------------------------------------------------------------- помощники
func _add(parent: Node, child: Node) -> void:
	parent.add_child(child)
	child.owner = scene_root


func _a(name: String, key: String) -> Vector2:
	var v: Array = anchors[name][key]
	return Vector2(v[0], v[1])


func _make_bone(name: String, parent: Node, parent_name: String, g_pos: Vector2, g_ang: float,
		parent_g: Transform2D, bone_len: float) -> Transform2D:
	var b := Bone2D.new()
	b.name = name
	var g := Transform2D(deg_to_rad(g_ang), g_pos)
	var local := parent_g.affine_inverse() * g
	b.transform = local
	b.rest = local
	b.set_autocalculate_length_and_angle(false)
	b.set_length(max(bone_len, 8.0))
	b.set_bone_angle(0.0)
	_add(parent, b)
	bones[name] = b
	order.append(name)
	parent_of[name] = parent_name
	rest_local[name] = {"pos": local.origin, "rot": local.get_rotation()}
	length[name] = bone_len
	return g


## Картинка на кости: точка anchor картинки — в начале кости,
## направление tex_dir (угол в картинке) — вдоль кости.
func _sprite(bone: Node, name: String, tex: String, anchor: Vector2, tex_dir: float, z: int,
		visible := true) -> Sprite2D:
	var s := Sprite2D.new()
	s.name = name
	s.texture = load(P + tex + ".png")
	s.centered = false
	s.offset = -anchor
	s.rotation = deg_to_rad(-tex_dir)
	s.z_index = z
	s.visible = visible
	_add(bone, s)
	return s


## Точка картинки (на кости с глобальным преобразованием g) -> глобальные координаты.
func _tex_to_global(g: Transform2D, anchor: Vector2, tex_dir: float, p: Vector2) -> Vector2:
	return g * (p - anchor).rotated(deg_to_rad(-tex_dir))


func _dir_deg(a: Vector2, b: Vector2) -> float:
	return rad_to_deg((b - a).angle())


func _limb_len(name: String) -> float:
	return _a(name, "top").distance_to(_a(name, "bottom"))


## Решение «двух костей»: откуда (start), куда (target), длины a и b.
## bend_sign выбирает, куда сгибается сустав (+1 / -1). Возвращает [угол1, угол2] в градусах.
func _ik(start: Vector2, target: Vector2, a: float, b: float, bend_sign: float) -> Array:
	var d := clampf(start.distance_to(target), absf(a - b) + 0.5, a + b - 0.01)
	var base := (target - start).angle()
	var cos_al := clampf((a * a + d * d - b * b) / (2.0 * a * d), -1.0, 1.0)
	var al := acos(cos_al)
	var a1 := base + bend_sign * al
	var mid := start + Vector2.from_angle(a1) * a
	var a2 := (target - mid).angle()
	return [rad_to_deg(a1), rad_to_deg(a2)]


# ---------------------------------------------------------------- скелет
var g_rest := {}   # имя -> глобальное преобразование в позе покоя

func _build_skeleton() -> void:
	var I := Transform2D.IDENTITY
	# Таз и туловище
	var spine_ang := _dir_deg(HIPS_POS, NECK_TARGET)
	var torso_len := TORSO_HIP.distance_to(TORSO_NECK)
	var g_hips := _make_bone("Hips", skel, "", HIPS_POS, spine_ang, I, 40.0)
	g_rest["Hips"] = g_hips
	_sprite(bones["Hips"], "Pelvis", "pelvis", PELVIS_TOP, -90.0, 4)
	var g_spine := _make_bone("Spine", bones["Hips"], "Hips", HIPS_POS, spine_ang, g_hips, torso_len)
	g_rest["Spine"] = g_spine
	_sprite(bones["Spine"], "Torso", "torso", TORSO_HIP, -90.0, 6)

	# Голова
	var neck := _tex_to_global(g_spine, TORSO_HIP, -90.0, TORSO_NECK)
	var g_head := _make_bone("Head", bones["Spine"], "Spine", neck, -90.0 + HEAD_TILT, g_spine, 200.0)
	g_rest["Head"] = g_head
	var hb: Node = bones["Head"]
	_face_sprite(hb, "HairBack", "hair_back", HEAD_HAIR, HAIR_ON_HEAD, 7)
	_sprite(hb, "HeadBase", "head", HEAD_NECK, -90.0, 8)
	_face_sprite(hb, "FaceDetails", "face_details", HEAD_FACE, FACE_DETAILS_CENTER, 9)
	_face_sprite(hb, "EyeR", "eye_r", HEAD_EYE_R, Vector2(27, 28.5), 10)
	_face_sprite(hb, "EyeL", "eye_l", HEAD_EYE_L, Vector2(27, 29), 10)
	_face_sprite(hb, "EyeRClosed", "eye_r_closed", HEAD_EYE_R, Vector2(27, 28.5), 10, false)
	_face_sprite(hb, "EyeLClosed", "eye_l_closed", HEAD_EYE_L, Vector2(27, 29), 10, false)
	_face_sprite(hb, "Mouth", "mouth", HEAD_MOUTH, Vector2(24, 10), 10)
	_face_sprite(hb, "Hair", "hair", HEAD_HAIR, HAIR_ON_HEAD, 11)

	# Руки
	for side in ["R", "L"]:
		var s: String = side.to_lower()
		var sh_tex := TORSO_SHOULDER_R if side == "R" else TORSO_SHOULDER_L
		var shoulder := _tex_to_global(g_spine, TORSO_HIP, -90.0, sh_tex)
		var ua := "upper_arm_" + s
		var fa := "forearm_" + s
		var hd := "hand_" + s
		var la := _limb_len(ua)
		var lb := _limb_len(fa)
		var wrist := WRIST_R if side == "R" else WRIST_L
		var elbow_t := ELBOW_R if side == "R" else ELBOW_L
		var ang := [_dir_deg(shoulder, elbow_t), 0.0]
		ang[1] = _dir_deg(shoulder + Vector2.from_angle(deg_to_rad(ang[0])) * la, wrist)
		var g_ua := _make_bone("UpperArm" + side, bones["Spine"], "Spine", shoulder, ang[0], g_spine, la)
		_sprite(bones["UpperArm" + side], "UpperArm", ua, _a(ua, "top"), _dir_deg(_a(ua, "top"), _a(ua, "bottom")), 5)
		var elbow := shoulder + Vector2.from_angle(deg_to_rad(ang[0])) * la
		var g_fa := _make_bone("Forearm" + side, bones["UpperArm" + side], "UpperArm" + side, elbow, ang[1], g_ua, lb)
		_sprite(bones["Forearm" + side], "Forearm", fa, _a(fa, "top"), _dir_deg(_a(fa, "top"), _a(fa, "bottom")), 12)
		var w2 := elbow + Vector2.from_angle(deg_to_rad(ang[1])) * lb
		var hand_ang := 72.0 if side == "R" else 108.0
		var g_hd := _make_bone("Hand" + side, bones["Forearm" + side], "Forearm" + side, w2, hand_ang, g_fa, _limb_len(hd))
		_sprite(bones["Hand" + side], "Hand", hd, _a(hd, "top"), _dir_deg(_a(hd, "top"), _a(hd, "bottom")), 13 if side == "L" else 14)
		g_rest["UpperArm" + side] = g_ua
		g_rest["Forearm" + side] = g_fa
		g_rest["Hand" + side] = g_hd

	# Ноги
	for side in ["R", "L"]:
		var s: String = side.to_lower()
		var hip_tex := PELVIS_HIP_R if side == "R" else PELVIS_HIP_L
		var hip := _tex_to_global(g_hips, PELVIS_TOP, -90.0, hip_tex)
		var th := "thigh_" + s
		var sn := "shin_" + s
		var ft := "foot_" + s
		var la := _limb_len(th)
		var lb := _limb_len(sn)
		var ankle := ANKLE_R if side == "R" else ANKLE_L
		# колени чуть внутрь, как на оригинале
		var ang := _ik(hip, ankle, la, lb, -1.0 if side == "R" else 1.0)
		var g_th := _make_bone("Thigh" + side, bones["Hips"], "Hips", hip, ang[0], g_hips, la)
		_sprite(bones["Thigh" + side], "Thigh", th, _a(th, "top"), _dir_deg(_a(th, "top"), _a(th, "bottom")), 2)
		var knee := hip + Vector2.from_angle(deg_to_rad(ang[0])) * la
		var g_sn := _make_bone("Shin" + side, bones["Thigh" + side], "Thigh" + side, knee, ang[1], g_th, lb)
		_sprite(bones["Shin" + side], "Shin", sn, _a(sn, "top"), _dir_deg(_a(sn, "top"), _a(sn, "bottom")), 3)
		var a2 := knee + Vector2.from_angle(deg_to_rad(ang[1])) * lb
		var g_ft := _make_bone("Foot" + side, bones["Shin" + side], "Shin" + side, a2, 90.0, g_sn, _limb_len(ft))
		_sprite(bones["Foot" + side], "Foot", ft, _a(ft, "top"), _dir_deg(_a(ft, "top"), _a(ft, "bottom")), 1)
		g_rest["Thigh" + side] = g_th
		g_rest["Shin" + side] = g_sn
		g_rest["Foot" + side] = g_ft
		print(side, ": бедро ", la, ", голень ", lb, ", от бедра до щиколотки ", hip.distance_to(ankle),
			", низ стопы y=", (a2 + Vector2(0, _a(ft, "bottom").y - _a(ft, "top").y + float(anchors[ft]["r_bottom"]))).y)


## Детали лица: ставим точку tex_pt картинки в точку head_pt картинки головы.
func _face_sprite(head_bone: Node, name: String, tex: String, head_pt: Vector2, tex_pt: Vector2,
		z: int, visible := true) -> void:
	var s := Sprite2D.new()
	s.name = name
	s.texture = load(P + tex + ".png")
	s.centered = false
	# голова повёрнута так, что её «вверх» идёт вдоль кости (+X): поворот картинки на 90°
	s.rotation = deg_to_rad(90.0)
	s.offset = (head_pt - HEAD_NECK) - tex_pt
	s.z_index = z
	s.visible = visible
	_add(head_bone, s)


# ---------------------------------------------------------------- позы
## Поза — словарь:
##   hips: Vector2 (сдвиг таза), hips_rot / spine / head: градусы (добавка к покою),
##   arm_R / arm_L: {"ik": точка кисти (в координатах тела в покое), "bend": ±1, "hand": угол кисти}
##                  или {"ua": угол, "fa": угол, "hand": угол} (углы «как в покое тела»),
##   leg_R / leg_L: {"ik": точка щиколотки (в координатах пола), "bend": ±1, "lift": 0..1 (сокращение бедра)},
##   spine_scale: Vector2, eyes: "open"/"closed".
## Результат — значения для дорожек анимации.
func _pose(p: Dictionary) -> Dictionary:
	var out := {}
	var hips_off: Vector2 = p.get("hips", Vector2.ZERO)
	var hips_rot: float = p.get("hips_rot", 0.0)
	var spine_rot: float = p.get("spine", 0.0)
	var head_rot: float = p.get("head", 0.0)
	out["Hips:position"] = rest_local["Hips"]["pos"] + hips_off
	out["Hips:rotation"] = rest_local["Hips"]["rot"] + deg_to_rad(hips_rot)
	out["Spine:rotation"] = rest_local["Spine"]["rot"] + deg_to_rad(spine_rot)
	out["Head:rotation"] = rest_local["Head"]["rot"] + deg_to_rad(head_rot)
	out["Spine:scale"] = p.get("spine_scale", Vector2.ONE)

	# Глобальные преобразования таза и туловища в этой позе
	var g_hips := Transform2D(rest_local["Hips"]["rot"] + deg_to_rad(hips_rot), out["Hips:position"])
	var g_spine := g_hips * Transform2D(out["Spine:rotation"], rest_local["Spine"]["pos"])
	g_spine = g_spine.scaled_local(out["Spine:scale"])
	# «тело в покое» -> «тело в позе» (для целей рук)
	var body_map: Transform2D = g_spine * g_rest["Spine"].affine_inverse()

	var knees := {}
	for side in ["R", "L"]:
		var leg: Dictionary = p.get("leg_" + side, {})
		var target: Vector2 = leg.get("ik", ANKLE_R if side == "R" else ANKLE_L)
		var lift: float = leg.get("lift", 0.0)
		var hip := g_hips * (rest_local["Thigh" + side]["pos"] as Vector2)
		var la: float = length["Thigh" + side] * (1.0 - lift)
		var lb: float = length["Shin" + side]
		var bend: float = leg.get("bend", -1.0 if side == "R" else 1.0)
		var r := _ik(hip, target, la, lb, bend)
		knees[side] = hip + Vector2.from_angle(deg_to_rad(r[0])) * la
		var hips_g := g_hips.get_rotation()
		out["Thigh" + side + ":rotation"] = deg_to_rad(r[0]) - hips_g
		out["Thigh" + side + ":scale"] = Vector2(1.0 - lift, 1.0)
		out["Shin" + side + ":rotation"] = deg_to_rad(r[1]) - deg_to_rad(r[0])
		var foot_ang: float = deg_to_rad(leg.get("foot", 90.0))
		out["Foot" + side + ":rotation"] = foot_ang - deg_to_rad(r[1])
	for side in ["R", "L"]:
		if not p.has("arm_" + side):   # рука не задана — как в покое
			out["UpperArm" + side + ":rotation"] = rest_local["UpperArm" + side]["rot"]
			out["Forearm" + side + ":rotation"] = rest_local["Forearm" + side]["rot"]
			out["Hand" + side + ":rotation"] = rest_local["Hand" + side]["rot"]
			continue
		var arm: Dictionary = p["arm_" + side]
		var g_sh: Transform2D = g_spine * Transform2D(0.0, rest_local["UpperArm" + side]["pos"])
		var shoulder := g_sh.origin
		var spine_g_ang := g_spine.get_rotation()
		var ua_ang: float
		var fa_ang: float
		if arm.has("ik") or arm.has("knee"):
			# цель кисти: точка тела или колено (например, руки на коленях в приседе)
			var target: Vector2 = (knees[arm["knee"]] + Vector2(0, -6)) if arm.has("knee") else body_map * (arm["ik"] as Vector2)
			var bend: float = arm.get("bend", -1.0 if side == "R" else 1.0)
			var r := _ik(shoulder, target, length["UpperArm" + side], length["Forearm" + side], bend)
			ua_ang = deg_to_rad(r[0])
			fa_ang = deg_to_rad(r[1])
		else:
			ua_ang = deg_to_rad(arm["ua"]) + (spine_g_ang - g_rest["Spine"].get_rotation())
			fa_ang = deg_to_rad(arm["fa"]) + (spine_g_ang - g_rest["Spine"].get_rotation())
		var hand_ang: float
		if arm.has("hand"):
			hand_ang = deg_to_rad(arm["hand"]) + (spine_g_ang - g_rest["Spine"].get_rotation())
		else:
			hand_ang = fa_ang + (g_rest["Hand" + side].get_rotation() - g_rest["Forearm" + side].get_rotation())
		out["UpperArm" + side + ":rotation"] = ua_ang - spine_g_ang
		out["Forearm" + side + ":rotation"] = fa_ang - ua_ang
		out["Hand" + side + ":rotation"] = hand_ang - fa_ang

	var eyes_closed: bool = p.get("eyes", "open") == "closed"
	out["Eyes"] = eyes_closed
	return out


const PATHS := {
	"Hips": "Skeleton/Hips",
	"Spine": "Skeleton/Hips/Spine",
	"Head": "Skeleton/Hips/Spine/Head",
	"UpperArmR": "Skeleton/Hips/Spine/UpperArmR",
	"ForearmR": "Skeleton/Hips/Spine/UpperArmR/ForearmR",
	"HandR": "Skeleton/Hips/Spine/UpperArmR/ForearmR/HandR",
	"UpperArmL": "Skeleton/Hips/Spine/UpperArmL",
	"ForearmL": "Skeleton/Hips/Spine/UpperArmL/ForearmL",
	"HandL": "Skeleton/Hips/Spine/UpperArmL/ForearmL/HandL",
	"ThighR": "Skeleton/Hips/ThighR",
	"ShinR": "Skeleton/Hips/ThighR/ShinR",
	"FootR": "Skeleton/Hips/ThighR/ShinR/FootR",
	"ThighL": "Skeleton/Hips/ThighL",
	"ShinL": "Skeleton/Hips/ThighL/ShinL",
	"FootL": "Skeleton/Hips/ThighL/ShinL/FootL",
}


## keys: массив [время, поза]. Последний ключ должен совпадать с первым для зацикливания.
func _anim(keys: Array, length_s: float, loop := true) -> Animation:
	var anim := Animation.new()
	anim.length = length_s
	anim.loop_mode = Animation.LOOP_LINEAR if loop else Animation.LOOP_NONE
	var poses: Array = []
	for k in keys:
		poses.append([k[0], _pose(k[1])])
	var props: Array = poses[0][1].keys()
	for prop in props:
		if prop == "Eyes":
			for eye in [["EyeR", false], ["EyeL", false], ["EyeRClosed", true], ["EyeLClosed", true]]:
				var t := anim.add_track(Animation.TYPE_VALUE)
				anim.track_set_path(t, NodePath(PATHS["Head"] + "/" + eye[0] + ":visible"))
				anim.value_track_set_update_mode(t, Animation.UPDATE_DISCRETE)
				for pk in poses:
					var closed: bool = pk[1]["Eyes"]
					anim.track_insert_key(t, pk[0], closed if eye[1] else not closed)
			continue
		var parts: PackedStringArray = (prop as String).split(":")
		var t := anim.add_track(Animation.TYPE_VALUE)
		anim.track_set_path(t, NodePath(PATHS[parts[0]] + ":" + parts[1]))
		anim.track_set_interpolation_type(t, Animation.INTERPOLATION_CUBIC)
		anim.track_set_interpolation_loop_wrap(t, true)
		var prev = null
		for pk in poses:
			var v = pk[1][prop]
			if parts[1] == "rotation" and prev != null:
				# без скачков через 360°
				while v - prev > PI:
					v -= TAU
				while v - prev < -PI:
					v += TAU
			anim.track_insert_key(t, pk[0], v)
			prev = v
	return anim


# ---------------------------------------------------------------- анимации
## Рука при беге: согнута в локте, качается вперёд-назад (k от -1 до 1).
func _run_arm(k: float, mirror: bool) -> Dictionary:
	var ua := 104.0 + 10.0 * k
	var fa := 62.0 - 22.0 * k
	var hand := 70.0 - 18.0 * k
	if mirror:
		return {"ua": 180.0 - ua, "fa": 180.0 - fa, "hand": 180.0 - hand}
	return {"ua": ua, "fa": fa, "hand": hand}


func _build_animations() -> void:
	var lib := AnimationLibrary.new()
	var rest := {}
	lib.add_animation("RESET", _anim([[0.0, rest]], 0.001, false))

	# 1. Стоит: дышит и моргает (руки сложены, как на оригинале)
	var inhale := {"spine_scale": Vector2(1.025, 1.0), "head": 1.5, "hips": Vector2(0, -1)}
	var blink := {"eyes": "closed"}
	lib.add_animation("idle", _anim([
		[0.0, rest],
		[1.4, inhale],
		[2.2, {"spine_scale": Vector2(1.012, 1.0), "head": 0.8}],
		[2.25, {"spine_scale": Vector2(1.011, 1.0), "head": 0.7, "eyes": "closed"}],
		[2.4, {"spine_scale": Vector2(1.008, 1.0), "head": 0.5}],
		[3.2, rest],
	], 3.2))

	# 2. Машет рукой (правая рука Эмили = левая на экране)
	var wave_a := {"head": -4.0, "spine": -2.0,
		"arm_R": {"ua": -160.0, "fa": -78.0, "hand": -80.0},
		"arm_L": {"ua": 82.0, "fa": 92.0, "hand": 92.0}}
	var wave_b := wave_a.duplicate(true)
	wave_b["arm_R"] = {"ua": -158.0, "fa": -112.0, "hand": -118.0}
	var up := wave_a.duplicate(true)
	lib.add_animation("wave", _anim([
		[0.0, rest],
		[0.35, wave_a],
		[0.6, wave_b],
		[0.85, wave_a],
		[1.1, wave_b],
		[1.35, wave_a],
		[1.6, wave_b],
		[1.85, up],
		[2.3, rest],
	], 2.3))

	# 3. Идёт (шаг на месте, лицом к нам: колено поднимается, руки качаются)
	var arms_swing := func(k: float) -> Dictionary:
		return {"arm_R": {"ua": 100.0 + 12.0 * k, "fa": 84.0 + 16.0 * k, "hand": 86.0 + 12.0 * k},
				"arm_L": {"ua": 80.0 + 12.0 * k, "fa": 96.0 + 16.0 * k, "hand": 94.0 + 12.0 * k}}
	var step := func(side: String, k: float, lift: float, raise: float, bob: float, sway: float) -> Dictionary:
		var p: Dictionary = arms_swing.call(k)
		p["hips"] = Vector2(0, bob)
		p["hips_rot"] = sway
		p["spine"] = -sway * 0.6
		p["head"] = -sway * 0.3
		var other := "L" if side == "R" else "R"
		var ank := ANKLE_R if side == "R" else ANKLE_L
		p["leg_" + side] = {"ik": ank + Vector2(0, -raise), "lift": lift, "bend": 1.0 if side == "R" else -1.0}
		p["leg_" + other] = {}
		return p
	lib.add_animation("walk", _anim([
		[0.0, step.call("R", 1.0, 0.0, 0.0, 0.0, 0.0)],
		[0.25, step.call("R", 0.0, 0.22, 34.0, -6.0, 2.5)],
		[0.5, step.call("L", -1.0, 0.0, 0.0, 0.0, 0.0)],
		[0.75, step.call("L", 0.0, 0.22, 34.0, -6.0, -2.5)],
		[1.0, step.call("R", 1.0, 0.0, 0.0, 0.0, 0.0)],
	], 1.0))

	# 4. Бежит (быстрее, колени выше, руки согнуты, тело подпрыгивает)
	var run_pose := func(side: String, k: float, lift: float, raise: float, bob: float) -> Dictionary:
		var p := {"hips": Vector2(0, bob), "spine": 3.0 * k, "head": -2.0 * k,
			"arm_R": _run_arm(k, false), "arm_L": _run_arm(-k, true)}
		var other := "L" if side == "R" else "R"
		var ank := ANKLE_R if side == "R" else ANKLE_L
		p["leg_" + side] = {"ik": ank + Vector2(0, -raise + bob), "lift": lift, "bend": 1.0 if side == "R" else -1.0}
		var ank2 := ANKLE_R if other == "R" else ANKLE_L
		p["leg_" + other] = {"ik": ank2 + Vector2(0, bob * 0.5)}
		return p
	lib.add_animation("run", _anim([
		[0.0, run_pose.call("R", 1.0, 0.0, 0.0, 0.0)],
		[0.16, run_pose.call("R", 0.0, 0.35, 60.0, -16.0)],
		[0.32, run_pose.call("L", -1.0, 0.0, 0.0, 0.0)],
		[0.48, run_pose.call("L", 0.0, 0.35, 60.0, -16.0)],
		[0.64, run_pose.call("R", 1.0, 0.0, 0.0, 0.0)],
	], 0.64))

	# 5. Прыгает: присела — оттолкнулась — в воздухе — приземлилась
	var crouch_j := {"hips": Vector2(0, 38), "spine": 4.0, "head": -3.0,
		"arm_R": {"ua": 118.0, "fa": 100.0, "hand": 95.0},
		"arm_L": {"ua": 62.0, "fa": 80.0, "hand": 85.0},
		"leg_R": {"bend": 1.0}, "leg_L": {"bend": -1.0}}
	var air := {"hips": Vector2(0, -150), "head": 4.0,
		"arm_R": {"ua": -140.0, "fa": -115.0, "hand": -115.0},
		"arm_L": {"ua": -40.0, "fa": -65.0, "hand": -65.0},
		"leg_R": {"ik": ANKLE_R + Vector2(-6, -150 + 12), "bend": 1.0},
		"leg_L": {"ik": ANKLE_L + Vector2(6, -150 + 12), "bend": -1.0}}
	var top := air.duplicate(true)
	top["hips"] = Vector2(0, -165)
	top["leg_R"] = {"ik": ANKLE_R + Vector2(-10, -165 + 28), "bend": 1.0, "lift": 0.1}
	top["leg_L"] = {"ik": ANKLE_L + Vector2(10, -165 + 28), "bend": -1.0, "lift": 0.1}
	lib.add_animation("jump", _anim([
		[0.0, rest],
		[0.3, crouch_j],
		[0.45, air],
		[0.65, top],
		[0.85, air],
		[1.0, crouch_j],
		[1.4, rest],
	], 1.4))

	# 6. Приседает (и встаёт)
	var squat := {"hips": Vector2(0, 70), "spine": 5.0, "head": -3.0,
		"arm_R": {"knee": "R", "bend": -1.0, "hand": 95.0},
		"arm_L": {"knee": "L", "bend": 1.0, "hand": 85.0},
		"leg_R": {"ik": ANKLE_R + Vector2(-10, 0), "bend": 1.0},
		"leg_L": {"ik": ANKLE_L + Vector2(10, 0), "bend": -1.0}}
	lib.add_animation("crouch", _anim([
		[0.0, rest],
		[0.6, squat],
		[1.4, squat],
		[2.0, rest],
	], 2.0))

	# 7. Закрывает глаза руками (прятки: «раз, два, три...»)
	var eye_r_body := _tex_to_global(g_rest["Head"], HEAD_NECK, -90.0, HEAD_EYE_R + Vector2(-4, -42))
	var eye_l_body := _tex_to_global(g_rest["Head"], HEAD_NECK, -90.0, HEAD_EYE_L + Vector2(4, -42))
	var hide := {"head": -6.0, "spine": 2.0, "eyes": "closed",
		"arm_R": {"ik": eye_r_body, "bend": -1.0, "hand": -70.0},
		"arm_L": {"ik": eye_l_body, "bend": 1.0, "hand": -110.0}}
	var hide2 := hide.duplicate(true)
	hide2["head"] = -9.0
	hide2["spine"] = 3.0
	# по пути к лицу руки проходят через грудь (а не разлетаются в стороны)
	var to_face := {"head": -3.0, "spine": 1.0,
		"arm_R": {"ik": Vector2(-52, -405), "bend": -1.0, "hand": -70.0},
		"arm_L": {"ik": Vector2(34, -405), "bend": 1.0, "hand": -110.0}}
	lib.add_animation("hide", _anim([
		[0.0, rest],
		[0.3, to_face],
		[0.6, hide],
		[1.6, hide2],
		[2.6, hide],
		[2.9, to_face],
		[3.2, rest],
	], 3.2))

	var player := AnimationPlayer.new()
	player.name = "AnimationPlayer"
	player.add_animation_library("", lib)
	_add(scene_root, player)
