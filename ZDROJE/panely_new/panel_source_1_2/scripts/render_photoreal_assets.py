#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path
import sys
import textwrap

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(SCRIPT_DIR))
from generate_panel_assets import build_geometry, geometry_hash, load_json  # noqa: E402


PANEL_PATH = ROOT / "data" / "panel_1_2.json"
STANDARD_PATH = ROOT / "data" / "render_standard.json"
MATERIAL_PATH = ROOT / "data" / "material_library.json"
CONTROL_VALIDATION_PATH = ROOT / "output" / "validation" / "panel_1_2_validation.json"
OUT = ROOT / "output" / "photoreal"


def normalize(vector: np.ndarray) -> np.ndarray:
    length = float(np.linalg.norm(vector))
    if length == 0:
        raise ValueError("Cannot normalize zero vector")
    return vector / length


def camera_basis(standard: dict) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    camera = standard["camera"]
    azimuth = math.radians(float(camera["azimuth_deg"]))
    elevation = math.radians(float(camera["elevation_deg"]))
    camera_direction = normalize(np.array([
        math.cos(elevation) * math.cos(azimuth),
        math.cos(elevation) * math.sin(azimuth),
        math.sin(elevation),
    ], dtype=np.float64))
    screen_right = normalize(np.cross(np.array([0.0, 0.0, 1.0]), camera_direction))
    screen_up = normalize(np.cross(camera_direction, screen_right))
    return screen_right, screen_up, camera_direction


