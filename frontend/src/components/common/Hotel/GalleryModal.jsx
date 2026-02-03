import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function GalleryModal({ images = [], onClose }) {
    const [index, setIndex] = useState(0);

    if (!images.length) return null;

    const prev = () =>
        setIndex((i) => (i === 0 ? images.length - 1 : i - 1));

    const next = () =>
        setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 text-white">
                <span className="text-sm">
                    {index + 1} / {images.length}
                </span>

                <button onClick={onClose}>
                    <X size={28} />
                </button>
            </div>

            {/* IMAGE */}
            <div className="flex-1 flex items-center justify-center relative">
                <button
                    onClick={prev}
                    className="absolute left-6 text-white/80 hover:text-white"
                >
                    <ChevronLeft size={40} />
                </button>

                <img
                    src={images[index]}
                    className="max-h-[80vh] max-w-[90vw] object-contain"
                />

                <button
                    onClick={next}
                    className="absolute right-6 text-white/80 hover:text-white"
                >
                    <ChevronRight size={40} />
                </button>
            </div>

            {/* THUMBNAILS */}
            <div className="px-6 pb-4 overflow-x-auto flex gap-3">
                {images.map((img, i) => (
                    <img
                        key={i}
                        src={img}
                        onClick={() => setIndex(i)}
                        className={`h-20 w-28 object-cover rounded cursor-pointer border-2 ${
                            i === index
                                ? "border-white"
                                : "border-transparent opacity-60"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
