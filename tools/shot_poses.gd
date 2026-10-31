extends SceneTree
## Characters side by side in a few poses (same scale, to compare sizes):
## (optional "poses=walk:0,walk:0.15,..." instead of the default poses)
## xvfb-run -a godot --path . --rendering-driver opengl3 --script res://tools/shot_poses.gd -- out.png res://emily/emily.tscn res://mark/mark.tscn [outfit=top:jacket_navy,shoes:boots_brown]
const POSES := [["idle", 0.0], ["walk", 0.2], ["run", 0.15], ["jump", 0.68], ["wave", 1.0], ["spin", 0.5]]
const CW := 300
const H := 640
const GROUND := 600.0

func _initialize() -> void:
	var args := OS.get_cmdline_user_args()
	# optional "outfit=top:jacket_navy,bottom:trousers_navy,shoes:boots_brown" after a scene: dress that row
	var scenes := []
	var outfits := []
	var poses := POSES
	for a in args.slice(1):
		if a.begins_with("poses="):
			poses = []
			for kv in a.trim_prefix("poses=").split(","):
				poses.append([kv.get_slice(":", 0), float(kv.get_slice(":", 1))])
		elif a.begins_with("outfit="):
			var o := {}
			for kv in a.trim_prefix("outfit=").split(","):
				o[kv.get_slice(":", 0)] = kv.get_slice(":", 1)
			outfits[-1] = o
		else:
			scenes.append(a)
			outfits.append({})
	var vp := SubViewport.new()
	vp.size = Vector2i(CW * poses.size(), H * scenes.size())
	vp.transparent_bg = false
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	root.add_child(vp)
	var bg := ColorRect.new()
	bg.color = Color(0.96, 0.94, 0.9)
	bg.size = Vector2(vp.size)
	vp.add_child(bg)
	var chars := []
	for si in scenes.size():
		for pi in poses.size():
			var c = load(scenes[si]).instantiate()
			c.auto_blink = false
			if not outfits[si].is_empty():
				c.outfit = c.outfit.merged(outfits[si], true)
			c.position = Vector2(CW * pi + CW / 2.0, H * si + GROUND)
			vp.add_child(c)
			chars.append([c, poses[pi]])
	for i in 3: await process_frame
	for e in chars:
		var ap: AnimationPlayer = e[0].get_node("AnimationPlayer")
		ap.playback_default_blend_time = 0.0
		ap.play(e[1][0])
		ap.seek(e[1][1], true)
		ap.pause()
	for i in 3: await process_frame
	await RenderingServer.frame_post_draw
	vp.get_texture().get_image().save_png(args[0])
	quit()