class Projector:
    def __init__(self, standard: dict):
        self.width = int(standard["render"]["asset_width_px"])
        self.height = int(standard["render"]["asset_height_px"])
        self.right, self.up, self.camera = camera_basis(standard)
        limits = standard["common_scene_limits_mm"]
        corners = np.array([
            [x, y, z]
            for x in limits["x"]
            for y in limits["y"]
            for z in limits["z"]
        ], dtype=np.float64)
        projected_u = corners @ self.right
        projected_v = corners @ self.up
        padding = 78.0
        self.scale = min(
            (self.width - 2 * padding) / float(projected_u.max() - projected_u.min()),
            (self.height - 2 * padding) / float(projected_v.max() - projected_v.min()),
        )
        self.center_u = float((projected_u.min() + projected_u.max()) / 2.0)
        self.center_v = float((projected_v.min() + projected_v.max()) / 2.0)

    def project(self, points: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        u = points @ self.right
        v = points @ self.up
        depth = points @ self.camera
        screen = np.column_stack([
            self.width / 2.0 + (u - self.center_u) * self.scale,
            self.height / 2.0 - (v - self.center_v) * self.scale,
        ])
        return screen, depth


def stable_flags(name: str) -> tuple[bool, bool]:
    value = int(hashlib.sha256(name.encode("utf-8")).hexdigest()[:8], 16)
    return bool(value & 1), bool(value & 2)


def object_bounds_for_state(obj: dict, state: str, gap: float, max_group: int) -> list[float]:
    bounds = list(obj["bounds"])
    if state == "exploded":
        shift = float(obj["exploded_group"]) * gap
        bounds[2] += shift
        bounds[3] += shift
    elif state == "cutaway":
        group = int(obj["exploded_group"])
        cutoff = 900.0 if max_group == 0 else 610.0 + (290.0 * group / max_group)
        bounds[5] = min(bounds[5], cutoff)
    elif state != "full":
        raise ValueError(f"Unknown render state: {state}")
    return bounds


def face_specs(bounds: list[float]) -> list[dict]:
    x0, x1, y0, y1, z0, z1 = bounds
    return [
        {"p0": (x0, y0, z0), "e1": (0, y1-y0, 0), "e2": (0, 0, z1-z0), "normal": (-1, 0, 0), "u0": y0, "v0": z0, "ulen": y1-y0, "vlen": z1-z0},
        {"p0": (x1, y0, z0), "e1": (0, y1-y0, 0), "e2": (0, 0, z1-z0), "normal": (1, 0, 0), "u0": y0, "v0": z0, "ulen": y1-y0, "vlen": z1-z0},
        {"p0": (x0, y0, z0), "e1": (x1-x0, 0, 0), "e2": (0, 0, z1-z0), "normal": (0, -1, 0), "u0": x0, "v0": z0, "ulen": x1-x0, "vlen": z1-z0},
        {"p0": (x0, y1, z0), "e1": (x1-x0, 0, 0), "e2": (0, 0, z1-z0), "normal": (0, 1, 0), "u0": x0, "v0": z0, "ulen": x1-x0, "vlen": z1-z0},
        {"p0": (x0, y0, z0), "e1": (x1-x0, 0, 0), "e2": (0, y1-y0, 0), "normal": (0, 0, -1), "u0": x0, "v0": y0, "ulen": x1-x0, "vlen": y1-y0},
        {"p0": (x0, y0, z1), "e1": (x1-x0, 0, 0), "e2": (0, y1-y0, 0), "normal": (0, 0, 1), "u0": x0, "v0": y0, "ulen": x1-x0, "vlen": y1-y0},
    ]


def build_faces(objects: list[dict], state: str, projector: Projector, gap: float, only_layer: str | None = None) -> list[dict]:
    faces: list[dict] = []
    max_group = max(int(item["exploded_group"]) for item in objects)
    for obj in objects:
        if only_layer and obj["layer_id"] != only_layer:
            continue
        bounds = object_bounds_for_state(obj, state, gap, max_group)
        if bounds[5] <= bounds[4]:
            continue
        for spec in face_specs(bounds):
            normal = np.array(spec["normal"], dtype=np.float64)
            if float(np.dot(normal, projector.camera)) <= 0.001:
                continue
            p0 = np.array(spec["p0"], dtype=np.float64)
            e1 = np.array(spec["e1"], dtype=np.float64)
            e2 = np.array(spec["e2"], dtype=np.float64)
            points = np.array([p0, p0 + e1, p0 + e1 + e2, p0 + e2])
            screen, depth = projector.project(points)
            faces.append({
                **spec,
                "screen": screen,
                "depth_vertices": depth,
                "depth": float(depth.mean()),
                "material_id": obj["material_id"],
                "layer_id": obj["layer_id"],
                "object_name": obj["name"],
            })
    return sorted(faces, key=lambda item: item["depth"])


def load_textures(material_library: dict) -> dict[str, np.ndarray]:
    textures = {}
    for material_id, material in material_library["materials"].items():
        path = ROOT / material["texture"]
        textures[material_id] = np.asarray(Image.open(path).convert("RGB"), dtype=np.float32) / 255.0
    return textures


def composite_face(premul: np.ndarray, alpha: np.ndarray, zbuffer: np.ndarray, face: dict, material: dict, texture: np.ndarray, light_dir: np.ndarray) -> None:
    screen = face["screen"]
    min_x = max(0, int(math.floor(screen[:, 0].min())) - 1)
    max_x = min(premul.shape[1] - 1, int(math.ceil(screen[:, 0].max())) + 1)
    min_y = max(0, int(math.floor(screen[:, 1].min())) - 1)
    max_y = min(premul.shape[0] - 1, int(math.ceil(screen[:, 1].max())) + 1)
    if max_x < min_x or max_y < min_y:
        return

    origin = screen[0]
    edge1 = screen[1] - screen[0]
    edge2 = screen[3] - screen[0]
    matrix = np.array([[edge1[0], edge2[0]], [edge1[1], edge2[1]]], dtype=np.float64)
    determinant = float(np.linalg.det(matrix))
    if abs(determinant) < 1e-8:
        return
    inverse = np.linalg.inv(matrix)

    yy, xx = np.mgrid[min_y:max_y+1, min_x:max_x+1]
    rel_x = xx.astype(np.float64) + 0.5 - origin[0]
    rel_y = yy.astype(np.float64) + 0.5 - origin[1]
    a = inverse[0, 0] * rel_x + inverse[0, 1] * rel_y
    b = inverse[1, 0] * rel_x + inverse[1, 1] * rel_y
    inside = (a >= -0.002) & (a <= 1.002) & (b >= -0.002) & (b <= 1.002)
    depth_vertices = face["depth_vertices"]
    face_depth = depth_vertices[0] + a * (depth_vertices[1] - depth_vertices[0]) + b * (depth_vertices[3] - depth_vertices[0])
    region_z = zbuffer[min_y:max_y+1, min_x:max_x+1]
    visible = inside & (face_depth > region_z + 1e-7)
    if not np.any(visible):
        return

    flip_u, flip_v = stable_flags(face["object_name"] + face["layer_id"])
    u_world = float(face["u0"]) + a * float(face["ulen"])
    v_world = float(face["v0"]) + b * float(face["vlen"])
    u = np.mod(u_world / float(material["period_u_mm"]), 1.0)
    v = np.mod(v_world / float(material["period_v_mm"]), 1.0)
    if flip_u:
        u = 1.0 - u
    if flip_v:
        v = 1.0 - v
    tx = np.minimum(texture.shape[1] - 1, np.floor(u * texture.shape[1]).astype(np.int32))
    ty = np.minimum(texture.shape[0] - 1, np.floor(v * texture.shape[0]).astype(np.int32))
    sampled = texture[ty, tx]

    normal = normalize(np.array(face["normal"], dtype=np.float64))
    illumination = float(material["ambient"]) + float(material["diffuse"]) * max(0.0, float(np.dot(normal, light_dir)))
    edge_distance = np.minimum.reduce([a, 1.0-a, b, 1.0-b])
    edge_factor = 1.0 - float(material["edge_strength"]) * (1.0 - np.clip(edge_distance * 18.0, 0.0, 1.0))
    rgb = np.clip(sampled * illumination * edge_factor[..., None], 0.0, 1.0)

    coverage = visible.astype(np.float32) * float(material["opacity"])
    # One-pixel analytical antialiasing near parallelogram edges.
    feather = np.clip(np.minimum.reduce([a + 0.002, 1.002-a, b + 0.002, 1.002-b]) * 180.0, 0.0, 1.0)
    coverage *= feather.astype(np.float32)
    region_rgb = premul[min_y:max_y+1, min_x:max_x+1]
    region_alpha = alpha[min_y:max_y+1, min_x:max_x+1]
    source_alpha = coverage[..., None]
    region_rgb[:] = rgb * source_alpha + region_rgb * (1.0 - source_alpha)
    region_alpha[:] = coverage + region_alpha * (1.0 - coverage)
    region_z[visible] = face_depth[visible]


def render_image(panel: dict, standard: dict, material_library: dict, textures: dict[str, np.ndarray], objects: list[dict], state: str, only_layer: str | None = None, shadow: bool = True) -> Image.Image:
    projector = Projector(standard)
    width, height = projector.width, projector.height
    premul = np.zeros((height, width, 3), dtype=np.float32)
    alpha = np.zeros((height, width), dtype=np.float32)
    zbuffer = np.full((height, width), -np.inf, dtype=np.float64)
    light_dir = normalize(np.array([-0.45, -0.35, 0.82], dtype=np.float64))
    gap = float(standard["exploded_view"]["gap_between_construction_groups_mm"])
    faces = build_faces(objects, state, projector, gap, only_layer=only_layer)
    for face in faces:
        material = material_library["materials"][face["material_id"]]
        composite_face(premul, alpha, zbuffer, face, material, textures[face["material_id"]], light_dir)

    rgba = np.zeros((height, width, 4), dtype=np.uint8)
    nonzero = alpha > 1e-6
    straight_rgb = np.zeros_like(premul)
    straight_rgb[nonzero] = premul[nonzero] / alpha[nonzero, None]
    rgba[..., :3] = np.clip(straight_rgb * 255.0, 0, 255).astype(np.uint8)
    rgba[..., 3] = np.clip(alpha * 255.0, 0, 255).astype(np.uint8)
    object_image = Image.fromarray(rgba, mode="RGBA")

    if shadow and only_layer is None:
        shadow_alpha = object_image.getchannel("A").filter(ImageFilter.GaussianBlur(radius=18))
        shadow_alpha = shadow_alpha.point(lambda value: int(value * 0.15))
        shadow_layer = Image.new("RGBA", object_image.size, (18, 29, 27, 0))
        shifted = Image.new("L", object_image.size, 0)
        shifted.paste(shadow_alpha, (18, 24))
        shadow_layer.putalpha(shifted)
        return Image.alpha_composite(shadow_layer, object_image)
    return object_image


def save_png_webp(image: Image.Image, base_path: Path) -> None:
    base_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(base_path.with_suffix(".png"), optimize=True)
    image.save(base_path.with_suffix(".webp"), format="WEBP", quality=91, method=6, lossless=False)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    return ImageFont.truetype(str(Path("/usr/share/fonts/truetype/dejavu") / name), size=size)


def fit(image: Image.Image, box: tuple[int, int]) -> Image.Image:
    result = image.copy()
    result.thumbnail(box, Image.Resampling.LANCZOS)
    return result


def wrapped(draw: ImageDraw.ImageDraw, xy: tuple[int, int], value: str, width: int, fill: str, typeface: ImageFont.FreeTypeFont, spacing: int = 5) -> None:
    approx_chars = max(12, int(width / (typeface.size * 0.56)))
    draw.multiline_text(xy, textwrap.fill(value, width=approx_chars), fill=fill, font=typeface, spacing=spacing)


def create_review_sheet(panel: dict, material_library: dict, images: dict[str, Image.Image], validation: dict, output: Path) -> None:
    canvas = Image.new("RGB", (3200, 2320), "#f3f6f5")
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((0, 0, 3200, 150), fill="#0f172a")
    draw.text((56, 32), "PANEL 1.2  ·  FOTOREALISTICKÝ STANDARD", fill="#ffffff", font=font(44, True))
    draw.text((3144, 45), "PREFA ŠOPÍK · MATERIÁLY 02", anchor="ra", fill="#76e0d2", font=font(25, True))

    cards = [
        (50, 190, 1030, 1240, "Plná geometrie", images["full"]),
        (1110, 190, 2090, 1240, "Složený stupňovitý řez", images["cutaway"]),
        (2170, 190, 3150, 1240, "Rozložené konstrukční skupiny", images["exploded"]),
    ]
    for x0, y0, x1, y1, title, image in cards:
        draw.rounded_rectangle((x0, y0, x1, y1), radius=22, fill="#ffffff", outline="#d5dedb", width=3)
        draw.text((x0 + 26, y0 + 22), title, fill="#172522", font=font(28, True))
        rendered = fit(image, (x1-x0-45, y1-y0-90))
        px = x0 + (x1-x0-rendered.width)//2
        py = y0 + 72 + (y1-y0-78-rendered.height)//2
        canvas.paste(rendered, (px, py), rendered)

    draw.text((50, 1300), "Uzamčená knihovna materiálů", fill="#172522", font=font(30, True))
    material_ids = ["fermacell_raw", "kvh_spruce", "mineral_wool_soft", "vapour_membrane", "diffusion_membrane"]
    labels = ["Fermacell", "KVH smrk", "Minerální izolace", "Parozábrana", "Difuzní membrána"]
    for index, (material_id, label) in enumerate(zip(material_ids, labels)):
        tile = Image.open(ROOT / material_library["materials"][material_id]["texture"]).convert("RGB").resize((390, 260), Image.Resampling.LANCZOS)
        x = 50 + index * 620
        y = 1360
        canvas.paste(tile, (x, y))
        draw.rectangle((x, y, x+390, y+260), outline="#cbd6d2", width=2)
        draw.text((x, y+278), label, fill="#172522", font=font(21, True))

    electrical = panel["electrical_preparation"]
    draw.rounded_rectangle((50, 1705, 3150, 1955), radius=20, fill="#e8f7f4", outline="#8ccfc5", width=3)
    draw.text((82, 1735), electrical["user_heading"].upper(), fill="#087b70", font=font(24, True))
    wrapped(draw, (82, 1782), electrical["user_description"], 3000, "#173f3a", font(22), spacing=6)
    excluded = "Není součástí: " + " · ".join(electrical["excluded_items"]) + "."
    wrapped(draw, (82, 1885), excluded, 3000, "#526a65", font(20, True), spacing=4)

    draw.rounded_rectangle((50, 1995, 3150, 2240), radius=18, fill="#ffffff", outline="#d5dedb", width=3)
    draw.text((82, 2030), "Geometrie", fill="#64736f", font=font(21))
    draw.text((82, 2070), validation["approved_geometry_sha256"][:16] + "…", fill="#172522", font=font(23, True))
    draw.text((790, 2030), "Celková tloušťka", fill="#64736f", font=font(21))
    draw.text((790, 2070), f"{validation['total_thickness_mm']:.1f} mm".replace(".", ","), fill="#172522", font=font(27, True))
    draw.text((1320, 2030), "Interaktivní vrstvy", fill="#64736f", font=font(21))
    draw.text((1320, 2070), f"{validation['logical_layer_count']} vrstev · 2 stavy", fill="#172522", font=font(27, True))
    draw.text((2050, 2030), "Automatická kontrola", fill="#64736f", font=font(21))
    draw.text((2050, 2070), validation["status"], fill="#0d9f79", font=font(32, True))
    draw.text((50, 2280), "Všechny rendery používají totožnou parametrickou geometrii, ortografickou kameru a společné měřítko.", fill="#64736f", font=font(19))
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, quality=96)


