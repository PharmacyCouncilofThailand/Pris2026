"use client";

import { useRef, useState, type TouchEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ImageAsset } from "@/types/merchandise";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import ProductLightboxImage from "./ProductLightboxImage";

export default function ProductGallery({
  images,
  name,
  failed,
  onImageError,
}: {
  images: ImageAsset[];
  name: string;
  failed: boolean;
  onImageError: (id: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const suppressClick = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const image = images[index];
  const multiple = images.length > 1;
  const move = (direction: number) =>
    setIndex((current) =>
      Math.max(0, Math.min(images.length - 1, current + direction)),
    );
  const startTouch = (event: TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    suppressClick.current = false;
    touchStart.current =
      event.touches.length === 1
        ? { x: touch.clientX, y: touch.clientY }
        : null;
  };
  const endTouch = (event: TouchEvent<HTMLElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    const end = event.changedTouches[0];
    if (!start || !end) return;
    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    suppressClick.current = Math.abs(dx) > 10 || Math.abs(dy) > 10;
    if (multiple && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy))
      move(dx < 0 ? 1 : -1);
  };
  const cancelTouch = () => {
    touchStart.current = null;
    suppressClick.current = true;
  };
  const navigation = multiple && (
    <>
      <button
        type="button"
        className="merch-gallery-arrow merch-gallery-previous"
        aria-label="รูปก่อนหน้า"
        disabled={index === 0}
        onClick={() => move(-1)}
      >
        <ChevronLeft size={24} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="merch-gallery-arrow merch-gallery-next"
        aria-label="รูปถัดไป"
        disabled={index === images.length - 1}
        onClick={() => move(1)}
      >
        <ChevronRight size={24} aria-hidden="true" />
      </button>
      <span
        className="merch-gallery-counter"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {index + 1}/{images.length}
      </span>
    </>
  );

  return (
    <div className="merch-detail-gallery">
      {image ? (
        <figure
          onTouchStart={startTouch}
          onTouchEnd={endTouch}
          onTouchCancel={cancelTouch}
        >
          <button
            type="button"
            ref={trigger}
            className="merch-gallery-open"
            aria-label={`ดูรูปขยาย ${name}`}
            aria-haspopup="dialog"
            onPointerDown={(event) => {
              if (event.pointerType !== "touch") suppressClick.current = false;
            }}
            onKeyDown={() => {
              suppressClick.current = false;
            }}
            onClick={() => {
              if (!suppressClick.current) setOpen(true);
              suppressClick.current = false;
            }}
          >
            <Image
              key={image.id}
              unoptimized
              src={image.url}
              alt={name}
              width={image.width}
              height={image.height}
              loading="eager"
              draggable={false}
              onError={() => onImageError(image.id)}
            />
          </button>
          <figcaption>พรีออเดอร์</figcaption>
          {navigation}
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
              <Dialog.Backdrop className="merch-lightbox-backdrop" />
              <Dialog.Popup className="merch-lightbox" finalFocus={trigger}>
                <div className="merch-lightbox-header">
                  <Dialog.Title>{name}</Dialog.Title>
                  <Dialog.Close
                    className="merch-lightbox-close"
                    aria-label="ปิดรูปขยาย"
                  >
                    <X size={24} aria-hidden="true" />
                  </Dialog.Close>
                </div>
                <ProductLightboxImage
                  key={image.id}
                  image={image}
                  name={name}
                  onImageError={onImageError}
                  onSwipe={move}
                  onDismiss={() => setOpen(false)}
                  suppressClickRef={suppressClick}
                />
                {multiple && (
                  <div className="merch-lightbox-navigation">{navigation}</div>
                )}
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </figure>
      ) : (
        <div className="merch-detail-placeholder">
          <ProductImagePlaceholder failed={failed} />
        </div>
      )}
    </div>
  );
}
