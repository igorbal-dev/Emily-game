extends SceneTree
## Screenshots of the viewer: godot --path . --script res://tools/shot_viewer.gd -- out.png anim tabindex [character index]
func _initialize():
	var args := OS.get_cmdline_user_args()
	var v = load("res://viewer/viewer.tscn").instantiate()
	root.add_child(v)
	for i in 10: await process_frame
	if args.size() > 3:
		v._load_character(int(args[3]))
		for i in 5: await process_frame
	if args.size() > 1:
		v._play(args[1])
	if args.size() > 2:
		v.tabs.current_tab = int(args[2])
	for i in 25: await process_frame
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png(args[0])
	quit()
