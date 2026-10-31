@tool
class_name OutfitItem
extends Resource
## One piece of clothing. Saved as .tres in res://emily/outfits/.
## New T-shirt = duplicate tshirt_pink.tres, change color / decal. That's all.
##
## pattern: "tshirt", "longsleeve", "leggings", "shorts", "skirt", "socks", "bodysuit"
## slot:    "top", "bottom", "socks", "base" (base = the bodysuit, always worn)

@export var slot := "top"
@export var pattern := "tshirt"
@export var color := Color.WHITE
## Leave alpha at 0 to use an automatic darker outline.
@export var outline_color := Color(0, 0, 0, 0)
## "", "heart", "star", "dot"
@export var decal := ""
@export var decal_color := Color("9ed5fb")
## Optional pattern tweaks, e.g. {"sleeve": 32.0, "hem": 40.0, "length": 80.0, "decal_pos": Vector2(15, -56)}
@export var params := {}

func get_outline() -> Color:
	if outline_color.a > 0.0:
		return outline_color
	return Color.from_hsv(color.h, minf(1.0, color.s * 1.15 + 0.05), color.v * 0.72)
