"use client";

import { useState } from "react";
import type { PosterKioskItem } from "@/types/presentations";
import { PosterImage } from "./PosterImage";
import styles from "./posterKiosk.module.css";

const WALL_SIZE = 9;
const COLUMNS = 3;
const MIN_UNIQUE = 6;

function pickWallItems(items: PosterKioskItem[]): PosterKioskItem[] {
  const pngs = items.filter((item) => item.file?.mimeType === "image/png");
  if (pngs.length === 0) return [];
  const shuffled = [...pngs];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const picked = shuffled.slice(0, WALL_SIZE);
  const filled: PosterKioskItem[] = [];
  const target = picked.length < MIN_UNIQUE ? MIN_UNIQUE : picked.length;
  for (let i = 0; i < target; i++) filled.push(picked[i % picked.length]);
  return filled;
}

export function PosterWall({ items }: { items: PosterKioskItem[] }) {
  // Chosen once per mount; the container remounts it with a key per roster load.
  const [picked] = useState(() => pickWallItems(items));
  if (picked.length === 0) return null;

  const columns: PosterKioskItem[][] = Array.from({ length: COLUMNS }, () => []);
  picked.forEach((item, index) => columns[index % COLUMNS].push(item));

  return (
    <div className={styles.wall} aria-hidden="true">
      {columns.map((column, c) => (
        <div key={c} className={styles.wallCol}>
          <div className={styles.wallTrack} style={{ animationDuration: `${70 + c * 14}s` }}>
            {[0, 1].flatMap((copy) =>
              column.map((item, i) => (
                <div key={`${copy}-${i}`} className={styles.wallPoster}>
                  {item.file ? <PosterImage file={item.file} variant="thumb" alt="" /> : null}
                </div>
              )),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
