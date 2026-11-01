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

# ------------------------------------------------------------------ bodies (proportions)
## All shapes above/below are drawn in EMILY units. Another character = the same bones and
## shapes, re-proportioned per bone ("warp"):
##   torso/hips/neck: "scale" Vector2 (non-uniform stretch, also moves the child bones);
##   limbs: one thickness factor per chain ("k_arm", "k_leg", hands/feet included, so the round
##   joints stay round) and a new bone length "len" (only the middle of the limb is stretched,
##   the joint caps stay circles).
##   "motion": scale of the animation distances (stride, jump height...), "head_units": head height.
const BODIES := {
	"emily": {},
	"mark": {
		# 1.5-year-old toddler: pear-shaped (round tummy + nappy bottom), short chubby legs set wide,
		# short chubby arms, sloping shoulders, almost no neck, big head
		"torso": [
			[Vector2(-17, -80), 22.0], [Vector2(21, -80), 22.0],      # sloping shoulders
			[Vector2(3, -60), 44.0],                                  # chest
			[Vector2(11, -30), 56.0],                                 # round tummy, forward
			[Vector2(2, -2), 58.0], [Vector2(-2, 12), 54.0],          # wide bottom
		],
		"pelvis": [[Vector2(0, -8), 56.0], [Vector2(-8, 10), 52.0], [Vector2(-24, 16), 34.0], [Vector2(24, 16), 34.0]],
		"bone_pos": {"ThighL": Vector2(23, 12), "ThighR": Vector2(-23, 12),
			"UpperArmL": Vector2(25, -74), "UpperArmR": Vector2(-24, -76)},
		"Torso": {"scale": Vector2(1.0, 0.84)},
		"Hips": {"scale": Vector2(1.0, 0.86)},
		"Neck": {"scale": Vector2(1.15, 0.4)},
		"k_arm": 1.12, "UpperArm": {"len": 38.0}, "Forearm": {"len": 32.0},
		"k_leg": 1.3, "Thigh": {"len": 44.0}, "Shin": {"len": 38.0},
		"motion": 0.52, "head_units": 140.0, "jump_arm": 0.45,
		"toddler": true, "jump_height": 0.3, "step_lift": 1.5,
	},
}

static func body(name: String) -> Dictionary:
	return BODIES.get(name, {})

static func _key(bone: String) -> String:
	for k in ["UpperArm", "Forearm", "Hand", "Thigh", "Shin", "Foot"]:
		if bone.begins_with(k):
			return k
	return bone

## [cap at the start, cap at the end, emily length] of a limb bone
const LIMB_CAPS := {"UpperArm": [17.5, 14.0, 64.0], "Forearm": [14.0, 11.5, 58.0],
	"Thigh": [25.5, 19.5, 98.0], "Shin": [19.5, 13.5, 92.0]}

static func warp_point(p: Vector2, bone: String, B: Dictionary) -> Vector2:
	if B.is_empty():
		return p
	var k := _key(bone)
	var spec: Dictionary = B.get(k, {})
	if spec.has("scale"):
		return p * (spec["scale"] as Vector2)
	var f: float = B.get("k_arm", 1.0) if k in ["UpperArm", "Forearm", "Hand"] else (B.get("k_leg", 1.0) if k in ["Thigh", "Shin", "Foot"] else 1.0)
	var y := p.y
	if LIMB_CAPS.has(k) and spec.has("len"):
		var c: Array = LIMB_CAPS[k]
		var L: float = c[2]
		var L2: float = spec["len"] / f
		if y >= L - c[1]:
			y += L2 - L
		elif y > c[0]:
			# a limb shorter than its two joint caps (chubby toddler legs): the middle collapses
			y = c[0] + (y - c[0]) * maxf(L2 - c[0] - c[1], 0.0) / (L - c[0] - c[1])
	return Vector2(p.x, y) * f

static func warp_poly(poly: PackedVector2Array, bone: String, B: Dictionary) -> PackedVector2Array:
	if B.is_empty():
		return poly
	var out := PackedVector2Array()
	for v in poly:
		out.append(warp_point(v, bone, B))
	# very short limbs: caps overlap, the warped outline can fold -> use its convex hull (limb pieces are convex)
	var k := _key(bone)
	if LIMB_CAPS.has(k) and B.get(k, {}).has("len"):
		var c: Array = LIMB_CAPS[k]
		var f: float = B.get("k_arm", 1.0) if k in ["UpperArm", "Forearm"] else B.get("k_leg", 1.0)
		if B[k]["len"] / f < c[0] + c[1] + 2.0:
			var h := Geometry2D.convex_hull(out)
			if h.size() > 3:
				h.remove_at(h.size() - 1)
				return h
	return out

## BONES re-proportioned for body B (a child bone's position is warped by its parent's warp)
static func bones(B: Dictionary) -> Array:
	if B.is_empty():
		return BONES
	var out := []
	var over: Dictionary = B.get("bone_pos", {})
	for b in BONES:
		var pos: Vector2 = over.get(b[0], b[2])
		out.append([b[0], b[1], warp_point(pos, b[1], B) if b[1] != "" else pos])
	# the hips stand so that the feet touch the ground
	var h: Vector2 = out[0][2]
	var ankle := -sole_max(B)
	var leg := thigh_len(B) + shin_len(B) + warp_point(local_pos("ThighR"), "Hips", B).y
	out[0][2] = Vector2(h.x, ankle - leg)
	return out

