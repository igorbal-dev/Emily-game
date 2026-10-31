@tool
class_name EmilyShapes
extends RefCounted
## Emily's body geometry: skeleton rest pose, body-part polygons, clothing patterns
## and draw order. Everything is in Godot units; the character is ~520 units tall,
## origin at the ground between the feet, facing right (3/4 view).
##
## Bones ending in R are her RIGHT side = the NEAR side (in front of the torso).
## Bones ending in L are her LEFT side = the FAR side (behind the torso).
## Limb bones point DOWN (+y) at rest; rotation 0 = rest pose.

const OUTLINE_W := 3.0

# name, parent, local position (relative to parent bone)
const BONES := [
	["Hips", "", Vector2(0, -232)],
	["Torso", "Hips", Vector2(0, -14)],
	["Neck", "Torso", Vector2(3, -100)],
	["Head", "Neck", Vector2(0, -24)],
	["UpperArmL", "Torso", Vector2(29, -86)],
	["ForearmL", "UpperArmL", Vector2(0, 64)],
	["HandL", "ForearmL", Vector2(0, 58)],
	["ThighL", "Hips", Vector2(16, 12)],
	["ShinL", "ThighL", Vector2(0, 98)],
	["FootL", "ShinL", Vector2(0, 92)],
	["ThighR", "Hips", Vector2(-16, 12)],
	["ShinR", "ThighR", Vector2(0, 98)],
	["FootR", "ShinR", Vector2(0, 92)],
	["UpperArmR", "Torso", Vector2(-27, -86)],
	["ForearmR", "UpperArmR", Vector2(0, 64)],
	["HandR", "ForearmR", Vector2(0, 58)],
]

const THIGH_LEN := 98.0
const SHIN_LEN := 92.0
const UPPER_ARM_LEN := 64.0
const FOREARM_LEN := 58.0

# joint radii: both parts meeting at a joint use the SAME circle centred on the pivot,
# so the joint stays round in any pose (no seams, no sticking-out elbows/knees)
const SHOULDER_R := 17.5
const ELBOW_R := 14.0
const WRIST_R := 11.5
const HIP_R := 25.5
const KNEE_R := 19.5
const ANKLE_R := 13.5

# foot sole points (FootX local) used for ground contact
const SOLE := [Vector2(-14, 26), Vector2(-6, 30), Vector2(12, 30), Vector2(30, 30), Vector2(40, 26)]

const PALETTE := {
	"skin": Color("fbbf94"),
	"skin_line": Color("c98360"),
	"cheek": Color("f6a487"),
}

# ------------------------------------------------------------------ draw order
## Absolute z_index for a piece. Within one group all OUTLINES are drawn below all
## FILLS of the same category, so neighbouring parts melt into one shape.
const CAT_SUB := {"skin": 0, "base": 2, "bottom": 4, "socks": 6, "shoes": 8, "top": 10, "decal": 12}
const Z_HAIR_BACK := 50
const Z_HEAD := 460

static func side_group(bone: String) -> String:
	if bone in ["UpperArmL", "ForearmL", "HandL"]:
		return "far_arm"
	if bone in ["ThighL", "ShinL", "FootL"]:
		return "far_leg"
	if bone in ["ThighR", "ShinR", "FootR"]:
		return "near_leg"
	if bone in ["UpperArmR", "ForearmR", "HandR"]:
		return "near_arm"
	return "body"

static func z_for(bone: String, cat: String, outline: bool) -> int:
	var sub: int = CAT_SUB.get(cat, 10)
	var base := 0
	match side_group(bone):
		"far_arm": base = 100
		"far_leg": base = 200
		"near_arm": base = 500
		"near_leg":
			base = 350 if cat == "skin" else 380
		"body":
			match cat:
				"skin": base = 300
				"base": base = 360 - 2
				"bottom", "socks", "shoes": base = 380
				_: base = 400
	return base + sub + (0 if outline else 1)

