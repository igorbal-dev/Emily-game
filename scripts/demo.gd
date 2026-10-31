extends Node2D
## Демо: Эмили в центре, анимации по кругу, сверху — название текущей анимации.

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


func _ready() -> void:
	_next()


func _process(delta: float) -> void:
	_time_left -= delta
	if _time_left <= 0.0:
		_next()


func _next() -> void:
	_index = (_index + 1) % PLAYLIST.size()
	var anim_name: String = PLAYLIST[_index][0]
	_time_left = PLAYLIST[_index][1]
	emily.play_anim(anim_name, 0.3)
	title.text = emily.TITLES[anim_name]
	counter.text = "%d / %d" % [_index + 1, PLAYLIST.size()]