static func sole_max(B: Dictionary) -> float:
	var m := -1e9
	for p in sole(B):
		m = maxf(m, p.y)
	return m

static func sole(B: Dictionary) -> Array:
	var out := []
	for p in SOLE:
		out.append(warp_point(p, "FootR", B))
	return out

static func thigh_len(B: Dictionary) -> float:
	return B.get("Thigh", {}).get("len", THIGH_LEN)

static func shin_len(B: Dictionary) -> float:
	return B.get("Shin", {}).get("len", SHIN_LEN)

static func motion(B: Dictionary) -> float:
	return B.get("motion", 1.0)

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
const CAT_SUB := {"skin": 0, "base": 2, "bottom": 4, "socks": 6, "shoes": 8, "top": 10, "outer": 12, "decal": 14}
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
static func torso_shape(B: Dictionary = {}) -> PackedVector2Array:
	return hull(torso_circles(0.0, B))

## circles of the torso; grow > 0 makes a looser version for clothes
static func torso_circles(g: float, B: Dictionary = {}) -> Array:
	if B.has("torso"):
		var cs := []
		for c in B["torso"]:
			cs.append([c[0], c[1] + g])
		return cs
	return [
		[Vector2(-22, -82), 25.0 + g], [Vector2(24, -82), 25.0 + g],   # shoulders
		[Vector2(1, -60), 43.0 + g],                                   # chest
		[Vector2(6, -30), 48.0 + g],                                   # round tummy, a bit forward
		[Vector2(1, -2), 46.0 + g], [Vector2(0, 12), 43.0 + g],        # waist (goes under the pelvis)
	]

