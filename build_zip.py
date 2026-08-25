#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将 seedu_final/ 拍平打包为 seedu-minitool.zip。

命名规则（与历史 zip 一致）：
  css/styles.css        -> css_styles.css
  js/app.js             -> js_app.js
  js/lib/html-to-image.js -> js_lib_html-to-image.js
  index.html / favicon.svg / logo.png / logo.svg -> 保持原名（根目录）

仅包含小工具允许的文件类型：.html .css .js .png .jpg .jpeg .gif .webp .svg .woff .woff2 .json
"""
import os
import zipfile

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "seedu_final")
OUT = os.path.join(ROOT, "seedu-minitool.zip")

ALLOWED_EXT = {".html", ".css", ".js", ".png", ".jpg", ".jpeg",
               ".gif", ".webp", ".svg", ".woff", ".woff2", ".json"}


def target_name(path_rel):
    """path_rel 相对于 SRC。返回 zip 内文件名。"""
    parts = path_rel.split(os.sep)
    if parts[0] == "css" and len(parts) >= 2:
        return "css_" + "_".join(parts[1:])
    if parts[0] == "js" and len(parts) >= 2:
        return "js_" + "_".join(parts[1:])
    # 根目录或其它：保持原名
    return parts[-1]


def main():
    if not os.path.isdir(SRC):
        raise SystemExit("找不到源目录: " + SRC)

    files = []
    for dirpath, _dirnames, filenames in os.walk(SRC):
        for fn in filenames:
            ext = os.path.splitext(fn)[1].lower()
            if ext not in ALLOWED_EXT:
                continue
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, SRC)
            files.append((full, target_name(rel)))

    files.sort(key=lambda x: x[1])

    if os.path.exists(OUT):
        os.remove(OUT)

    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        for full, name in files:
            z.write(full, name)
            print("  +", name)

    print("\n已生成:", OUT, "(%d 个文件)" % len(files))


if __name__ == "__main__":
    main()
