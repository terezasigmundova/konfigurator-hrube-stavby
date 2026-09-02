#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PANEL_PATH = ROOT / "data" / "panel_1_3.json"
STANDARD_PATH = ROOT / "data" / "render_standard.json"
OUT_MODELS = ROOT / "output" / "models"
OUT_RENDERS = ROOT / "output" / "renders"
OUT_VALIDATION = ROOT / "output" / "validation"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def hex_rgb(value: str) -> tuple[float, float, float]:
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) / 255.0 for i in (0, 2, 4))


def lighten(rgb: tuple[float, float, float], amount: float) -> tuple[float, float, float]:
    return tuple(min(1.0, max(0.0, c + amount)) for c in rgb)


def build_geometry(panel: dict) -> tuple[list[dict], dict[str, tuple[float, float]], float]:
    width = float(panel["reference_sample"]["width_mm"])
    height = float(panel["reference_sample"]["height_mm"])
    objects: list[dict] = []
    layer_ranges: dict[str, tuple[float, float]] = {}
    cursor_y = 0.0

    for layer in sorted(panel["layers"], key=lambda item: item["order"]):
        layer_id = layer["id"]
        thickness = float(layer["thickness_mm"])
        geometry = layer["geometry"]

        if layer["additive_to_total"]:
            y0, y1 = cursor_y, cursor_y + thickness
            layer_ranges[layer_id] = (y0, y1)
            cursor_y = y1
        else:
            host = layer["host_layer_id"]
            if host not in layer_ranges:
                raise ValueError(f"Host layer {host} must precede {layer_id}")
            y0, y1 = layer_ranges[host]
            if not math.isclose(y1 - y0, thickness, abs_tol=1e-6):
                raise ValueError(f"Hosted infill {layer_id} thickness differs from host {host}")
            layer_ranges[layer_id] = (y0, y1)

        base = {
            "layer_id": layer_id,
            "layer_order": int(layer["order"]),
            "exploded_group": int(layer["exploded_group"]),
            "material_id": layer["material_id"],
        }

        if geometry == "solid":
            objects.append({**base, "name": f"{layer_id}_solid", "bounds": [0.0, width, y0, y1, 0.0, height]})
        elif geometry == "frame":
            member_width = float(layer["member_face_width_mm"])
            member_depth = float(layer["member_depth_mm"])
            if not math.isclose(member_depth, y1 - y0, abs_tol=1e-6):
                raise ValueError(f"Frame depth mismatch in {layer_id}")
            layout = layer.get("frame_layout", "edge_pair")
            axis = layer.get("member_axis", "vertical")
            if layout == "single_centered_member":
                if axis == "vertical":
                    if member_width >= width:
                        raise ValueError(f"Vertical frame member width invalid in {layer_id}")
                    member_x0 = (width - member_width) / 2.0
                    member_x1 = member_x0 + member_width
                    objects.append({**base, "name": f"{layer_id}_vertical_center", "bounds": [member_x0, member_x1, y0, y1, 0.0, height]})
                elif axis == "horizontal":
                    if member_width >= height:
                        raise ValueError(f"Horizontal frame member width invalid in {layer_id}")
                    member_z0 = (height - member_width) / 2.0
                    member_z1 = member_z0 + member_width
                    objects.append({**base, "name": f"{layer_id}_horizontal_center", "bounds": [0.0, width, y0, y1, member_z0, member_z1]})
                else:
                    raise ValueError(f"Unsupported member axis {axis} in {layer_id}")
            elif layout == "edge_pair":
                if axis != "vertical":
                    raise ValueError(f"Edge-pair layout only supports vertical members in {layer_id}")
                if member_width * 2 >= width:
                    raise ValueError(f"Frame member width invalid in {layer_id}")
                objects.append({**base, "name": f"{layer_id}_stud_left", "bounds": [0.0, member_width, y0, y1, 0.0, height]})
                objects.append({**base, "name": f"{layer_id}_stud_right", "bounds": [width - member_width, width, y0, y1, 0.0, height]})
            else:
                raise ValueError(f"Unsupported frame layout {layout} in {layer_id}")
        elif geometry == "hosted_infill":
            host = next(item for item in panel["layers"] if item["id"] == layer["host_layer_id"])
            member_width = float(host["member_face_width_mm"])
            layout = host.get("frame_layout", "edge_pair")
            axis = host.get("member_axis", "vertical")
            if axis != "vertical":
                raise ValueError(f"Hosted infill currently requires vertical host members in {layer_id}")
            if layout == "single_centered_member":
                member_x0 = (width - member_width) / 2.0
                member_x1 = member_x0 + member_width
                objects.append({**base, "name": f"{layer_id}_infill_left", "bounds": [0.0, member_x0, y0, y1, 0.0, height]})
                objects.append({**base, "name": f"{layer_id}_infill_right", "bounds": [member_x1, width, y0, y1, 0.0, height]})
            elif layout == "edge_pair":
                objects.append({**base, "name": f"{layer_id}_infill", "bounds": [member_width, width - member_width, y0, y1, 0.0, height]})
            else:
                raise ValueError(f"Unsupported host frame layout {layout} in {layer_id}")
        else:
            raise ValueError(f"Unsupported geometry type: {geometry}")

    return objects, layer_ranges, cursor_y