static func pelvis_shape(B: Dictionary = {}) -> PackedVector2Array:
	if B.has("pelvis"):
		return hull(B["pelvis"])
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
static func body_pieces(B: Dictionary = {}) -> Array:
	var out := []
	out.append({"bone": "Torso", "poly": torso_shape(B)})
	out.append({"bone": "Hips", "poly": pelvis_shape(B)})
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
static func cloth_pieces(item, B: Dictionary = {}) -> Array:
	var P: Dictionary = item.params
	var cat: String = item.slot if item.slot in CAT_SUB else "top"
	var out := []
	match item.pattern:
		"bodysuit":
			var t := grow(torso_shape(B), 1.2)
			t = clip(t, circle(Vector2(2, -106), 17))  # scoop neck
			out.append({"bone": "Torso", "poly": t})
			var leg_line := PackedVector2Array([Vector2(-80, -80), Vector2(80, -80), Vector2(80, -2), Vector2(46, -2),
				Vector2(10, 37), Vector2(-10, 37), Vector2(-46, -2), Vector2(-80, -2)])
			out.append({"bone": "Hips", "poly": keep(grow(pelvis_shape(B), 1.2), leg_line)})
			for s in ["L", "R"]:
				out.append({"bone": "UpperArm" + s, "poly": keep(grow(upper_arm_shape(), 1.2), above(P.get("sleeve", 10.0))), "trim": 3.0 if s == "R" else NAN})
		"romper":
			# one-piece: long sleeves, long legs, closed feet (toddler sleepsuit); white collar, cuffs, buttons
			var t := grow(torso_shape(B), 1.6)
			t = clip(t, circle(Vector2(3, -110), 15))
			out.append({"bone": "Torso", "poly": t})
			out.append({"bone": "Hips", "poly": grow(pelvis_shape(B), 1.6)})
			var white: Color = P.get("trim_color", Color("f7f4ee"))
			var white_line := Color("c9c2b6")
			for s in ["L", "R"]:
				var near: bool = s == "R"
				out.append({"bone": "UpperArm" + s, "poly": grow(upper_arm_shape(), 3.0), "trim": 3.0 if near else NAN})
				out.append({"bone": "Forearm" + s, "poly": keep(grow(forearm_shape(), 3.0), above(FOREARM_LEN - 3.0))})
				if P.get("cuffs", true):
					out.append({"bone": "Forearm" + s, "poly": keep(grow(forearm_shape(), 3.4), rect(-60, FOREARM_LEN - 13.0, 60, FOREARM_LEN - 3.0)),
						"cat": "base", "z_add": 1, "color": white, "outline": white_line, "line_w": 2.0})
				out.append({"bone": "Thigh" + s, "poly": grow(thigh_shape(), 2.0), "trim": 8.0 if near else NAN})
				out.append({"bone": "Shin" + s, "poly": grow(shin_shape(), 2.0)})
				out.append({"bone": "Foot" + s, "poly": grow(foot_shape(), 3.0)})
			if P.get("collar", true):
				for c in [[Vector2(-12, -99), Vector2(-2, -106)], [Vector2(19, -99), Vector2(9, -106)]]:
					out.append({"bone": "Torso", "poly": keep(hull([[c[0], 13.0], [c[1], 9.0]]), grow(torso_shape(B), 0.5)), "cat": "base", "z_add": 1,
						"color": white, "outline": white_line, "line_w": 2.0})
			if P.get("buttons", true):
				for i in 4:
					out.append({"bone": "Torso", "poly": circle(Vector2(5, -78 + i * 20), 3.2, 16), "cat": "base", "z_add": 1,
						"color": item.decal_color, "outline": item.color.darkened(0.4), "line_w": 1.2})
		"tshirt", "longsleeve":
			var hem: float = P.get("hem", 40.0)
			var cs := torso_circles(3.5, B)
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
			out.append({"bone": "Hips", "poly": keep(grow(pelvis_shape(B), 1.2), below(waist))})
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
		"dress":
			out.append_array(dress_pieces(item, B))
		"jacket":
			# puffy quilted jacket: long puffy sleeves with ribbed cuffs, zip, hood lying on the shoulders
			var hem: float = P.get("hem", 34.0)
			var cs := torso_circles(6.5, B)
			cs.append_array([[Vector2(-30, hem - 20), 22.0], [Vector2(38, hem - 20), 22.0], [Vector2(4, hem - 30), 50.0]])
			var t := keep(hull(cs), above(hem))
			t = clip(t, circle(Vector2(3, -112), 14))
			out.append({"bone": "Torso", "poly": t})
			var dark: Color = item.color.darkened(0.28)
			var ribbed: Color = item.color.darkened(0.12)
			# quilting lines
			var inner := grow(t, -5.0)
			var y := -84.0
			while y < hem - 6.0:
				var line := keep(inner, rect(-100, y, 100, y + 2.0))
				if line.size() > 2:
					out.append({"bone": "Torso", "poly": line, "cat": "decal", "color": dark, "outline": dark, "line_w": 0.3})
				y += P.get("quilt", 19.0)
			# zip + pull
			out.append({"bone": "Torso", "poly": keep(inner, rect(5, -110, 8, hem)), "cat": "decal",
				"color": P.get("zip_color", Color("8e97b8")), "outline": dark, "line_w": 0.8, "z_add": 2})
			out.append({"bone": "Torso", "poly": hull([[Vector2(6.5, -92), 2.6], [Vector2(6.5, -82), 2.0]]), "cat": "decal",
				"color": P.get("zip_color", Color("8e97b8")).lightened(0.2), "outline": dark, "line_w": 1.0, "z_add": 3})
			# hem band
			out.append({"bone": "Torso", "poly": keep(grow(t, 0.5), below(hem - 7.0)), "cat": "decal", "color": ribbed,
				"outline": dark, "line_w": 1.0})
			if P.get("hood", true):
				out.append({"bone": "Torso", "poly": hull([[Vector2(-18, -104), 15.0], [Vector2(24, -104), 15.0], [Vector2(3, -98), 18.0]]),
					"cat": "decal", "color": item.color.lightened(0.06), "outline": item.get_outline(), "line_w": 2.5, "z_add": -1})
			for s in ["L", "R"]:
				var near: bool = s == "R"
				out.append({"bone": "UpperArm" + s, "poly": grow(upper_arm_shape(), 7.0), "trim": 3.0 if near else NAN})
				var fa := keep(grow(forearm_shape(), 6.5), above(FOREARM_LEN - 4.0))
				out.append({"bone": "Forearm" + s, "poly": fa})
				out.append({"bone": "Forearm" + s, "poly": keep(grow(forearm_shape(), 3.0), rect(-60, FOREARM_LEN - 13.0, 60, FOREARM_LEN - 3.0)),
					"cat": "decal", "color": ribbed, "outline": dark, "line_w": 1.5})
				for yy in [22.0, 46.0]:
					out.append({"bone": "UpperArm" + s, "poly": keep(grow(upper_arm_shape(), 2.0), rect(-60, yy, 60, yy + 2.0)),
						"cat": "decal", "color": dark, "outline": dark, "line_w": 0.3})
				out.append({"bone": "Forearm" + s, "poly": keep(grow(forearm_shape(), 2.0), rect(-60, 24.0, 60, 26.0)),
					"cat": "decal", "color": dark, "outline": dark, "line_w": 0.3})
		"trousers":
			var waist: float = P.get("waist", -16.0)
			out.append({"bone": "Hips", "poly": keep(grow(pelvis_shape(B), 3.0), below(waist))})
			for s in ["L", "R"]:
				var near: bool = s == "R"
				out.append({"bone": "Thigh" + s, "poly": grow(thigh_shape(), 4.0), "trim": 8.0 if near else NAN})
				out.append({"bone": "Shin" + s, "poly": keep(grow(shin_shape(), 4.5), above(SHIN_LEN + 4.0))})
				if P.get("pockets", false):
					# cargo pocket with a flap on the side of the thigh
					var pc: Color = item.color.darkened(0.08)
					var pl: Color = item.get_outline()
					out.append({"bone": "Thigh" + s, "poly": keep(grow(thigh_shape(), 1.0), rect(-16, 46, 10, 78)), "cat": cat,
						"color": pc, "outline": pl, "line_w": 1.5, "z_add": 2})
					out.append({"bone": "Thigh" + s, "poly": keep(grow(thigh_shape(), 1.5), rect(-17, 42, 11, 52)), "cat": cat,
						"color": item.color, "outline": pl, "line_w": 1.5, "z_add": 4})
				if P.get("cuffs", false):
					out.append({"bone": "Shin" + s, "poly": keep(grow(shin_shape(), 3.0), rect(-60, SHIN_LEN - 14.0, 60, SHIN_LEN + 4.0)),
						"cat": cat, "color": item.color.darkened(0.12), "outline": item.get_outline(), "line_w": 1.5, "z_add": 2})
					for x in [-8.0, -3.0, 2.0, 7.0]:
						out.append({"bone": "Shin" + s, "poly": keep(grow(shin_shape(), 2.0), rect(x, SHIN_LEN - 12.0, x + 1.2, SHIN_LEN + 3.0)),
							"cat": cat, "color": item.color.darkened(0.3), "outline": item.color.darkened(0.3), "line_w": 0.2, "z_add": 4})
		"boots":
			# ankle boots: sole, fur cuff, two straps
			var h: float = P.get("height", SHIN_LEN - 30.0)
			var sole: Color = P.get("sole_color", Color("4a3022"))
			var fur: Color = P.get("fur_color", Color("e9d3b0"))
			var strap: Color = item.color.darkened(0.22)
			for s in ["L", "R"]:
				var boot := grow(foot_shape(), 5.0)
				out.append({"bone": "Foot" + s, "poly": boot})
				out.append({"bone": "Shin" + s, "poly": keep(grow(shin_shape(), 6.0), below(h))})
				out.append({"bone": "Foot" + s, "poly": keep(grow(foot_shape(), 5.6), below(30.0)), "cat": "decal",
					"color": sole, "outline": sole.darkened(0.3), "line_w": 1.5})
				out.append({"bone": "Shin" + s, "poly": keep(grow(shin_shape(), 7.5), rect(-60, h - 3.0, 60, h + 6.0)), "cat": "decal",
					"color": fur, "outline": fur.darkened(0.25), "line_w": 1.5})
				# velcro straps across the instep, from the top of the boot down towards the sole
				var upper := keep(grow(foot_shape(), 4.0), above(24.0))
				for x in [6.0, 19.0]:
					var band := PackedVector2Array([Vector2(x, -30), Vector2(x + 8, -30), Vector2(x + 14, 30), Vector2(x + 6, 30)])
					var st := keep(upper, band)
					if st.size() > 2:
						out.append({"bone": "Foot" + s, "poly": st, "cat": "decal",
							"color": strap, "outline": strap.darkened(0.3), "line_w": 1.2})
		"sweater", "shirt", "vest":
			var knit: bool = item.pattern != "shirt"
			var hem: float = P.get("hem", 30.0 if item.pattern == "vest" else 36.0)
			var g := 5.0 if item.pattern == "sweater" else (3.0 if item.pattern == "shirt" else 4.5)
			var cs := torso_circles(g, B)
			cs.append_array([[Vector2(-28, hem - 18), 20.0], [Vector2(36, hem - 18), 20.0], [Vector2(3, hem - 28), 47.0]])
			var t := keep(hull(cs), above(hem))
			var dark: Color = item.color.darkened(0.22)
			var line: Color = item.get_outline()
			if item.pattern == "vest":
				# V-neck, no sleeves, cut in at the armholes
				t = clip(t, PackedVector2Array([Vector2(-16, -130), Vector2(24, -130), Vector2(5, -50)]))
			else:
				t = clip(t, circle(Vector2(3, -111), 15))
			out.append({"bone": "Torso", "poly": t})
			if knit:
				# ribbed hem band + knit lines
				out.append({"bone": "Torso", "poly": keep(grow(t, 0.5), below(hem - 9.0)), "cat": "decal", "color": dark.lightened(0.12),
					"outline": line, "line_w": 1.2})
				var x := -50.0
				while x < 60.0:
					var rib := keep(grow(t, -1.0), rect(x, hem - 8.0, x + 1.4, hem))
					if rib.size() > 2:
						out.append({"bone": "Torso", "poly": rib, "cat": "decal", "color": dark, "outline": dark, "line_w": 0.2, "z_add": 1})
					var cable := keep(grow(t, -6.0), rect(x + 6.0, -95.0, x + 7.2, hem - 11.0))
					if cable.size() > 2 and P.get("cables", true):
						out.append({"bone": "Torso", "poly": cable, "cat": "decal", "color": item.color.darkened(0.1),
							"outline": item.color.darkened(0.1), "line_w": 0.2})
					x += 7.0 if item.pattern == "vest" else 14.0
			if item.pattern == "vest":
				var vband := PackedVector2Array([Vector2(-22, -130), Vector2(30, -130), Vector2(5, -42)])
				out.append({"bone": "Torso", "poly": keep(t, vband), "cat": "decal", "color": dark.lightened(0.12),
					"outline": line, "line_w": 1.2, "z_add": -1})
			if item.pattern == "sweater":
				out.append({"bone": "Torso", "poly": keep(grow(t, 0.5), circle(Vector2(3, -111), 21)), "cat": "decal",
					"color": dark.lightened(0.12), "outline": line, "line_w": 1.2})
				if item.decal == "bear":
					out.append_array(bear_pieces(P.get("decal_pos", Vector2(14, -58)), P.get("decal_size", 1.0)))
			if item.pattern == "shirt":
				# pointed collar, buttons, bow tie
				for c in [[Vector2(-14, -110), Vector2(4, -96), Vector2(-7, -84)], [Vector2(22, -110), Vector2(4, -96), Vector2(15, -84)]]:
					out.append({"bone": "Torso", "poly": keep(grow(PackedVector2Array(c), 2.5), grow(torso_shape(B), 0.5)), "cat": "decal", "color": item.color,
						"outline": line, "line_w": 1.5, "z_add": 6})
				for i in 5:
					out.append({"bone": "Torso", "poly": circle(Vector2(4.5, -76 + i * 20), 2.4, 12), "cat": "top", "z_add": 1,
						"color": item.color.darkened(0.1), "outline": line, "line_w": 0.8})
				if item.decal == "bowtie":
					var bc: Color = item.decal_color
					for w in [[Vector2(4, -90), Vector2(-9, -97), Vector2(-9, -83)], [Vector2(4, -90), Vector2(17, -97), Vector2(17, -83)]]:
						out.append({"bone": "Torso", "poly": grow(PackedVector2Array(w), 2.0), "cat": "decal", "color": bc,
							"outline": bc.darkened(0.4), "line_w": 1.2, "z_add": 8})
					out.append({"bone": "Torso", "poly": circle(Vector2(4, -90), 3.8, 16), "cat": "decal", "color": bc.lightened(0.1),
						"outline": bc.darkened(0.4), "line_w": 1.2, "z_add": 10})
			if item.pattern != "vest":
				var cuff: float = 11.0 if knit else 9.0
				for s in ["L", "R"]:
					var near: bool = s == "R"
					out.append({"bone": "UpperArm" + s, "poly": grow(upper_arm_shape(), g), "trim": 3.0 if near else NAN})
					out.append({"bone": "Forearm" + s, "poly": keep(grow(forearm_shape(), g - 0.5), above(FOREARM_LEN - 3.0))})
					out.append({"bone": "Forearm" + s, "poly": keep(grow(forearm_shape(), g - 1.0), rect(-60, FOREARM_LEN - 3.0 - cuff, 60, FOREARM_LEN - 3.0)),
						"cat": "decal", "color": dark.lightened(0.12) if knit else item.color, "outline": line, "line_w": 1.2})
		"shoes":
			# low shoes: sole + a strap over the instep
			var sole: Color = P.get("sole_color", Color("3f2a1e"))
			for s in ["L", "R"]:
				out.append({"bone": "Foot" + s, "poly": keep(grow(foot_shape(), 4.0), below(-4.0))})
				out.append({"bone": "Foot" + s, "poly": keep(grow(foot_shape(), 4.6), below(29.0)), "cat": "decal",
					"color": sole, "outline": sole.darkened(0.3), "line_w": 1.5})
				var strap := keep(grow(foot_shape(), 4.2), PackedVector2Array([Vector2(4, -20), Vector2(13, -20), Vector2(17, 28), Vector2(8, 28)]))
				out.append({"bone": "Foot" + s, "poly": keep(strap, rect(-60, -2.0, 60, 24.0)), "cat": "decal", "color": P.get("strap_color", item.color.darkened(0.2)),
					"outline": item.get_outline(), "line_w": 1.2})
				out.append({"bone": "Foot" + s, "poly": circle(Vector2(9, 4), 2.2, 12), "cat": "decal", "color": Color("d8c08a"),
					"outline": sole, "line_w": 0.8, "z_add": 2})
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

