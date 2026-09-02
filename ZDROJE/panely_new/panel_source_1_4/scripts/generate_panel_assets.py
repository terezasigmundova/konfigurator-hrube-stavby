#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from scipy.spatial import Delaunay
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PANEL_PATH = ROOT / "data" / "panel_1_4.json"
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

        if geometry == "clt_panel":
            lamella_cursor = y0
            for lamella in layer["lamellae"]:
                lamella_y0 = lamella_cursor
                lamella_y1 = lamella_y0 + float(lamella["thickness_mm"])
                objects.append({
                    **base,
                    "name": lamella["id"],
                    "geometry_kind": "cuboid",
                    "material_id": lamella["material_id"],
                    "exploded_group": int(lamella["exploded_group"]),
                    "lamella_id": lamella["id"],
                    "bounds": [0.0, width, lamella_y0, lamella_y1, 0.0, height],
                    "has_electrical_bores": lamella["id"] == "L01-B",
                })
                lamella_cursor = lamella_y1
            if not math.isclose(lamella_cursor, y1, abs_tol=1e-6):
                raise ValueError(f"CLT lamellae do not fill layer {layer_id}")
            preview = panel["electrical_preview_standard"]
            for bore in preview["bores"]:
                objects.append({
                    **base,
                    "name": bore["id"],
                    "geometry_kind": "bore_marker",
                    "material_id": "clt_bore_shadow",
                    "exploded_group": 1,
                    "center_x_mm": float(bore["center_x_mm"]),
                    "center_y_mm": float(bore["center_y_mm"]),
                    "radius_mm": float(preview["diameter_mm"]) / 2.0,
                    "z0_mm": 0.0,
                    "z1_mm": height,
                })
        elif geometry == "solid":
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
        if obj.get("geometry_kind") == "bore_marker":
            center_y = float(obj["center_y_mm"])
            if exploded:
                center_y += float(obj["exploded_group"]) * gap
            center_x = float(obj["center_x_mm"])
            radius = float(obj["radius_mm"])
            z = float(obj["z1_mm"]) + 0.35
            segments = 48
            center = (center_x, center_y, z)
            ring = [
                (center_x + radius * math.cos(2 * math.pi * i / segments),
                 center_y + radius * math.sin(2 * math.pi * i / segments), z)
                for i in range(segments)
            ]
            triangles = [[center, ring[i], ring[(i + 1) % segments]] for i in range(segments)]
            material = materials[obj["material_id"]]
            rgb = hex_rgb(material["color"])
            poly = Poly3DCollection(triangles, facecolors=[(*rgb, 1.0)], edgecolors="none")
            poly.set_zsort("max")
            ax.add_collection3d(poly)
            continue
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
            linewidths=0.75,
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


def prism_mesh_with_vertical_bores(bounds: list[float], bores: list[dict], segments: int = 64) -> tuple[list[tuple[float, float, float]], list[tuple[int, ...]]]:
    x0, x1, y0, y1, z0, z1 = bounds
    points: list[tuple[float, float]] = []

    def add_point(x: float, y: float) -> None:
        key = (round(float(x), 7), round(float(y), 7))
        if key not in {(round(px, 7), round(py, 7)) for px, py in points}:
            points.append((float(x), float(y)))

    for corner in ((x0, y0), (x1, y0), (x1, y1), (x0, y1)):
        add_point(*corner)
    for bore in bores:
        cx, cy, radius = bore["cx"], bore["cy"], bore["radius"]
        for index in range(segments):
            angle = 2.0 * math.pi * index / segments
            add_point(cx + radius * math.cos(angle), cy + radius * math.sin(angle))

    grid_x = np.linspace(x0, x1, 31)
    grid_y = np.linspace(y0, y1, 7)
    for x in grid_x:
        for y in grid_y:
            if all((x - bore["cx"]) ** 2 + (y - bore["cy"]) ** 2 >= (bore["radius"] * 1.04) ** 2 for bore in bores):
                add_point(float(x), float(y))

    points_array = np.asarray(points, dtype=np.float64)
    triangulation = Delaunay(points_array)
    surface_triangles: list[tuple[int, int, int]] = []
    for simplex in triangulation.simplices:
        triangle = points_array[simplex]
        probes = [triangle.mean(axis=0), (triangle[0] + triangle[1]) / 2.0, (triangle[1] + triangle[2]) / 2.0, (triangle[2] + triangle[0]) / 2.0]
        if any(any((probe[0] - bore["cx"]) ** 2 + (probe[1] - bore["cy"]) ** 2 < (bore["radius"] * 0.995) ** 2 for bore in bores) for probe in probes):
            continue
        surface_triangles.append(tuple(int(value) for value in simplex))

    vertices = [(float(x), float(y), z0) for x, y in points] + [(float(x), float(y), z1) for x, y in points]
    point_count = len(points)
    faces: list[tuple[int, ...]] = []
    for a, b, c in surface_triangles:
        faces.append((a, c, b))
        faces.append((a + point_count, b + point_count, c + point_count))

    def find_point(x: float, y: float) -> int:
        distances = np.sum((points_array - np.array([x, y])) ** 2, axis=1)
        return int(np.argmin(distances))

    i00, i10 = find_point(x0, y0), find_point(x1, y0)
    i11, i01 = find_point(x1, y1), find_point(x0, y1)
    faces.extend([
        (i00, i10, i10 + point_count, i00 + point_count),
        (i10, i11, i11 + point_count, i10 + point_count),
        (i11, i01, i01 + point_count, i11 + point_count),
        (i01, i00, i00 + point_count, i01 + point_count),
    ])

    for bore in bores:
        start = len(vertices)
        ring_bottom = []
        ring_top = []
        for index in range(segments):
            angle = 2.0 * math.pi * index / segments
            x = bore["cx"] + bore["radius"] * math.cos(angle)
            y = bore["cy"] + bore["radius"] * math.sin(angle)
            ring_bottom.append(len(vertices))
            vertices.append((x, y, z0))
            ring_top.append(len(vertices))
            vertices.append((x, y, z1))
        for index in range(segments):
            nxt = (index + 1) % segments
            faces.append((ring_bottom[index], ring_bottom[nxt], ring_top[nxt], ring_top[index]))

    return vertices, faces