# ------------------------------------------------------------------ geometry helpers
static func circle(c: Vector2, r: float, n := 40) -> PackedVector2Array:
	var p := PackedVector2Array()
	for i in n:
		var a := TAU * i / n
		p.append(c + Vector2(cos(a), sin(a)) * r)
	return p

## convex hull of circles [[centre, radius], ...]
static func hull(circles: Array) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for c in circles:
		pts.append_array(circle(c[0], c[1], 48))
	var h := Geometry2D.convex_hull(pts)
	if h.size() > 1 and h[0].is_equal_approx(h[h.size() - 1]):
		h.remove_at(h.size() - 1)
	return h

## soft tapered limb from a to b: radius r0 at a, r1 at b, bulge in the middle,
## side_shift pushes the middle sideways (calf / bottom).
static func limb(a: Vector2, b: Vector2, r0: float, r1: float, bulge := 0.0, side_shift := 0.0) -> PackedVector2Array:
	var cs := []
	var n := 14
	var normal := (b - a).orthogonal().normalized()
	for i in n + 1:
		var t := float(i) / n
		var s := sin(PI * t)
		cs.append([a.lerp(b, t) + normal * side_shift * s, lerpf(r0, r1, t) + bulge * s])
	return hull(cs)

static func grow(poly: PackedVector2Array, d: float) -> PackedVector2Array:
	var r := Geometry2D.offset_polygon(poly, d, Geometry2D.JOIN_ROUND)
	return _biggest(r) if r.size() > 0 else poly

static func clip(poly: PackedVector2Array, cutter: PackedVector2Array) -> PackedVector2Array:
	return _biggest(Geometry2D.clip_polygons(poly, cutter))

static func keep(poly: PackedVector2Array, region: PackedVector2Array) -> PackedVector2Array:
	return _biggest(Geometry2D.intersect_polygons(poly, region))

static func union(a: PackedVector2Array, b: PackedVector2Array) -> PackedVector2Array:
	return _biggest(Geometry2D.merge_polygons(a, b))

static func _biggest(polys: Array) -> PackedVector2Array:
	var best := PackedVector2Array()
	var best_a := -1.0
	for p in polys:
		if Geometry2D.is_polygon_clockwise(p) and polys.size() > 1:
			pass
		var a := absf(_area(p))
		if a > best_a:
			best_a = a
			best = p
	return best

static func _area(p: PackedVector2Array) -> float:
	var s := 0.0
	for i in p.size():
		var j := (i + 1) % p.size()
		s += p[i].x * p[j].y - p[j].x * p[i].y
	return s * 0.5

static func rect(x0: float, y0: float, x1: float, y1: float) -> PackedVector2Array:
	return PackedVector2Array([Vector2(x0, y0), Vector2(x1, y0), Vector2(x1, y1), Vector2(x0, y1)])

static func below(y: float) -> PackedVector2Array:
	return rect(-400, y, 400, 400)

static func above(y: float) -> PackedVector2Array:
	return rect(-400, -400, 400, y)

# ------------------------------------------------------------------ body parts (bone-local)
static func torso_shape() -> PackedVector2Array:
	return hull(torso_circles(0.0))

## circles of the torso; grow > 0 makes a looser version for clothes
static func torso_circles(g: float) -> Array:
	return [
		[Vector2(-22, -82), 25.0 + g], [Vector2(24, -82), 25.0 + g],   # shoulders
		[Vector2(1, -60), 43.0 + g],                                   # chest
		[Vector2(6, -30), 48.0 + g],                                   # round tummy, a bit forward
		[Vector2(1, -2), 46.0 + g], [Vector2(0, 12), 43.0 + g],        # waist (goes under the pelvis)
	]

static func pelvis_shape() -> PackedVector2Array:
	return hull([
		[Vector2(-16, 12), HIP_R + 1], [Vector2(16, 12), HIP_R + 1],
		[Vector2(0, -6), 44.0], [Vector2(-1, -18), 43.0],
	])

