extends Node2D
## Демо: Эмили в центре, анимации по кругу, сверху — название текущей анимации.
## Клавиши: 1–7 — выбрать анимацию, ← → — предыдущая/следующая, пробел — «по кругу» вкл/выкл.

## [имя анимации, сколько секунд показывать]
const PLAYLIST := [
	["idle", 6.4],
	["wave", 4.6],
	["walk", 4.0],
	["run", 3.84],
	["jump", 4.2],
	["crouch", 4.0],
	["hide", 6.4],
]

@onready var emily: Node2D = $Emily
@onready var title: Label = $UI/Title
@onready var counter: Label = $UI/Counter

var _index := -1
var _time_left := 0.0
var _auto := true


func _ready() -> void:
	_show(0)


func _process(delta: float) -> void:
	if not _auto:
		return
	_time_left -= delta
	if _time_left <= 0.0:
		_show(_index + 1)


func _unhandled_input(event: InputEvent) -> void:
	if not (event is InputEventKey and event.pressed and not event.echo):
		return
	var key: Key = event.keycode
	if key >= KEY_1 and key <= KEY_7:
		_auto = false
		_show(key - KEY_1)
	elif key == KEY_RIGHT:
		_auto = false
		_show(_index + 1)
	elif key == KEY_LEFT:
		_auto = false
		_show(_index - 1)
	elif key == KEY_SPACE:
		_auto = not _auto
		_time_left = PLAYLIST[_index][1]
		_update_counter()


func _show(i: int) -> void:
	_index = posmod(i, PLAYLIST.size())
	var anim_name: String = PLAYLIST[_index][0]
	_time_left = PLAYLIST[_index][1]
	emily.play_anim(anim_name, 0.3)
	title.text = emily.TITLES[anim_name]
	_update_counter()


func _update_counter() -> void:
	var mode := "по кругу" if _auto else "пробел — по кругу"
	counter.text = "%d / %d   ·   клавиши 1–7, ← →   ·   %s" % [_index + 1, PLAYLIST.size(), mode]
