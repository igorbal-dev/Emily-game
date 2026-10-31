extends Node2D
## Эмили на скелете (Skeleton2D / Bone2D).
## Сама сцена scenes/emily.tscn собирается скриптом editor_tools/build_emily.gd.
##
## Анимации: idle, wave, walk, run, jump, crouch, hide.
## Пример:  $Emily.play_anim("wave")

## Какую анимацию включить при запуске (пусто — никакую).
@export var start_animation := "idle"

## Русские названия анимаций (для подписей).
const TITLES := {
	"idle": "Стоит: дышит и моргает",
	"wave": "Машет рукой",
	"walk": "Идёт",
	"run": "Бежит",
	"jump": "Прыгает",
	"crouch": "Приседает",
	"hide": "Закрывает глаза руками (прятки)",
}

@onready var player: AnimationPlayer = $AnimationPlayer


func _ready() -> void:
	if start_animation != "":
		player.play(start_animation)


## Включить анимацию с плавным переходом (blend — время перехода в секундах).
func play_anim(anim_name: String, blend := 0.25) -> void:
	player.play(anim_name, blend)


func get_anim_length(anim_name: String) -> float:
	return player.get_animation(anim_name).length
