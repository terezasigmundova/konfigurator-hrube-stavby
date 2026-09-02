#!/usr/bin/env python3
from __future__ import annotations

import json
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PANEL_PATH = ROOT / "data" / "panel_1_4.json"
OUT = ROOT / "output" / "panel_1_4_vrstvy_a_vlastnosti.png"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    return ImageFont.truetype(str(Path("/usr/share/fonts/truetype/dejavu") / name), size=size)


def wrapped(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    value: str,
    width: int,
    fill: str,
    typeface: ImageFont.FreeTypeFont,
    spacing: int = 5,
) -> None:
    approx_chars = max(12, int(width / (typeface.size * 0.56)))
    draw.multiline_text(
        xy,
        textwrap.fill(value, width=approx_chars),
        fill=fill,
        font=typeface,
        spacing=spacing,
    )


def number(value: float | None, suffix: str = "") -> str:
    if value is None:
        return "—"
    return f"{value:g}".replace(".", ",") + suffix


def table_header(
    draw: ImageDraw.ImageDraw,
    x0: int,
    y0: int,
    columns: list[tuple[str, int]],
    height: int = 70,
) -> list[int]:
    xs = [x0]
    for _, width in columns:
        xs.append(xs[-1] + width)
    draw.rectangle((x0, y0, xs[-1], y0 + height), fill="#263533")
    for index, (label, _) in enumerate(columns):
        draw.text((xs[index] + 16, y0 + 20), label, fill="#ffffff", font=font(22, True))
    return xs