static func neck_shape() -> PackedVector2Array:
	return limb(Vector2(0, 8), Vector2(0, -30), 12.5, 11.5)

static func upper_arm_shape() -> PackedVector2Array:
	return limb(Vector2.ZERO, Vector2(0, UPPER_ARM_LEN), SHOULDER_R, ELBOW_R, 1.5)

static func forearm_shape() -> PackedVector2Array:
	return limb(Vector2.ZERO, Vector2(0, FOREARM_LEN), ELBOW_R, WRIST_R, 1.2)

static func hand_shapes() -> Array:
	var palm := hull([[Vector2(0, 0), WRIST_R], [Vector2(0.5, 13), 13.5], [Vector2(1, 24), 11.5], [Vector2(0, 29), 9.0]])
	var thumb := limb(Vector2(5, 7), Vector2(13, 19), 6.0, 5.2)
	return [palm, thumb]

static func thigh_shape() -> PackedVector2Array:
	return limb(Vector2.ZERO, Vector2(0, THIGH_LEN), HIP_R, KNEE_R, 2.5)

static func shin_shape() -> PackedVector2Array:
	# calf bulges a little backwards (-x)
	return limb(Vector2.ZERO, Vector2(0, SHIN_LEN), KNEE_R, ANKLE_R, 1.5, 3.0)

static func foot_shape() -> PackedVector2Array:
	return hull([[Vector2(0, 0), ANKLE_R], [Vector2(-5, 17), 13.0], [Vector2(14, 17), 13.5], [Vector2(30, 19), 11.0]])

## Skin pieces: [bone, polygon, trim_top]. trim_top = no outline above that local y
## (where a near limb melts into the torso).
static func body_pieces() -> Array:
	var out := []
	out.append({"bone": "Torso", "poly": torso_shape()})
	out.append({"bone": "Hips", "poly": pelvis_shape()})
	out.append({"bone": "Neck", "poly": neck_shape()})
	for s in ["L", "R"]:
		var near: bool = s == "R"
		out.append({"bone": "UpperArm" + s, "poly": upper_arm_shape(), "trim": 3.0 if near else NAN})
		out.append({"bone": "Forearm" + s, "poly": forearm_shape()})
		for h in hand_shapes():
			out.append({"bone": "Hand" + s, "poly": h})
		out.append({"bone": "Thigh" + s, "poly": thigh_shape(), "trim": 8.0 if near else NAN})
		out.append({"bone": "Shin" + s, "poly": shin_shape()})
		out.append({"bone": "Foot" + s, "poly": foot_shape()})
	for p in out:
		p["cat"] = "skin"
		p["paint"] = "skin"
	return out

