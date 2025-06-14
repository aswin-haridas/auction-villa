import React, {useEffect} from "react";
import {X} from "lucide-react";

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    src: string;
    alt: string;
}

export function ImageModal({isOpen, onClose, src, alt}: ImageModalProps) {
    // Close modal when Escape key is pressed
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            // Prevent body scrolling
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center p-4">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 text-white z-10 hover:bg-opacity-70 transition-all"
                    aria-label="Close fullscreen view"
                >
                    <X className="w-6 h-6"/>
                </button>

                <div className="max-w-full max-h-full relative">
                    <img
                        src={src}
                        alt={alt}
                        className="max-w-full max-h-[85vh] object-contain"
                    />
                </div>
            </div>
        </div>
    );
}
