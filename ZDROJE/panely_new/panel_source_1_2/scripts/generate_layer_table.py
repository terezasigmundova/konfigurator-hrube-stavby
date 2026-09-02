#!/usr/bin/env python3
from __future__ import annotations

import json
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PANEL_PATH = ROOT / "data" / "panel_1_2.json"
OUT = ROOT / "output" / "panel_1_2_vrstvy_a_vlastnosti.png"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    return ImageFont.truetype(str(Path("/usr/share/fonts/truetype/dejavu") / name), size=size)


def wrapped(draw: ImageDraw.ImageDraw, xy: tuple[int, int], value: str, width: int, fill: str, typeface: ImageFont.FreeTypeFont, spacing: int = 5) -> None:
    approx_chars = max(12, int(width / (typeface.size * 0.56)))
    draw.multiline_text(xy, textwrap.fill(value, width=approx_chars), fill=fill, font=typeface, spacing=spacing)


def number(value: float | None, suffix: str = "") -> str:
    if value is None:
        return "—"
    text = f"{value:g}".replace(".", ",")
    return text + suffix


def main() -> None:
    panel = json.loads(PANEL_PATH.read_text(encoding="utf-8"))
    table_y = 440
    row_h = 158
    header_h = 70
    table_bottom = table_y + header_h + row_h * len(panel["layers"])
    footer_y = table_bottom + 35
    electrical_y = footer_y + 195
    width, height = 3200, electrical_y + 330
    image = Image.new("RGB", (width, height), "#f3f6f5")
    draw = ImageDraw.Draw(image)

    draw.rectangle((0, 0, width, 150), fill="#0f172a")
    draw.text((56, 32), "PANEL 1.2  ·  VRSTVY A VLASTNOSTI", fill="#ffffff", font=font(44, True))
    draw.text((3144, 45), "INTERIÉR  →  EXTERIÉR", anchor="ra", fill="#76e0d2", font=font(25, True))

    draw.rounded_rectangle((55, 190, 3145, 390), radius=20, fill="#fff7e6", outline="#e8c87b", width=3)
    draw.text((85, 215), "ROZSAH DODÁVKY", fill="#8a5b08", font=font(22, True))
    wrapped(draw, (85, 255), panel["delivery_note"], 3000, "#3b3325", font(25), spacing=7)

    x0, table_w = 55, 3090
    columns = [
        ("ID", 120),
        ("Vrstva", 970),
        ("Tloušťka", 240),
        ("kg/m²", 180),
        ("λ [W/m·K]", 230),
        ("Reakce na oheň", 250),
        ("Funkce", 1100),
    ]
    xs = [x0]
    for _, col_w in columns:
        xs.append(xs[-1] + col_w)

    draw.rounded_rectangle((x0, table_y, x0 + table_w, table_y + header_h + row_h * len(panel["layers"])), radius=18, fill="#ffffff", outline="#cbd6d2", width=3)
    draw.rectangle((x0, table_y, x0 + table_w, table_y + header_h), fill="#263533")
    for index, (label, _) in enumerate(columns):
        draw.text((xs[index] + 16, table_y + 20), label, fill="#ffffff", font=font(22, True))

    for row_index, layer in enumerate(panel["layers"]):
        y = table_y + header_h + row_index * row_h
        if row_index % 2:
            draw.rectangle((x0, y, x0 + table_w, y + row_h), fill="#f6f9f8")
        material = panel["materials"][layer["material_id"]]
        draw.rectangle((x0 + 14, y + 18, x0 + 28, y + row_h - 18), fill=material["color"])
        draw.text((xs[0] + 42, y + 49), layer["id"], fill="#172522", font=font(24, True))
        wrapped(draw, (xs[1] + 16, y + 22), layer["name"], columns[1][1] - 32, "#172522", font(24, True))
        if layer["geometry"] == "hosted_infill":
            thickness = number(layer["thickness_mm"], " mm") + "\n(v rámu)"
        else:
            thickness = number(layer["thickness_mm"], " mm")
        draw.multiline_text((xs[2] + 16, y + 40), thickness, fill="#172522", font=font(22, True), spacing=4)
        draw.text((xs[3] + 16, y + 50), number(layer.get("mass_kg_m2")), fill="#172522", font=font(22))
        draw.text((xs[4] + 16, y + 50), number(layer.get("lambda_w_mk")), fill="#172522", font=font(22))
        draw.text((xs[5] + 16, y + 50), layer.get("fire_class") or "—", fill="#172522", font=font(22))
        wrapped(draw, (xs[6] + 16, y + 20), layer["function"], columns[6][1] - 32, "#4f605c", font(21), spacing=5)
        draw.line((x0, y + row_h, x0 + table_w, y + row_h), fill="#dce4e1", width=2)
        for x in xs[1:-1]:
            draw.line((x, y, x, y + row_h), fill="#e4eae8", width=2)

    draw.rounded_rectangle((55, footer_y, 3145, footer_y + 160), radius=18, fill="#ffffff", outline="#cbd6d2", width=3)
    draw.text((90, footer_y + 25), "Dodávaná tloušťka", fill="#64736f", font=font(21))
    total = number(panel["declared_delivered_thickness_mm"], " mm")
    draw.text((90, footer_y + 62), total, fill="#172522", font=font(36, True))
    draw.text((600, footer_y + 25), "Pravidlo součtu", fill="#64736f", font=font(21))
    draw.text((600, footer_y + 65), "Izolace L03 a L07 jsou uvnitř rámů a nepřičítají se podruhé.", fill="#172522", font=font(24, True))

    electrical = panel["electrical_preparation"]
    draw.rounded_rectangle((55, electrical_y, 3145, electrical_y + 270), radius=20, fill="#e8f7f4", outline="#8ccfc5", width=3)
    draw.text((85, electrical_y + 25), electrical["user_heading"].upper(), fill="#087b70", font=font(23, True))
    wrapped(draw, (85, electrical_y + 70), electrical["user_description"], 3000, "#173f3a", font(21), spacing=6)
    excluded = "Není součástí: " + " · ".join(electrical["excluded_items"]) + "."
    wrapped(draw, (85, electrical_y + 174), excluded, 3000, "#526a65", font(19, True), spacing=4)
    draw.text((55, height - 40), "Zdroj: data/panel_1_2.json · rozměry v mm · společný zobrazovací standard PREFA_SOPIK_RENDER_STD_01", fill="#64736f", font=font(18))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUT, optimize=True)


if __name__ == "__main__":
    main()
