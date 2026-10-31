@tool
extends Node2D
## Theo the dog: a frame-by-frame puppet (no skeleton). Frames: theo/frames/*.png (tools/make_theo.py),
## scene + animations: tools/build_theo.gd.
##   theo.play("walk")   # idle, wag, happy, walk, run, jump, shake, bark, sit, tilt, lie, sleep, sniff, dig, beg, hide, front, back, blink
##   theo.facing = -1    # look left

signal action_finished(anim: String)

## units per second when "walk" / "run" play (the viewer moves him with these):
## the run frames move the planted paws ~37 units per frame; walk = 7 fps, run = 14 fps (tools/build_theo.gd)
const STRIDE_PER_FRAME := 37.0
const WALK_SPEED := STRIDE_PER_FRAME * 7.0
const RUN_SPEED := STRIDE_PER_FRAME * 14.0
var walk_speed: float:
	get: return WALK_SPEED
var run_speed: float:
	get: return RUN_SPEED

## (blinking is baked into idle/sit; kept for tools that switch it off)
var auto_blink := true

## one-shot actions: back to idle afterwards
const ONE_SHOT := ["jump", "shake", "bark", "blink"]
## order of the buttons in the viewer
var anim_order := ["idle", "wag", "happy", "walk", "walk_paddle", "run", "jump", "shake", "bark", "sit", "tilt", "beg",
	"sniff", "dig", "lie", "sleep", "hide", "front", "back", "blink"]

@export_range(-1, 1, 2) var facing := 1:
	set(v):
		facing = 1 if v >= 0 else -1
		scale.x = absf(scale.x) * facing

@onready var player: AnimationPlayer = $AnimationPlayer

func _ready() -> void:
	if Engine.is_editor_hint():
		return
	player.animation_finished.connect(_on_finished)
	if not player.is_playing():
		player.play("idle")

func play(anim: String) -> void:
	if player.has_animation(anim):
		player.play(anim)

func _on_finished(anim: StringName) -> void:
	action_finished.emit(anim)
	if String(anim) in ONE_SHOT:
		player.play("idle")

const RU := {
	"idle": "Стоит", "wag": "Виляет хвостом", "happy": "Радуется", "walk": "Идёт", "walk_paddle": "Топчется", "run": "Бежит", "jump": "Прыжок",
	"shake": "Отряхивается", "bark": "Лает", "sit": "Сидит", "tilt": "Слушает", "beg": "Служит", "sniff": "Нюхает",
	"dig": "Копает", "lie": "Лежит", "sleep": "Спит", "hide": "Выглядывает", "front": "Анфас", "back": "Спиной",
	"blink": "Моргает",
}

static func ru(id: String) -> String:
	return RU.get(id, id)

func viewer_options() -> Array:
	return []