## Dress = bodice on the Torso + flared skirt on the Hips (one item, slot "dress": replaces top and bottom).
## params: "length" (hem, Hips y), "flare" (hem half-width), "waist" (Hips y of the seam),
##   "neck": round / square / sweetheart / collar, "sleeve": puff / flutter / short / strap, "sleeve_color",
##   "ruffle" (scalloped hem), "tulle" (lighter longer petticoat under the skirt), "stripes" [colors, top->bottom],
##   "flowers" [petal, centre] (print), "buttons" (on the bodice), "placket" (buttons down to the hem),
##   "bow" (bow at the waist, decal_color), decal "rainbow" (on the chest)
static func dress_pieces(item, B: Dictionary = {}) -> Array:
	var P: Dictionary = item.params
	var out := []
	var col: Color = item.color
	var line: Color = item.get_outline()
	var fold: Color = col.darkened(0.12)
	var waist: float = P.get("waist", -36.0)
	var ln: float = P.get("length", 92.0)
	var flare: float = P.get("flare", 72.0)
	var neck: String = P.get("neck", "round")
	var sleeve: String = P.get("sleeve", "puff")
	var scol: Color = P.get("sleeve_color", col)
	# ---- bodice (Torso coords; Hips y = Torso y - 14)
	var t := keep(hull(torso_circles(3.0, B)), above(30.0))
	match neck:
		"square":
			t = clip(t, rect(-13, -140, 20, -97))
		"sweetheart", "strap":
			pass
		_:
			t = clip(t, circle(Vector2(3, -110), 16))
	if sleeve == "strap":
		# sleeveless: straight top with a little dip in the middle, thin straps over the shoulders
		var top := PackedVector2Array([Vector2(-80, -86), Vector2(-4, -86), Vector2(4, -80), Vector2(12, -86), Vector2(80, -86),
			Vector2(80, 60), Vector2(-80, 60)])
		t = keep(t, top)
		for sx in [[-19.0, -21.0], [23.0, 25.0]]:
			var st := hull([[Vector2(sx[0], -84), 3.6], [Vector2(sx[1], -104), 3.2]])
			out.append({"bone": "Torso", "poly": st, "z_add": -1})
	out.append({"bone": "Torso", "poly": t})
	if neck == "collar":
		for c in [[Vector2(-10, -101), Vector2(-1, -107)], [Vector2(17, -101), Vector2(8, -107)]]:
			out.append({"bone": "Torso", "poly": keep(hull([[c[0], 11.0], [c[1], 8.0]]), grow(torso_shape(B), 1.0)), "cat": "decal",
				"color": col.lightened(0.08), "outline": line, "line_w": 1.6})
	var nb: int = P.get("buttons", 0)
	for i in nb:
		out.append({"bone": "Torso", "poly": circle(Vector2(5, -94 + i * 14), 2.6, 12), "z_add": 1,
			"color": P.get("button_color", col.lightened(0.35)), "outline": line, "line_w": 0.9})
	if item.decal == "rainbow":
		out.append_array(rainbow_pieces(P.get("decal_pos", Vector2(10, -64)), P.get("decal_size", 1.0)))
	# ---- sleeves
	for s in ["L", "R"]:
		var near: bool = s == "R"
		var tr = 3.0 if near else NAN
		match sleeve:
			"puff":
				var sl := keep(limb(Vector2(0, -3), Vector2(0, 24), SHOULDER_R + 6.0, ELBOW_R + 8.0, 2.5), above(26.0))
				out.append({"bone": "UpperArm" + s, "poly": sl, "trim": tr, "color": scol})
				out.append({"bone": "UpperArm" + s, "poly": keep(grow(upper_arm_shape(), 2.5), rect(-60, 22, 60, 29)), "cat": "decal",
					"color": scol.darkened(0.06), "outline": line, "line_w": 1.2})
			"flutter":
				var fl := hull([[Vector2(0, -2), SHOULDER_R + 5.0], [Vector2(-7, 20), 12.0], [Vector2(9, 20), 12.0]])
				for x in [-17.0, -8.5, 0.0, 8.5, 17.0]:
					fl = union(fl, circle(Vector2(x, 28.0 - absf(x) * 0.25), 6.0, 16))
				out.append({"bone": "UpperArm" + s, "poly": keep(fl, above(36.0)), "trim": tr, "color": scol})
				for x in [-6.0, 6.0]:
					out.append({"bone": "UpperArm" + s, "poly": keep(fl, PackedVector2Array([Vector2(x * 0.3, 4), Vector2(x * 0.3 + 1.3, 4),
						Vector2(x * 1.6 + 1.3, 31), Vector2(x * 1.6, 31)])), "cat": "decal", "color": scol.darkened(0.1),
						"outline": scol.darkened(0.1), "line_w": 0.2})
			"short":
				out.append({"bone": "UpperArm" + s, "poly": keep(grow(upper_arm_shape(), 3.5), above(30.0)), "trim": tr, "color": scol})
				out.append({"bone": "UpperArm" + s, "poly": keep(grow(upper_arm_shape(), 4.0), rect(-60, 23, 60, 31)), "cat": "decal",
					"color": scol.lightened(0.06), "outline": line, "line_w": 1.4})
	# ---- skirt (Hips coords)
	var sk := skirt_poly(4.0, 54.0, flare, waist, ln, 9.0, 9 if P.get("ruffle", false) else 0, 4.5)
	sk = union(sk, keep(circle(Vector2(4, -6), 54.0), below(waist)))
	if P.get("tulle", false):
		var tu := skirt_poly(4.0, 55.0, flare + 8.0, waist, ln + 16.0, 11.0, 11, 5.0)
		var tc: Color = P.get("tulle_color", col.lightened(0.3))
		out.append({"bone": "Hips", "poly": tu, "color": tc, "outline": col.darkened(0.05), "line_w": 2.0, "z_add": 1})
		for i in 7:
			var u := -0.75 + i * 0.25
			var x1 := 2.0 + u * (flare + 6.0)
			out.append({"bone": "Hips", "poly": keep(tu, PackedVector2Array([Vector2(x1 - 1, ln - 10), Vector2(x1 + 1, ln - 10),
				Vector2(x1 * 1.04 + 1, ln + 30), Vector2(x1 * 1.04 - 1, ln + 30)])), "color": tc.darkened(0.08), "outline": tc.darkened(0.08),
				"line_w": 0.3, "z_add": 2})
	out.append({"bone": "Hips", "poly": sk, "z_add": 3})
	var stripes: Array = P.get("stripes", [])
	if stripes.size() > 0:
		var h0 := waist + 4.0
		var step := (ln + 12.0 - h0) / stripes.size()
		for i in stripes.size():
			var band := keep(grow(sk, -0.5), rect(-200, h0 + i * step - (4.0 if i == 0 else 0.0), 200, h0 + (i + 1) * step + (20.0 if i == stripes.size() - 1 else 0.0)))
			if band.size() > 2:
				out.append({"bone": "Hips", "poly": band, "color": stripes[i], "outline": stripes[i], "line_w": 0.2, "z_add": 4})
	# soft folds fanning out from the waist
	for i in 6:
		var u := -0.72 + i * 0.29
		var x0 := 2.0 + u * 38.0
		var x1 := 2.0 + u * (flare - 6.0)
		var fpoly := keep(grow(sk, -2.0), PackedVector2Array([Vector2(x0 - 0.6, waist + 14), Vector2(x0 + 0.6, waist + 14),
			Vector2(x1 + 1.6, ln + 20), Vector2(x1 - 1.6, ln + 20)]))
		if fpoly.size() > 2:
			var fc: Color = fold if stripes.is_empty() else Color(1, 1, 1, 0.35)
			out.append({"bone": "Hips", "poly": fpoly, "color": fc, "outline": fc, "line_w": 0.2, "z_add": 6})
	if P.get("ruffle", false):
		# hem frill: a lighter band along the scallops
		var hem_band := keep(sk, PackedVector2Array([Vector2(-200, ln - 14), Vector2(200, ln - 14), Vector2(200, ln + 40), Vector2(-200, ln + 40)]))
		out.append({"bone": "Hips", "poly": hem_band, "color": col.lightened(0.12), "outline": col.lightened(0.12), "line_w": 0.2, "z_add": 5})
		out.append({"bone": "Hips", "poly": keep(grow(sk, -0.5), rect(-200, ln - 15, 200, ln - 13)), "color": fold, "outline": fold, "line_w": 0.2, "z_add": 7})
	var fl_cols: Array = P.get("flowers", [])
	if fl_cols.size() >= 2:
		var cells := [Vector2(-28, -92), Vector2(18, -84), Vector2(-6, -66), Vector2(30, -54), Vector2(-30, -44), Vector2(8, -36),
			Vector2(-18, -18), Vector2(28, -16)]
		for c in cells:
			out.append_array(flower_pieces("Torso", c, keep(t, grow(t, -3.0)), fl_cols, 1))
		var sk_in := grow(sk, -4.0)
		var y := waist + 12.0
		var row := 0
		while y < ln + 4.0:
			var x := -90.0 + (row % 2) * 14.0
			while x < 100.0:
				out.append_array(flower_pieces("Hips", Vector2(x + 4.0 * sin(y), y), sk_in, fl_cols, 8))
				x += 28.0
			y += 22.0
			row += 1
	if P.get("placket", false):
		for i in 5:
			out.append({"bone": "Hips", "poly": circle(Vector2(4, waist + 12 + i * 18), 2.6, 12), "z_add": 8,
				"color": P.get("button_color", col.lightened(0.35)), "outline": line, "line_w": 0.9})
		out.append({"bone": "Hips", "poly": keep(grow(sk, -1.0), rect(1.2, waist, 2.4, ln + 20)), "color": fold, "outline": fold,
			"line_w": 0.2, "z_add": 7})
	if P.get("bow", false):
		var bc: Color = item.decal_color
		var bl: Color = bc.darkened(0.35)
		var c0 := Vector2(4, waist + 1)
		out.append({"bone": "Hips", "poly": keep(grow(sk, 0.5), rect(-200, waist - 1, 200, waist + 6)), "cat": "decal",
			"color": bc, "outline": bl, "line_w": 1.0})
		for tl in [[Vector2(0, 4), Vector2(-9, 36), Vector2(-3, 38)], [Vector2(6, 4), Vector2(15, 34), Vector2(9, 37)]]:
			out.append({"bone": "Hips", "poly": grow(PackedVector2Array([c0 + tl[0], c0 + tl[1], c0 + tl[2]]), 1.5), "cat": "decal",
				"color": bc, "outline": bl, "line_w": 1.0, "z_add": 1})
		for w in [[Vector2(0, 0), Vector2(-16, -9), Vector2(-16, 8)], [Vector2(0, 0), Vector2(18, -9), Vector2(18, 8)]]:
			out.append({"bone": "Hips", "poly": grow(PackedVector2Array([c0 + w[0], c0 + w[1], c0 + w[2]]), 2.5), "cat": "decal",
				"color": bc, "outline": bl, "line_w": 1.2, "z_add": 2})
		out.append({"bone": "Hips", "poly": circle(c0, 4.2, 16), "cat": "decal", "color": bc.lightened(0.1), "outline": bl,
			"line_w": 1.2, "z_add": 4})
	for p in out:
		if not p.has("cat"):
			p["cat"] = "top"
	return out