def main() -> None:
    panel = json.loads(PANEL_PATH.read_text(encoding="utf-8"))
    layer = panel["layers"][0]
    preview = panel["electrical_preview_standard"]
    electrical = panel["electrical_preparation"]
    width, height = 3200, 2200
    image = Image.new("RGB", (width, height), "#f3f6f5")
    draw = ImageDraw.Draw(image)

    draw.rectangle((0, 0, width, 150), fill="#0f172a")
    draw.text((56, 32), "PANEL 1.4  ·  VRSTVY A VLASTNOSTI", fill="#ffffff", font=font(44, True))
    draw.text((3144, 45), "INTERIÉR  →  EXTERIÉR", anchor="ra", fill="#76e0d2", font=font(25, True))

    draw.rounded_rectangle((55, 190, 3145, 410), radius=20, fill="#fff7e6", outline="#e8c87b", width=3)
    draw.text((85, 215), "ROZSAH DODÁVKY", fill="#8a5b08", font=font(22, True))
    wrapped(draw, (85, 255), panel["delivery_note"], 2990, "#3b3325", font(23), spacing=7)

    x0, table_y, table_w = 55, 460, 3090
    columns = [
        ("ID", 120),
        ("Dodávaný prvek", 830),
        ("Tloušťka", 230),
        ("kg/m²", 180),
        ("λ [W/m·K]", 220),
        ("Reakce na oheň", 250),
        ("Funkce", 1260),
    ]
    row_h, header_h = 170, 70
    draw.rounded_rectangle((x0, table_y, x0 + table_w, table_y + header_h + row_h), radius=18, fill="#ffffff", outline="#cbd6d2", width=3)
    xs = table_header(draw, x0, table_y, columns, header_h)
    y = table_y + header_h
    draw.rectangle((x0 + 14, y + 18, x0 + 28, y + row_h - 18), fill=panel["materials"][layer["material_id"]]["color"])
    draw.text((xs[0] + 42, y + 54), layer["id"], fill="#172522", font=font(24, True))
    wrapped(draw, (xs[1] + 16, y + 25), layer["name"], columns[1][1] - 32, "#172522", font(24, True))
    draw.text((xs[2] + 16, y + 55), number(layer["thickness_mm"], " mm"), fill="#172522", font=font(23, True))
    draw.text((xs[3] + 16, y + 55), number(layer.get("mass_kg_m2")), fill="#172522", font=font(22))
    draw.text((xs[4] + 16, y + 55), number(layer.get("lambda_w_mk")), fill="#172522", font=font(22))
    draw.text((xs[5] + 16, y + 55), layer.get("fire_class") or "—", fill="#172522", font=font(22))
    wrapped(draw, (xs[6] + 16, y + 22), layer["function"], columns[6][1] - 32, "#4f605c", font(21), spacing=5)
    for x in xs[1:-1]:
        draw.line((x, y, x, y + row_h), fill="#e4eae8", width=2)

    metric_y = 740
    draw.rounded_rectangle((55, metric_y, 3145, metric_y + 160), radius=18, fill="#ffffff", outline="#cbd6d2", width=3)
    metrics = [
        (90, "Dodávaná tloušťka", "84,0 mm"),
        (720, "Konstrukce", "3 × 28 mm · křížem lepené CLT"),
        (1610, "Pohledová strana", "interiér · kvalita VI"),
        (2400, "Další vrstvy", "žádné"),
    ]
    for x, label, value in metrics:
        draw.text((x, metric_y + 25), label, fill="#64736f", font=font(20))
        draw.text((x, metric_y + 66), value, fill="#172522", font=font(27, True))

    draw.text((55, 945), "VNITŘNÍ SKLADBA CLT · ZOBRAZENA POUZE NA ŘEZU A HRANÁCH", fill="#172522", font=font(28, True))
    lamella_y = 995
    lamella_columns = [
        ("ID", 220),
        ("Lamela", 1000),
        ("Tloušťka", 260),
        ("Směr vláken", 520),
        ("Kvalita povrchu", 520),
        ("Role", 570),
    ]
    lamella_header = 70
    lamella_row = 125
    draw.rounded_rectangle(
        (55, lamella_y, 3145, lamella_y + lamella_header + lamella_row * len(layer["lamellae"])),
        radius=18,
        fill="#ffffff",
        outline="#cbd6d2",
        width=3,
    )
    lxs = table_header(draw, 55, lamella_y, lamella_columns, lamella_header)
    direction = {"vertical_z": "svisle · směr výšky", "horizontal_x": "příčně · směr šířky"}
    roles = ["pohledová strana interiéru", "křížové ztužení panelu", "nepohledová strana exteriéru"]
    for index, lamella in enumerate(layer["lamellae"]):
        row_y = lamella_y + lamella_header + index * lamella_row
        if index % 2:
            draw.rectangle((55, row_y, 3145, row_y + lamella_row), fill="#f6f9f8")
        draw.rectangle((69, row_y + 18, 83, row_y + lamella_row - 18), fill=panel["materials"][lamella["material_id"]]["color"])
        draw.text((lxs[0] + 42, row_y + 43), lamella["id"], fill="#172522", font=font(22, True))
        wrapped(draw, (lxs[1] + 16, row_y + 25), lamella["name"], lamella_columns[1][1] - 32, "#172522", font(22, True))
        draw.text((lxs[2] + 16, row_y + 43), number(lamella["thickness_mm"], " mm"), fill="#172522", font=font(22))
        draw.text((lxs[3] + 16, row_y + 43), direction[lamella["grain_direction"]], fill="#172522", font=font(21))
        quality = "VI · pohledová" if lamella["surface_quality"] == "VI" else "NVI · nepohledová"
        draw.text((lxs[4] + 16, row_y + 43), quality, fill="#172522", font=font(21))
        wrapped(draw, (lxs[5] + 16, row_y + 26), roles[index], lamella_columns[5][1] - 32, "#4f605c", font(20))
        draw.line((55, row_y + lamella_row, 3145, row_y + lamella_row), fill="#dce4e1", width=2)
        for x in lxs[1:-1]:
            draw.line((x, row_y, x, row_y + lamella_row), fill="#e4eae8", width=2)

    card_y = 1510
    draw.rounded_rectangle((55, card_y, 1555, 1840), radius=18, fill="#ffffff", outline="#cbd6d2", width=3)
    draw.text((85, card_y + 28), "ELEKTROINSTALAČNÍ PŘÍPRAVA · SOUČÁST DODÁVKY", fill="#172522", font=font(22, True))
    draw.text((85, card_y + 78), f"{len(preview['bores'])} × Ø {number(preview['diameter_mm'], ' mm')} · vzorové trasy s chráničkami", fill="#138f83", font=font(25, True))
    wrapped(draw, (85, card_y + 128), electrical["user_description"], 1410, "#4f605c", font(20), spacing=5)
    excluded = "Není součástí: " + " · ".join(electrical["excluded_items"]) + "."
    wrapped(draw, (85, card_y + 265), excluded, 1410, "#64736f", font(17, True), spacing=3)

    draw.rounded_rectangle((1605, card_y, 3145, 1840), radius=18, fill="#ffffff", outline="#cbd6d2", width=3)
    draw.text((1635, card_y + 28), "TECHNICKÝ ZÁKLAD", fill="#172522", font=font(24, True))
    draw.text((1635, card_y + 78), "Třívrstvé CLT · typ C · krycí lamely svisle", fill="#138f83", font=font(25, True))
    wrapped(draw, (1635, card_y + 130), panel["technical_basis"]["standard_variant_note"], 1450, "#4f605c", font(21), spacing=6)
    draw.text((1635, card_y + 270), "ρ = 490 kg/m³ · λ = 0,12 W/(m·K) · D-s2, d0", fill="#64736f", font=font(20))

    draw.rounded_rectangle((55, 1885, 3145, 2125), radius=20, fill="#e8f7f4", outline="#8ccfc5", width=3)
    draw.text((85, 1915), "ZÁVAZNÉ PRAVIDLO VIZUALIZACE POHLEDOVÉ STRANY", fill="#087b70", font=font(22, True))
    wrapped(
        draw,
        (85, 1960),
        "Velkoformátový CLT panel se zobrazuje jako souvislá celistvá plocha masivního dřeva bez viditelných spár, drážek nebo rastru jednotlivých prken. Přirozeně viditelná je pouze kresba vláken a suků. Křížové vrstvení se ukazuje výhradně na řezu a hranách.",
        2990,
        "#173b37",
        font(24, True),
        spacing=7,
    )

    draw.text((55, 2160), "Zdroj dat: data/panel_1_4.json · rozměry v mm · PREFA_SOPIK_RENDER_STD_01 · technický základ: Stora Enso CLT", fill="#64736f", font=font(18))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUT, optimize=True)


if __name__ == "__main__":
    main()