def write_obj(panel: dict, objects: list[dict], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    mtl_path = path.with_suffix(".mtl")
    lines = [
        "# PREFA SOPIK parametric wall panel",
        "# Units: millimetres (1 OBJ unit = 1 mm)",
        f"mtllib {mtl_path.name}",
    ]
    vertex_offset = 1
    face_indices = [(0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7), (4, 5, 6, 7), (0, 3, 2, 1)]
    preview = panel["electrical_preview_standard"]
    bores = [
        {"cx": float(item["center_x_mm"]), "cy": float(item["center_y_mm"]), "radius": float(preview["diameter_mm"]) / 2.0}
        for item in preview["bores"]
    ]

    for obj in objects:
        if obj.get("geometry_kind") == "bore_marker":
            continue
        if obj.get("has_electrical_bores"):
            vertices, faces = prism_mesh_with_vertical_bores(obj["bounds"], bores)
        else:
            vertices = cuboid_vertices(obj["bounds"])
            faces = face_indices
        lines.append(f"o {obj['name']}")
        lines.append(f"g {obj['layer_id']}")
        lines.append(f"usemtl {obj['material_id']}")
        for x, y, z in vertices:
            lines.append(f"v {x:.6f} {y:.6f} {z:.6f}")
        for face in faces:
            idx = [vertex_offset + i for i in face]
            lines.append("f " + " ".join(str(i) for i in idx))
        vertex_offset += len(vertices)
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
    draw.text((x0, y0 + 45), "Tři křížem orientované lamely 28 / 28 / 28 mm tvoří jeden masivní panel tloušťky 84 mm.", fill="#5f706d", font=font(22))

    additive = [layer for layer in panel["layers"] if layer["additive_to_total"]]
    clt_layer = next((layer for layer in additive if layer["geometry"] == "clt_panel"), None)
    if clt_layer:
        cursor = 0.0
        for lamella in clt_layer["lamellae"]:
            left = bar_left + round(cursor * px_per_mm)
            cursor += float(lamella["thickness_mm"])
            right = bar_left + round(cursor * px_per_mm)
            color = panel["materials"][lamella["material_id"]]["color"]
            draw.rectangle((left, bar_top, right, bar_bottom), fill=color, outline="#42514e", width=2)
    else:
        for layer in additive:
            ly0, ly1 = layer_ranges[layer["id"]]
            left = bar_left + round(ly0 * px_per_mm)
            right = bar_left + round(ly1 * px_per_mm)
            if right <= left:
                right = left + 1
            color = panel["materials"][layer["material_id"]]["color"]
            draw.rectangle((left, bar_top, right, bar_bottom), fill=color, outline="#42514e", width=2)

    draw.line((bar_left, bar_bottom + 45, bar_right, bar_bottom + 45), fill="#162522", width=2)
    if clt_layer:
        ticks = [0.0]
        cursor = 0.0
        for lamella in clt_layer["lamellae"]:
            cursor += float(lamella["thickness_mm"])
            ticks.append(cursor)
    else:
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
    display_items = clt_layer["lamellae"] if clt_layer else panel["layers"]
    for index, layer in enumerate(display_items):
        col = index % columns
        row = index // columns
        x = bar_left + col * col_w
        y = legend_y + row * 58
        material_color = panel["materials"][layer["material_id"]]["color"]
        draw.rounded_rectangle((x, y + 4, x + 30, y + 34), radius=5, fill=material_color, outline="#65736f", width=1)
        thickness = f"{layer['thickness_mm']:g} mm"
        if not clt_layer and not layer["additive_to_total"]:
            thickness += " v rámu"
        draw.text((x + 42, y), f"{layer['id']}  {thickness}", fill="#162522", font=font(18, True))
        name = layer["name"]
        if len(name) > 38:
            name = name[:36] + "…"
        draw.text((x + 42, y + 25), name, fill="#5f706d", font=font(16))
    if clt_layer:
        bore = panel["electrical_preview_standard"]
        x = bar_left + 3 * col_w
        y = legend_y
        draw.ellipse((x, y + 4, x + 30, y + 34), fill=panel["materials"]["clt_bore_shadow"]["color"], outline="#65736f", width=1)
        draw.text((x + 42, y), f"E01–E02  Ø {bore['diameter_mm']:g} mm · chráničky", fill="#162522", font=font(18, True))
        draw.text((x + 42, y + 25), "Reprezentativní svislé elektrotrasy", fill="#5f706d", font=font(16))


def create_proof_sheet(panel: dict, standard: dict, layer_ranges: dict[str, tuple[float, float]], assembled: Path, exploded: Path, output: Path, validation: dict) -> None:
    width = int(standard["render"]["proof_width_px"])
    height = int(standard["render"]["proof_height_px"])
    canvas = Image.new("RGB", (width, height), "#f3f6f5")
    draw = ImageDraw.Draw(canvas)

    draw.rectangle((0, 0, width, 150), fill="#0f172a")
    draw.text((56, 33), "PANEL 1.4  ·  KONTROLA GEOMETRIE", fill="#ffffff", font=font(46, True))
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
        ("Konstrukce", "třívrstvé CLT"),
        ("Lamely", "28 / 28 / 28 mm"),
        ("Interiérový povrch", "VI · souvislý"),
        ("Exteriérový povrch", "NVI"),
        ("Náhledové chráničky", "2 × Ø 20 mm"),
        ("Vývrty pro krabice", "součást dodávky"),
        ("Krabice + kabeláž", "nejsou součástí"),
        ("Celková tloušťka", "84,0 mm"),
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
    clt_layer = panel["layers"][0]
    lamellae = clt_layer["lamellae"]
    preview = panel["electrical_preview_standard"]
    electrical = panel["electrical_preparation"]
    core_start = float(lamellae[0]["thickness_mm"])
    core_end = core_start + float(lamellae[1]["thickness_mm"])
    radius = float(preview["diameter_mm"]) / 2.0
    checks = {
        "declared_equals_geometry": math.isclose(declared_total, calculated_total, abs_tol=1e-6),
        "declared_equals_additive_sum": math.isclose(declared_total, additive_sum, abs_tol=1e-6),
        "single_clt_logical_layer": len(panel["layers"]) == 1 and clt_layer["geometry"] == "clt_panel",
        "three_lamellae_28_28_28": len(lamellae) == 3 and all(math.isclose(float(item["thickness_mm"]), 28.0, abs_tol=1e-6) for item in lamellae),
        "cross_laminated_orientation": [item["grain_direction"] for item in lamellae] == ["vertical_z", "horizontal_x", "vertical_z"],
        "one_side_visual": lamellae[0]["surface_quality"] == "VI" and lamellae[2]["surface_quality"] == "NVI",
        "continuous_visual_face_without_seams": "bez viditelných spár" in panel["technical_basis"]["visual_face_representation"],
        "two_preview_bores_diameter_20": len(preview["bores"]) == 2 and math.isclose(float(preview["diameter_mm"]), 20.0, abs_tol=1e-6),
        "bores_fully_inside_core_lamella": all(core_start <= float(item["center_y_mm"]) - radius and float(item["center_y_mm"]) + radius <= core_end for item in preview["bores"]),
        "preview_conduits_included": preview.get("conduit_included") is True,
        "electrical_preparation_without_mounting_cavity": electrical.get("included") is True and electrical.get("mounting_cavity_present") is False,
        "box_mounting_bores_included": "vývrty pro následnou montáž elektroinstalačních krabic" in electrical.get("included_items", []),
        "boxes_and_wiring_excluded": "elektroinstalační krabice" in electrical.get("excluded_items", []) and "kabeláž" in electrical.get("excluded_items", []),
        "box_bores_not_falsely_previewed": preview.get("box_mounting_bores_previewed") is False,
        "no_insulation_or_facade_layers": len(panel["layers"]) == 1,
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

    assembled_path = OUT_RENDERS / "panel_1_4_geometry_assembled.png"
    exploded_path = OUT_RENDERS / "panel_1_4_geometry_exploded.png"
    render_scene(panel, standard, objects, assembled_path, exploded=False)
    render_scene(panel, standard, objects, exploded_path, exploded=True)
    write_obj(panel, objects, OUT_MODELS / "panel_1_4.obj")
    (OUT_VALIDATION / "panel_1_4_validation.json").write_text(json.dumps(validation, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    create_proof_sheet(
        panel,
        standard,
        layer_ranges,
        assembled_path,
        exploded_path,
        OUT_VALIDATION / "panel_1_4_geometry_control.png",
        validation,
    )
    print(json.dumps(validation, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