# ------------------------------------------------------------------ clothing patterns
## Returns pieces {bone, poly, cat, trim?, color?, outline?, line_w?} for an OutfitItem.
static func cloth_pieces(item) -> Array:
	var P: Dictionary = item.params
	var cat: String = item.slot if item.slot in CAT_SUB else "top"
	var out := []
	match item.pattern:
		"bodysuit":
			var t := grow(torso_shape(), 1.2)
			t = clip(t, circle(Vector2(2, -106), 17))  # scoop neck
			out.append({"bone": "Torso", "poly": t})
			var leg_line := PackedVector2Array([Vector2(-80, -80), Vector2(80, -80), Vector2(80, -2), Vector2(46, -2),
				Vector2(10, 37), Vector2(-10, 37), Vector2(-46, -2), Vector2(-80, -2)])
			out.append({"bone": "Hips", "poly": keep(grow(pelvis_shape(), 1.2), leg_line)})
			for s in ["L", "R"]:
				out.append({"bone": "UpperArm" + s, "poly": keep(grow(upper_arm_shape(), 1.2), above(P.get("sleeve", 10.0))), "trim": 3.0 if s == "R" else NAN})
		"tshirt", "longsleeve":
			var hem: float = P.get("hem", 40.0)
			var cs := torso_circles(3.5)
			cs.append_array([[Vector2(-30, hem - 18), 20.0], [Vector2(36, hem - 18), 20.0], [Vector2(3, hem - 30), 47.0]])
			var t := hull(cs)
			t = keep(t, above(hem))
			t = clip(t, circle(Vector2(3, -110), 16))   # crew neck
			out.append({"bone": "Torso", "poly": t})
			var sl: float = P.get("sleeve", 32.0)
			for s in ["L", "R"]:
				var near: bool = s == "R"
				var sleeve := limb(Vector2(0, -2), Vector2(0, sl), SHOULDER_R + 5.0, ELBOW_R + 6.5, 1.0)
				if item.pattern == "longsleeve":
					sleeve = grow(upper_arm_shape(), 3.0)
					out.append({"bone": "Forearm" + s, "poly": keep(grow(forearm_shape(), 2.5), above(FOREARM_LEN - 4.0))})
				else:
					sleeve = keep(sleeve, above(sl))
				out.append({"bone": "UpperArm" + s, "poly": sleeve, "trim": 3.0 if near else NAN})
			if item.decal != "":
				for d in decal_polys(item.decal, P.get("decal_pos", Vector2(15, -56)), P.get("decal_size", 13.0)):
					out.append({"bone": "Torso", "poly": d, "cat": "decal", "color": item.decal_color,
						"outline": item.decal_color.darkened(0.3), "line_w": 1.6})
		"leggings", "shorts":
			var waist: float = P.get("waist", -16.0)
			out.append({"bone": "Hips", "poly": keep(grow(pelvis_shape(), 1.2), below(waist))})
			for s in ["L", "R"]:
				var near: bool = s == "R"
				if item.pattern == "shorts":
					var ln: float = P.get("length", 40.0)
					var leg := limb(Vector2(0, -4), Vector2(0, ln), HIP_R + 3.5, HIP_R + 2.0, 0.5)
					out.append({"bone": "Thigh" + s, "poly": keep(leg, above(ln)), "trim": 8.0 if near else NAN})
				else:
					out.append({"bone": "Thigh" + s, "poly": grow(thigh_shape(), 1.2), "trim": 8.0 if near else NAN})
					out.append({"bone": "Shin" + s, "poly": keep(grow(shin_shape(), 1.2), above(P.get("length", 80.0)))})
		"skirt":
			var ln: float = P.get("length", 48.0)
			var sk := PackedVector2Array([Vector2(-40, -18), Vector2(40, -18), Vector2(56, ln), Vector2(-52, ln)])
			sk = union(grow(sk, 3.0), hull([[Vector2(0, -18), 41.0]]))
			out.append({"bone": "Hips", "poly": keep(sk, below(-20.0)), "cat": "top"})
		"socks":
			var h: float = P.get("height", 64.0)
			for s in ["L", "R"]:
				out.append({"bone": "Foot" + s, "poly": grow(foot_shape(), 1.6)})
				out.append({"bone": "Shin" + s, "poly": keep(grow(shin_shape(), 2.2), below(h))})
				if P.get("cuff", true):
					out.append({"bone": "Shin" + s, "poly": keep(grow(shin_shape(), 2.6), rect(-60, h, 60, h + 7)),
						"cat": cat, "color": item.color.lightened(0.18), "z_add": 2})
	for p in out:
		if not p.has("cat"):
			p["cat"] = cat
	return out

static func decal_polys(kind: String, pos: Vector2, size: float) -> Array:
	match kind:
		"heart":
			var r := size * 0.42
			var tip := pos + Vector2(0, size * 0.85)
			var a := hull([[pos + Vector2(-r * 0.95, 0), r], [tip, 1.0]])
			var b := hull([[pos + Vector2(r * 0.95, 0), r], [tip, 1.0]])
			return [union(a, b)]
		"star":
			var p := PackedVector2Array()
			for i in 10:
				var a := -PI / 2 + i * PI / 5
				var rr := size * (0.95 if i % 2 == 0 else 0.42)
				p.append(pos + Vector2(cos(a), sin(a)) * rr)
			return [p]
		"dot":
			return [circle(pos, size * 0.5, 24)]
	return []

