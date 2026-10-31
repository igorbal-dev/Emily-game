extends Node2D
## Demo: ←/→ walk, Space jump, W wave, T talk on/off, B blink,
## 1-4 outfits, H next hairstyle, E/M cycle eyes/mouth.

const OUTFITS := [
	{"top": "tshirt_pink", "bottom": "leggings_grey", "socks": "socks_pink"},
	{"top": "tshirt_yellow", "bottom": "shorts_denim", "socks": "socks_white"},
	{"top": "longsleeve_mint", "bottom": "skirt_lilac", "socks": "socks_pink"},
	{"top": null, "bottom": null, "socks": null},
]
const EYES := ["open", "half", "closed", "happy", "surprised", "sad"]
const MOUTHS := ["smile", "a", "o", "e", "m", "laugh"]
const HAIRS := ["pigtails", "ponytail", "braids", "headband", "bun", "stars", "flowers", "cap"]

@onready var emily: Emily = $Emily
var hair_i := 0
var eye_i := 0
var mouth_i := 0

func _process(delta: float) -> void:
	var busy := emily.player.current_animation in ["jump", "wave"]
	var dir := Input.get_axis("ui_left", "ui_right")
	if dir != 0.0 and not busy:
		emily.facing = int(sign(dir))
		emily.position.x = wrapf(emily.position.x + dir * Emily.WALK_SPEED * delta, -100, 1380)
		if emily.player.current_animation != "walk":
			emily.play("walk")
	elif emily.player.current_animation == "walk":
		emily.play("idle")

func _unhandled_input(e: InputEvent) -> void:
	if not (e is InputEventKey and e.pressed and not e.echo):
		return
	match e.keycode:
		KEY_SPACE: emily.play("jump")
		KEY_W: emily.play("wave")
		KEY_B: emily.play("blink")
		KEY_T: emily.talking = not emily.talking
		KEY_1, KEY_2, KEY_3, KEY_4: emily.set_outfit(OUTFITS[e.keycode - KEY_1])
		KEY_H:
			# only hairstyles that already have PNGs in emily/head/hair/
			for i in HAIRS.size():
				hair_i = (hair_i + 1) % HAIRS.size()
				if ResourceLoader.exists("res://emily/head/hair/%s_front.png" % HAIRS[hair_i]):
					emily.set_hair(HAIRS[hair_i])
					break
		KEY_E:
			eye_i = (eye_i + 1) % EYES.size()
			emily.eyes = EYES[eye_i]
		KEY_M:
			mouth_i = (mouth_i + 1) % MOUTHS.size()
			emily.mouth = MOUTHS[mouth_i]