## flared skirt: waist line at y=top (half-width w0), hem at y=hem (half-width w1, bulging down in the middle),
## optional scallops (bumps) along the hem
static func skirt_poly(cx: float, w0: float, w1: float, top: float, hem: float, bulge: float, bumps: int, depth: float) -> PackedVector2Array:
	var p := PackedVector2Array()
	var hem_y := func(u: float) -> float: return hem - bulge * 0.5 + bulge * (1.0 - u * u)
	var n := 10
	for i in n + 1:
		var tt := float(i) / n
		p.append(Vector2(cx - (w0 + (w1 - w0) * pow(tt, 0.6)), lerpf(top, hem_y.call(-1.0), tt)))
	var m := maxi(bumps, 1) * 4
	for i in range(1, m):
		var u := -1.0 + 2.0 * i / m
		var y: float = hem_y.call(u)
		if bumps > 0:
			y += depth * absf(sin(PI * bumps * (u + 1.0) / 2.0))
		p.append(Vector2(cx + u * w1, y))
	for i in n + 1:
		var tt := 1.0 - float(i) / n
		p.append(Vector2(cx + (w0 + (w1 - w0) * pow(tt, 0.6)), lerpf(top, hem_y.call(1.0), tt)))
	return p

## small 5-petal flower, kept inside region (skipped if mostly outside)
static func flower_pieces(bone: String, c: Vector2, region: PackedVector2Array, cols: Array, z: int) -> Array:
	if not Geometry2D.is_point_in_polygon(c, region):
		return []
	var f := PackedVector2Array()
	for i in 5:
		var a := -PI / 2 + i * TAU / 5
		f = union(f, circle(c + Vector2(cos(a), sin(a)) * 3.6, 3.0, 10)) if f.size() > 0 else circle(c + Vector2(cos(a), sin(a)) * 3.6, 3.0, 10)
	f = keep(f, region)
	if f.size() < 3:
		return []
	var pc: Color = cols[0]
	var cc: Color = cols[1]
	return [{"bone": bone, "poly": f, "cat": "top", "color": pc, "outline": pc.darkened(0.15), "line_w": 0.6, "z_add": z},
		{"bone": bone, "poly": circle(c, 1.8, 10), "cat": "top", "color": cc, "outline": cc, "line_w": 0.2, "z_add": z + 1}]