def main() -> None:
    panel = load_json(PANEL_PATH)
    standard = load_json(STANDARD_PATH)
    material_library = load_json(MATERIAL_PATH)
    control_validation = load_json(CONTROL_VALIDATION_PATH)
    objects, _, total = build_geometry(panel)
    if not math.isclose(total, float(panel["declared_delivered_thickness_mm"]), abs_tol=1e-6):
        raise ValueError(f"Unexpected total thickness: {total}")
    if geometry_hash(objects) != control_validation["geometry_sha256"]:
        raise ValueError("Approved geometry hash changed")
    electrical = panel["electrical_preparation"]
    electrical_scope_complete = (
        electrical.get("included") is True
        and electrical.get("host_layer_ids") == ["L02", "L03"]
        and set(electrical.get("included_items", [])) == {
            "elektroinstalační chráničky (husí krky)",
            "vývrty pro následné osazení elektroinstalačních krabic",
        }
        and "elektroinstalační krabice" in electrical.get("excluded_items", [])
        and "kabeláž" in electrical.get("excluded_items", [])
    )
    if not electrical_scope_complete:
        raise ValueError("Incomplete or inconsistent electrical preparation scope")

    textures = load_textures(material_library)
    full = render_image(panel, standard, material_library, textures, objects, "full")
    cutaway = render_image(panel, standard, material_library, textures, objects, "cutaway")
    exploded = render_image(panel, standard, material_library, textures, objects, "exploded")
    save_png_webp(full, OUT / "panel_1_2_photoreal_full")
    save_png_webp(cutaway, OUT / "panel_1_2_photoreal_assembled_cutaway")
    save_png_webp(exploded, OUT / "panel_1_2_photoreal_exploded")

    layers_manifest = []
    for state in ("cutaway", "exploded"):
        layer_dir = OUT / "layers" / ("assembled" if state == "cutaway" else "exploded")
        mask_dir = OUT / "masks" / ("assembled" if state == "cutaway" else "exploded")
        for layer in panel["layers"]:
            layer_id = layer["id"]
            sprite = render_image(panel, standard, material_library, textures, objects, state, only_layer=layer_id, shadow=False)
            sprite_path = layer_dir / f"{layer_id}.webp"
            sprite_path.parent.mkdir(parents=True, exist_ok=True)
            sprite.save(sprite_path, format="WEBP", quality=91, method=6)
            mask = sprite.getchannel("A")
            mask_path = mask_dir / f"{layer_id}.png"
            mask_path.parent.mkdir(parents=True, exist_ok=True)
            mask.save(mask_path, optimize=True)
            layers_manifest.append({
                "state": "assembled" if state == "cutaway" else "exploded",
                "layer_id": layer_id,
                "sprite": str(sprite_path.relative_to(ROOT)),
                "mask": str(mask_path.relative_to(ROOT)),
            })

    validation = {
        "panel_id": panel["panel_id"],
        "status": "PASS",
        "approved_geometry_sha256": control_validation["geometry_sha256"],
        "render_standard_id": standard["standard_id"],
        "material_library_id": material_library["library_id"],
        "total_thickness_mm": total,
        "logical_layer_count": len(panel["layers"]),
        "interactive_asset_count": len(layers_manifest),
        "states": ["full", "assembled_cutaway", "exploded"],
        "transparent_background": True,
        "camera_projection": standard["camera"]["projection"],
        "electrical_preparation_documented": True,
        "electrical_preparation_scope_complete": electrical_scope_complete,
    }
    (OUT / "panel_1_2_photoreal_validation.json").write_text(json.dumps(validation, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    manifest = {
        "panel_id": panel["panel_id"],
        "geometry_sha256": control_validation["geometry_sha256"],
        "composites": {
            "full_png": "output/photoreal/panel_1_2_photoreal_full.png",
            "assembled_png": "output/photoreal/panel_1_2_photoreal_assembled_cutaway.png",
            "assembled_webp": "output/photoreal/panel_1_2_photoreal_assembled_cutaway.webp",
            "exploded_png": "output/photoreal/panel_1_2_photoreal_exploded.png",
            "exploded_webp": "output/photoreal/panel_1_2_photoreal_exploded.webp"
        },
        "layers": layers_manifest,
        "layer_definitions": [
            {
                "id": layer["id"],
                "name": layer["name"],
                "thickness_mm": layer["thickness_mm"],
                "function": layer["function"],
                "host_layer_id": layer.get("host_layer_id")
            }
            for layer in panel["layers"]
        ],
        "features": [
            {
                "id": "EP01",
                "type": "electrical_preparation",
                **electrical,
                "interaction": {
                    "hover_target_layer_ids": electrical["host_layer_ids"],
                    "on_select": "show_feature_description"
                }
            }
        ]
    }
    (OUT / "panel_1_2_asset_manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    create_review_sheet(panel, material_library, {"full": full, "cutaway": cutaway, "exploded": exploded}, validation, OUT / "panel_1_2_photoreal_review.png")
    print(json.dumps(validation, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