# ------------------------------------------------------------------ building nodes
## Creates outline + fill Polygon2D nodes for a piece under the given bone node.
static func make_piece_nodes(bone: Node2D, piece: Dictionary, fill: Color, line: Color, tag: String) -> Array:
	var poly: PackedVector2Array = piece["poly"]
	var cat: String = piece["cat"]
	var bname: String = piece["bone"]
	var lw: float = piece.get("line_w", OUTLINE_W)
	var z_add: int = piece.get("z_add", 0)
	var nodes := []
	var ol := grow(poly, lw)
	var trim = piece.get("trim", NAN)
	if trim is float and not is_nan(trim):
		ol = clip(ol, above(trim))
	var o := Polygon2D.new()
	o.name = "%s_%s_line" % [tag, bname]
	o.polygon = ol
	o.color = line
	o.antialiased = true
	o.z_as_relative = false
	o.z_index = z_for(bname, cat, true) + z_add
	o.set_meta("tag", tag)
	o.set_meta("paint", piece.get("paint", "") + "_line" if piece.get("paint", "") != "" else "")
	bone.add_child(o)
	nodes.append(o)
	var f := Polygon2D.new()
	f.name = "%s_%s" % [tag, bname]
	f.polygon = poly
	f.color = fill
	f.antialiased = true
	f.z_as_relative = false
	f.z_index = z_for(bname, cat, false) + z_add
	f.set_meta("tag", tag)
	f.set_meta("paint", piece.get("paint", ""))
	bone.add_child(f)
	nodes.append(f)
	return nodes

# ------------------------------------------------------------------ kinematics (used by the animation builder)
static func rest_global(bone: String) -> Vector2:
	for b in BONES:
		if b[0] == bone:
			return b[2] + (rest_global(b[1]) if b[1] != "" else Vector2.ZERO)
	return Vector2.ZERO

static func local_pos(bone: String) -> Vector2:
	for b in BONES:
		if b[0] == bone:
			return b[2]
	return Vector2.ZERO

static func rot(v: Vector2, a: float) -> Vector2:
	return v.rotated(a)

## angle of a down-pointing limb whose direction is d (0 = straight down, + = end moves backward/-x)
static func limb_angle(d: Vector2) -> float:
	return atan2(-d.x, d.y)

## Two-bone IK. hip = hip joint (global), target = ankle target (global), parent_rot =
## global rotation of the parent (hips). Returns [thigh_local, shin_local, knee_pos, ankle_pos].
## Knee always bends forward (+x).
static func leg_ik(hip: Vector2, target: Vector2, parent_rot: float) -> Array:
	var l1 := THIGH_LEN
	var l2 := SHIN_LEN
	var d := target - hip
	var dist := clampf(d.length(), absf(l1 - l2) + 1.0, l1 + l2 - 0.001)
	var dir := d.normalized()
	var cos_a := clampf((l1 * l1 + dist * dist - l2 * l2) / (2.0 * l1 * dist), -1.0, 1.0)
	var a := acos(cos_a)
	var best := []
	for sgn in [1.0, -1.0]:
		var tdir := dir.rotated(a * sgn)
		var knee := hip + tdir * l1
		var ankle := hip + dir * dist
		var side := (ankle - hip).cross(knee - hip)  # >0 when knee is to the right side of hip->ankle
		var t_g := limb_angle(tdir)
		var s_g := limb_angle((ankle - knee).normalized())
		var cand := [t_g - parent_rot, s_g - t_g, knee, ankle, side]
		if best.is_empty() or (knee.x - hip.lerp(ankle, l1 / (l1 + l2)).x) > (best[2].x - hip.lerp(ankle, l1 / (l1 + l2)).x):
			best = cand
	return best