def cuboid_vertices(bounds: list[float]) -> list[tuple[float, float, float]]:
    x0, x1, y0, y1, z0, z1 = bounds
    return [
        (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
        (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1),
    ]


def cuboid_faces(vertices: list[tuple[float, float, float]]) -> list[list[tuple[float, float, float]]]:
    indices = [
        (0, 1, 5, 4),
        (1, 2, 6, 5),
        (2, 3, 7, 6),
        (3, 0, 4, 7),
        (4, 5, 6, 7),
        (0, 3, 2, 1),
    ]
    return [[vertices[i] for i in face] for face in indices]


def render_scene(panel: dict, standard: dict, objects: list[dict], output_path: Path, exploded: bool) -> None:
    width_px = int(standard["render"]["asset_width_px"])
    height_px = int(standard["render"]["asset_height_px"])
    dpi = 160
    fig = plt.figure(figsize=(width_px / dpi, height_px / dpi), dpi=dpi)
    ax = fig.add_subplot(111, projection="3d")
    fig.patch.set_alpha(0.0)
    ax.set_facecolor((1, 1, 1, 0))

    gap = float(standard["exploded_view"]["gap_between_construction_groups_mm"])
    materials = panel["materials"]

    face_shades = [0.07, -0.02, -0.08, 0.02, 0.12, -0.12]
    for obj in objects:
        bounds = list(obj["bounds"])
        if exploded:
            offset = obj["exploded_group"] * gap
            bounds[2] += offset
            bounds[3] += offset
        vertices = cuboid_vertices(bounds)
        faces = cuboid_faces(vertices)
        material = materials[obj["material_id"]]
        rgb = hex_rgb(material["color"])
        alpha = float(material.get("opacity", 1.0))
        colors = [(*lighten(rgb, shade), alpha) for shade in face_shades]
        edge = lighten(rgb, -0.22)
        poly = Poly3DCollection(
            faces,
            facecolors=colors,
            edgecolors=[(*edge, min(1.0, alpha + 0.18))],
            linewidths=1.4 if obj["material_id"] == "vapour_membrane" else 0.75,
        )
        poly.set_zsort("average")
        ax.add_collection3d(poly)

    limits = standard["common_scene_limits_mm"]
    ax.set_xlim(*limits["x"])
    ax.set_ylim(*limits["y"])
    ax.set_zlim(*limits["z"])
    ax.set_box_aspect([
        limits["x"][1] - limits["x"][0],
        limits["y"][1] - limits["y"][0],
        limits["z"][1] - limits["z"][0],
    ])
    camera = standard["camera"]
    ax.set_proj_type("ortho")
    ax.view_init(elev=float(camera["elevation_deg"]), azim=float(camera["azimuth_deg"]), roll=float(camera["roll_deg"]))
    ax.set_axis_off()
    ax.set_position([0.0, 0.0, 1.0, 1.0])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(output_path, transparent=True, dpi=dpi, pad_inches=0)
    plt.close(fig)


def write_obj(panel: dict, objects: list[dict], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    mtl_path = path.with_suffix(".mtl")
    lines = [
        "# PREFA SOPIK parametric wall panel",
        "# Units: millimetres (1 OBJ unit = 1 mm)",
        f"mtllib {mtl_path.name}",
    ]
    vertex_offset = 1
    face_indices = [(1, 2, 6, 5), (2, 3, 7, 6), (3, 4, 8, 7), (4, 1, 5, 8), (5, 6, 7, 8), (1, 4, 3, 2)]

    for obj in objects:
        vertices = cuboid_vertices(obj["bounds"])
        lines.append(f"o {obj['name']}")
        lines.append(f"g {obj['layer_id']}")
        lines.append(f"usemtl {obj['material_id']}")
        for x, y, z in vertices:
            lines.append(f"v {x:.6f} {y:.6f} {z:.6f}")
        for face in face_indices:
            idx = [vertex_offset + i - 1 for i in face]
            lines.append("f " + " ".join(str(i) for i in idx))
        vertex_offset += 8
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    mtl_lines = ["# Deterministic control materials"]
    for material_id, material in panel["materials"].items():
        rgb = hex_rgb(material["color"])
        mtl_lines.extend([
            f"newmtl {material_id}",
            f"Kd {rgb[0]:.6f} {rgb[1]:.6f} {rgb[2]:.6f}",
            f"d {float(material.get('opacity', 1.0)):.6f}",
            "illum 2",
            "",
        ])
    mtl_path.write_text("\n".join(mtl_lines), encoding="utf-8")


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    path = Path("/usr/share/fonts/truetype/dejavu") / name
    return ImageFont.truetype(str(path), size=size)


def fit_image(path: Path, box: tuple[int, int]) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    image.thumbnail(box, Image.Resampling.LANCZOS)
    return image


def draw_cross_section(draw: ImageDraw.ImageDraw, panel: dict, layer_ranges: dict[str, tuple[float, float]], area: tuple[int, int, int, int]) -> None:
    x0, y0, x1, y1 = area
    total = float(panel["declared_delivered_thickness_mm"])
    bar_left = x0 + 90
    bar_right = x1 - 90
    bar_top = y0 + 105
    bar_bottom = bar_top + 190
    px_per_mm = (bar_right - bar_left) / total
    draw.text((x0, y0), "Přesný proporcionální řez dodávanou tloušťkou", fill="#162522", font=font(30, True))
    draw.text((x0, y0 + 45), "Izolace L05 leží uvnitř nosného rámu L04 a nepřičítá se podruhé.", fill="#5f706d", font=font(22))

    additive = [layer for layer in panel["layers"] if layer["additive_to_total"]]
    for layer in additive:
        ly0, ly1 = layer_ranges[layer["id"]]
        left = bar_left + round(ly0 * px_per_mm)
        right = bar_left + round(ly1 * px_per_mm)
        if right <= left:
            right = left + 1
        color = panel["materials"][layer["material_id"]]["color"]
        draw.rectangle((left, bar_top, right, bar_bottom), fill=color, outline="#42514e", width=2)

    draw.line((bar_left, bar_bottom + 45, bar_right, bar_bottom + 45), fill="#162522", width=2)
    ticks = [0.0]
    for layer in additive:
        ticks.append(layer_ranges[layer["id"]][1])
    for value in ticks:
        x = bar_left + round(value * px_per_mm)
        draw.line((x, bar_bottom + 34, x, bar_bottom + 57), fill="#162522", width=2)
    draw.text((bar_left - 8, bar_bottom + 64), "0", anchor="ma", fill="#162522", font=font(18))
    draw.text((bar_right, bar_bottom + 64), f"{total:.1f} mm", anchor="ma", fill="#162522", font=font(20, True))

    labels = [
        ("INTERIÉR", bar_left, "la"),
        ("EXTERIÉR", bar_right, "ra"),
    ]
    for text, x, anchor in labels:
        draw.text((x, bar_top - 32), text, anchor=anchor, fill="#138f83", font=font(20, True))

    legend_y = bar_bottom + 115
    columns = 4
    col_w = (bar_right - bar_left) // columns
    for index, layer in enumerate(panel["layers"]):
        col = index % columns
        row = index // columns
        x = bar_left + col * col_w
        y = legend_y + row * 58
        material_color = panel["materials"][layer["material_id"]]["color"]
        draw.rounded_rectangle((x, y + 4, x + 30, y + 34), radius=5, fill=material_color, outline="#65736f", width=1)
        thickness = f"{layer['thickness_mm']:g} mm"
        if not layer["additive_to_total"]:
            thickness += " v rámu"
        draw.text((x + 42, y), f"{layer['id']}  {thickness}", fill="#162522", font=font(18, True))
        name = layer["name"]
        if len(name) > 38:
            name = name[:36] + "…"
        draw.text((x + 42, y + 25), name, fill="#5f706d", font=font(16))


def create_proof_sheet(panel: dict, standard: dict, layer_ranges: dict[str, tuple[float, float]], assembled: Path, exploded: Path, output: Path, validation: dict) -> None:
    width = int(standard["render"]["proof_width_px"])
    height = int(standard["render"]["proof_height_px"])
    canvas = Image.new("RGB", (width, height), "#f3f6f5")
    draw = ImageDraw.Draw(canvas)

    draw.rectangle((0, 0, width, 150), fill="#0f172a")
    draw.text((56, 33), "PANEL 1.3  ·  KONTROLA GEOMETRIE", fill="#ffffff", font=font(46, True))
    draw.text((width - 56, 45), "PREFA ŠOPÍK · STANDARD 01", anchor="ra", fill="#77e0d2", font=font(26, True))

    panels = [(48, 190, 1040, 1180), (1080, 190, 2072, 1180)]
    for box, title, image_path in zip(panels, ["Složený stav", "Rozložený stav"], [assembled, exploded]):
        x0, y0, x1, y1 = box
        draw.rounded_rectangle(box, radius=22, fill="#ffffff", outline="#d5dedb", width=3)
        draw.text((x0 + 28, y0 + 24), title, fill="#162522", font=font(30, True))
        if title.startswith("Rozložený"):
            draw.text((x0 + 28, y0 + 66), "Stejná geometrie, pouze posun skupin 30 mm", fill="#5f706d", font=font(19))
        image = fit_image(image_path, (x1 - x0 - 50, y1 - y0 - 105))
        px = x0 + (x1 - x0 - image.width) // 2
        py = y0 + 80 + (y1 - y0 - 90 - image.height) // 2
        canvas.alpha_composite(image, (px, py)) if canvas.mode == "RGBA" else canvas.paste(image, (px, py), image)

    table_box = (2110, 190, 3152, 1180)
    draw.rounded_rectangle(table_box, radius=22, fill="#ffffff", outline="#d5dedb", width=3)
    draw.text((2140, 214), "Rozměrový protokol", fill="#162522", font=font(30, True))
    rows = [
        ("Referenční výřez", "625 × 900 mm"),
        ("Fermacell v dodávce", "12,5 mm (2×)"),
        ("Instalační latě", "60 × 40 mm"),
        ("Instalační předstěna", "otevřená · 40 mm"),
        ("Nosné KVH", "60 × 160 mm"),
        ("Nosný rám", "160 mm"),
        ("Elektro-příprava", "zajišťuje klient"),
        ("Izolace + vnitřní záklop", "zajišťuje klient"),
        ("Celková tloušťka", "225,5 mm"),
    ]
    y = 284
    for label, value in rows:
        draw.line((2140, y + 48, 3120, y + 48), fill="#e1e8e6", width=2)
        draw.text((2140, y), label, fill="#5f706d", font=font(21))
        draw.text((3120, y), value, anchor="ra", fill="#162522", font=font(23, True))
        y += 78
    status_color = "#0d9f79" if validation["status"] == "PASS" else "#c33c32"
    draw.rounded_rectangle((2140, 1025, 3120, 1136), radius=16, fill="#e2f6ef" if validation["status"] == "PASS" else "#fde9e7")
    draw.text((2170, 1045), "AUTOMATICKÁ VALIDACE", fill="#5f706d", font=font(19, True))
    draw.text((3090, 1040), validation["status"], anchor="ra", fill=status_color, font=font(34, True))

    draw_cross_section(draw, panel, layer_ranges, (48, 1260, 3152, 2090))
    draw.text((50, 2154), "Kontrolní podklad – nikoliv finální fotorealistická vizualizace. Mezery rozloženého stavu nejsou součástí tloušťky.", fill="#5f706d", font=font(19))
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, quality=96)


def geometry_hash(objects: list[dict]) -> str:
    payload = json.dumps(objects, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def main() -> None:
    panel = load_json(PANEL_PATH)
    standard = load_json(STANDARD_PATH)
    objects, layer_ranges, calculated_total = build_geometry(panel)
    declared_total = float(panel["declared_delivered_thickness_mm"])

    additive_sum = sum(float(layer["thickness_mm"]) for layer in panel["layers"] if layer["additive_to_total"])
    checks = {
        "declared_equals_geometry": math.isclose(declared_total, calculated_total, abs_tol=1e-6),
        "declared_equals_additive_sum": math.isclose(declared_total, additive_sum, abs_tol=1e-6),
        "fermacell_actual_thickness_12_5": all(
            math.isclose(float(layer["thickness_mm"]), 12.5, abs_tol=1e-6)
            for layer in panel["layers"] if layer["material_id"] == "fermacell_raw"
        ),
        "service_frame_60x40": any(
            layer["id"] == "L01" and math.isclose(float(layer["member_face_width_mm"]), 60.0) and math.isclose(float(layer["member_depth_mm"]), 40.0)
            for layer in panel["layers"]
        ),
        "structural_frame_60x160": any(
            layer["id"] == "L04" and math.isclose(float(layer["member_face_width_mm"]), 60.0) and math.isclose(float(layer["member_depth_mm"]), 160.0)
            for layer in panel["layers"]
        ),
        "service_cavity_delivered_open": all(
            not (layer["geometry"] == "hosted_infill" and layer.get("host_layer_id") == "L01")
            for layer in panel["layers"]
        ),
        "interior_finish_not_delivered": all(
            not (layer["material_id"] == "fermacell_raw" and layer["order"] < 2)
            for layer in panel["layers"]
        ),
        "electrical_preparation_by_client": panel.get("electrical_preparation", {}).get("included") is False
            and panel.get("electrical_preparation", {}).get("responsibility") == "client",
        "customer_completion_documented": panel.get("customer_completion", {}).get("required") is True,
        "no_contact_insulation_or_facade_layers": all(
            layer["material_id"] not in {"mineral_wool_facade", "reinforced_basecoat", "diffusion_membrane"}
            and "fasádní izolace" not in layer["name"].lower()
            and "armovací" not in layer["name"].lower()
            for layer in panel["layers"]
        ),
        "hosted_infill_not_double_counted": all(not layer["additive_to_total"] for layer in panel["layers"] if layer["geometry"] == "hosted_infill"),
    }
    validation = {
        "panel_id": panel["panel_id"],
        "standard_id": standard["standard_id"],
        "status": "PASS" if all(checks.values()) else "FAIL",
        "declared_total_thickness_mm": declared_total,
        "calculated_total_thickness_mm": calculated_total,
        "logical_layer_count": len(panel["layers"]),
        "geometry_object_count": len(objects),
        "geometry_sha256": geometry_hash(objects),
        "checks": checks,
        "layer_ranges_mm": {key: list(value) for key, value in layer_ranges.items()},
    }

    if validation["status"] != "PASS":
        raise ValueError(json.dumps(validation, indent=2, ensure_ascii=False))

    assembled_path = OUT_RENDERS / "panel_1_3_geometry_assembled.png"
    exploded_path = OUT_RENDERS / "panel_1_3_geometry_exploded.png"
    render_scene(panel, standard, objects, assembled_path, exploded=False)
    render_scene(panel, standard, objects, exploded_path, exploded=True)
    write_obj(panel, objects, OUT_MODELS / "panel_1_3.obj")
    (OUT_VALIDATION / "panel_1_3_validation.json").write_text(json.dumps(validation, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    create_proof_sheet(
        panel,
        standard,
        layer_ranges,
        assembled_path,
        exploded_path,
        OUT_VALIDATION / "panel_1_3_geometry_control.png",
        validation,
    )
    print(json.dumps(validation, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