## small rainbow with two clouds (chest print), size 1 = about 30 units wide
static func rainbow_pieces(pos: Vector2, k: float) -> Array:
	var out := []
	var cols := [Color("f48fb1"), Color("ffcc80"), Color("fff59d"), Color("a5d6a7"), Color("90caf9"), Color("ce93d8")]
	for i in cols.size():
		var r := (15.0 - i * 2.0) * k
		var arc := keep(clip(circle(pos, r, 32), circle(pos, r - 2.2 * k, 32)), above(pos.y))
		if arc.size() > 2:
			out.append({"bone": "Torso", "poly": arc, "cat": "decal", "color": cols[i], "outline": cols[i], "line_w": 0.2, "z_add": 2 + i})
	for cx in [-12.0, 12.0]:
		var cl := union(union(circle(pos + Vector2(cx - 3, 0) * k, 3.6 * k, 14), circle(pos + Vector2(cx + 3, 0) * k, 3.6 * k, 14)),
			circle(pos + Vector2(cx, -2.5) * k, 4.2 * k, 14))
		out.append({"bone": "Torso", "poly": cl, "cat": "decal", "color": Color.WHITE, "outline": Color("b8c4d6"), "line_w": 1.0, "z_add": 10})
	return out

## little bear face (several colours), size 1 = about 22 units wide
static func bear_pieces(pos: Vector2, k: float) -> Array:
	var fur := Color("8a5a36")
	var light := Color("e8c9a0")
	var ink := Color("3b2416")
	var out := []
	out.append({"bone": "Torso", "poly": union(union(circle(pos, 9.5 * k, 28), circle(pos + Vector2(-7.5, -7) * k, 4.0 * k, 16)),
		circle(pos + Vector2(7.5, -7) * k, 4.0 * k, 16)), "cat": "decal", "color": fur, "outline": ink, "line_w": 1.2, "z_add": 2})
	for e in [Vector2(-7.5, -7), Vector2(7.5, -7)]:
		out.append({"bone": "Torso", "poly": circle(pos + e * k, 2.0 * k, 12), "cat": "decal", "color": light, "outline": light, "line_w": 0.2, "z_add": 4})
	out.append({"bone": "Torso", "poly": circle(pos + Vector2(0, 3) * k, 4.2 * k, 16), "cat": "decal", "color": light, "outline": light, "line_w": 0.2, "z_add": 4})
	out.append({"bone": "Torso", "poly": circle(pos + Vector2(0, 1.6) * k, 1.6 * k, 10), "cat": "decal", "color": ink, "outline": ink, "line_w": 0.2, "z_add": 6})
	for e in [Vector2(-3.6, -2.5), Vector2(3.6, -2.5)]:
		out.append({"bone": "Torso", "poly": circle(pos + e * k, 1.3 * k, 10), "cat": "decal", "color": ink, "outline": ink, "line_w": 0.2, "z_add": 6})
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
static func make_piece_nodes(bone: Node2D, piece: Dictionary, fill: Color, line: Color, tag: String, B: Dictionary = {}) -> Array:
	var bname: String = piece["bone"]
	var poly: PackedVector2Array = warp_poly(piece["poly"], bname, B)
	var cat: String = piece["cat"]
	var lw: float = piece.get("line_w", OUTLINE_W)
	var z_add: int = piece.get("z_add", 0)
	var nodes := []
	var ol := grow(poly, lw)
	var trim = piece.get("trim", NAN)
	if trim is float and not is_nan(trim):
		ol = clip(ol, above(warp_point(Vector2(0, trim), bname, B).y))
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
static func rest_global(bone: String, B: Dictionary = {}) -> Vector2:
	for b in bones(B):
		if b[0] == bone:
			return b[2] + (rest_global(b[1], B) if b[1] != "" else Vector2.ZERO)
	return Vector2.ZERO

static func local_pos(bone: String, B: Dictionary = {}) -> Vector2:
	if not B.is_empty():
		for b in bones(B):
			if b[0] == bone:
				return b[2]
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
static func leg_ik(hip: Vector2, target: Vector2, parent_rot: float, B: Dictionary = {}) -> Array:
	var l1 := thigh_len(B)
	var l2 := shin_len(B)
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
