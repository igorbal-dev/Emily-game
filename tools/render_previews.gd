extends SceneTree
## Renders preview frames of every animation into res://previews/.
## Needs a display (use xvfb-run):
##   xvfb-run -a godot --path . --rendering-driver opengl3 --script res://tools/render_previews.gd

const W := 1280
const H := 720
const GROUND := 690.0
const CELL := Vector2i(400, 670)

var emily
var ground_node: Node2D
var walk_t := 0.0
var show_ticks := false
var out_dir := ""

func _initialize() -> void:
	out_dir = ProjectSettings.globalize_path("res://previews")
	DirAccess.make_dir_recursive_absolute(out_dir)
	root.size = Vector2i(W, H)
	RenderingServer.set_default_clear_color(Color(0.96, 0.94, 0.9))
	ground_node = Node2D.new()
	ground_node.draw.connect(_draw_ground)
	root.add_child(ground_node)
	emily = load("res://emily/emily.tscn").instantiate()
	emily.auto_blink = false
	emily.position = Vector2(W / 2.0, GROUND)
	root.add_child(emily)
	run.call_deferred()

func _draw_ground() -> void:
	ground_node.draw_rect(Rect2(0, GROUND, W, H - GROUND), Color(0.86, 0.82, 0.74))
	ground_node.draw_line(Vector2(0, GROUND), Vector2(W, GROUND), Color(0.6, 0.55, 0.48), 2.0)
	if show_ticks:
		var off := fposmod(-walk_t * 231.0, 80.0)
		var x := off - 80.0
		while x < W:
			ground_node.draw_line(Vector2(x, GROUND + 2), Vector2(x - 10, GROUND + 22), Color(0.6, 0.55, 0.48), 3.0)
			x += 80.0

func grab(region := Rect2i()) -> Image:
	await RenderingServer.frame_post_draw
	var img := root.get_texture().get_image()
	if region.size != Vector2i.ZERO:
		img = img.get_region(region)
	return img

func pose(anim: String, t: float) -> void:
	var ap: AnimationPlayer = emily.get_node("AnimationPlayer")
	ap.playback_default_blend_time = 0.0
	ap.play(anim)
	ap.seek(t, true)
	ap.pause()
	walk_t = t
	ground_node.queue_redraw()
	await process_frame
	await process_frame

func sheet(frames: Array, cols: int) -> Image:
	var rows := ceili(frames.size() / float(cols))
	var s := Image.create(CELL.x * cols, CELL.y * rows, false, Image.FORMAT_RGBA8)
	s.fill(Color(0.96, 0.94, 0.9))
	for i in frames.size():
		var f: Image = frames[i]
		f.convert(Image.FORMAT_RGBA8)
		s.blit_rect(f, Rect2i(Vector2i.ZERO, f.get_size()), Vector2i((i % cols) * CELL.x, (i / cols) * CELL.y))
	return s

func run() -> void:
	await process_frame
	await process_frame
	var region := Rect2i(W / 2 - CELL.x / 2, int(GROUND) - CELL.y + 28, CELL.x, CELL.y)
	emily.position.y = GROUND
	var anims := {"idle": [3.0, 8], "walk": [0.9, 12], "wave": [2.4, 12], "jump": [1.4, 14], "talk": [2.4, 8], "blink": [0.24, 6]}
	for anim in anims:
		var length: float = anims[anim][0]
		var n: int = anims[anim][1]
		show_ticks = anim == "walk"
		var frames := []
		DirAccess.make_dir_recursive_absolute(out_dir + "/" + anim)
		for i in n:
			var t := length * i / (n if anim in ["idle", "walk", "talk"] else n - 1)
			await pose(anim, t)
			var img: Image = await grab(region)
			img.save_png("%s/%s/%02d.png" % [out_dir, anim, i])
			frames.append(img)
		sheet(frames, mini(n, 6)).save_png("%s/%s_sheet.png" % [out_dir, anim])
		# dense frames for GIFs
		DirAccess.make_dir_recursive_absolute(out_dir + "/_gif/" + anim)
		var dn := int(length * 20.0)
		for i in dn:
			await pose(anim, length * i / dn)
			var img2: Image = await grab(region)
			img2.resize(CELL.x / 2, CELL.y / 2, Image.INTERPOLATE_LANCZOS)
			img2.save_png("%s/_gif/%s/%03d.png" % [out_dir, anim, i])
	show_ticks = false
	# outfits
	var outfits := [
		{"top": null, "bottom": null, "socks": null},
		{"top": "tshirt_pink", "bottom": "leggings_grey", "socks": "socks_pink"},
		{"top": "tshirt_yellow", "bottom": "shorts_denim", "socks": "socks_white"},
		{"top": "longsleeve_mint", "bottom": "skirt_lilac", "socks": "socks_pink"},
	]
	emily.eyes = "open"
	emily.mouth = "smile"
	var frames2 := []
	for o in outfits:
		emily.set_outfit(o)
		await pose("idle", 0.0)
		frames2.append(await grab(region))
	sheet(frames2, 4).save_png(out_dir + "/outfits.png")
	emily.set_outfit({"top": "tshirt_pink", "bottom": "leggings_grey", "socks": "socks_pink"})
	# close-ups of joints in bent poses (2.5x)
	emily.scale = Vector2(2.4, 2.4)
	var close := []
	var shots := [["walk", 0.2, Vector2(0, 160)], ["walk", 0.62, Vector2(0, 160)], ["jump", 0.28, Vector2(0, 260)],
		["jump", 0.7, Vector2(0, 360)], ["wave", 1.0, Vector2(0, 760)], ["talk", 1.0, Vector2(0, 620)]]
	for sh in shots:
		emily.position = Vector2(W / 2.0, H / 2.0) + sh[2]
		await pose(sh[0], sh[1])
		close.append(await grab(Rect2i(W / 2 - 200, 50, 400, 620)))
	sheet(close, 6).save_png(out_dir + "/closeups.png")
	emily.scale = Vector2.ONE
	quit()
