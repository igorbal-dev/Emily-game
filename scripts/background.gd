extends Node2D
## Простой фон для демо: небо, солнышко, облака и травка.

func _draw() -> void:
	var w := 4000.0
	# небо (полосами, светлее к горизонту)
	for i in 12:
		var t := i / 11.0
		draw_rect(Rect2(-w / 2, -1500 + i * 180, w, 181), Color(0.55, 0.78, 0.98).lerp(Color(0.86, 0.94, 1.0), t))
	# солнце
	draw_circle(Vector2(1080, 110), 70, Color(1.0, 0.93, 0.55))
	draw_circle(Vector2(1080, 110), 56, Color(1.0, 0.86, 0.35))
	# облака
	for c in [Vector2(220, 130), Vector2(560, 80), Vector2(860, 200)]:
		for o in [Vector2(-40, 8), Vector2(0, -10), Vector2(42, 6), Vector2(10, 18)]:
			draw_circle(c + o, 34, Color(1, 1, 1, 0.92))
	# трава
	draw_rect(Rect2(-w / 2, 640, w, 1500), Color(0.55, 0.82, 0.45))
	draw_rect(Rect2(-w / 2, 640, w, 10), Color(0.45, 0.72, 0.36))
