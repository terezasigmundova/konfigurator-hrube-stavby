#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
MATERIALS = ASSETS / "materials"
MASTER = MATERIALS / "clt_spruce_visual_master_v2.png"


def save_rgb(image: Image.Image, name: str) -> None:
    # Materialize a metadata-free pixel buffer before encoding. This also avoids
    # carrying generated-image provenance chunks into derived working textures.
    clean = Image.fromarray(np.asarray(image.convert("RGB"), dtype=np.uint8).copy(), mode="RGB")
    path = MATERIALS / name
    clean.save(path, format="PNG", compress_level=3)
    with Image.open(path) as check:
        check.load()


def main() -> None:
    MATERIALS.mkdir(parents=True, exist_ok=True)
    visual = Image.open(MASTER).convert("RGB").resize((1024, 1024), Image.Resampling.LANCZOS)
    visual = ImageEnhance.Color(visual).enhance(0.88)
    visual = ImageEnhance.Brightness(visual).enhance(0.97)

    transverse = visual.rotate(90, expand=False)
    transverse = ImageEnhance.Brightness(transverse).enhance(0.90)
    transverse = ImageEnhance.Contrast(transverse).enhance(1.04)

    array = np.asarray(visual, dtype=np.float32)
    rng = np.random.default_rng(14084)
    low_frequency = rng.normal(0.0, 1.0, size=(128, 128)).astype(np.float32)
    noise = Image.fromarray(np.clip((low_frequency + 3.0) / 6.0 * 255.0, 0, 255).astype(np.uint8)).resize((1024, 1024), Image.Resampling.BICUBIC)
    noise_array = np.asarray(noise, dtype=np.float32) / 255.0 - 0.5
    nonvisual_array = np.clip(array * 0.88 + noise_array[..., None] * 13.0, 0, 255).astype(np.uint8)
    nonvisual = Image.fromarray(nonvisual_array, mode="RGB")
    nonvisual = ImageEnhance.Color(nonvisual).enhance(0.78)

    bore_base = np.full((512, 512, 3), (63, 43, 27), dtype=np.float32)
    bore_noise = rng.normal(0.0, 8.0, size=(512, 512, 1))
    bore = Image.fromarray(np.clip(bore_base + bore_noise, 0, 255).astype(np.uint8), mode="RGB")

    save_rgb(visual, "clt_spruce_visual.png")
    save_rgb(transverse, "clt_spruce_transverse.png")
    save_rgb(nonvisual, "clt_spruce_nonvisual.png")
    save_rgb(bore, "clt_bore_shadow.png")

    atlas = Image.new("RGB", (2048, 2048), "#f3f2ed")
    atlas.paste(visual, (0, 0))
    atlas.paste(transverse, (1024, 0))
    atlas.paste(nonvisual, (0, 1024))
    atlas.paste(bore.resize((1024, 1024), Image.Resampling.BILINEAR), (1024, 1024))
    atlas_path = ASSETS / "clt_material_atlas_v1.png"
    atlas.save(atlas_path, format="PNG", compress_level=3)
    with Image.open(atlas_path) as check:
        check.load()


if __name__ == "__main__":
    main()
