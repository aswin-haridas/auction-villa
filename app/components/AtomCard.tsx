import React from "react";
import {playfair} from "../font/fonts";

interface CardProps {
    image: string;
    name: string;
    category: string;
}

const AtomCard = ({image, name, category}: CardProps) => (
    <div
        className="break-inside-avoid w-full rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-[#242424] cursor-pointer">
        <div className="w-full">
            {image && (
                <img
                    src={image}
                    alt={name}
                    className="w-full block object-cover rounded-t-lg"
                />
            )}
        </div>
        <div className="p-3">
            <div
                className={`text-lg text-[#FAF9F6] ${playfair.className} font-medium`}
            >
                {name}
            </div>
            <div className="text-sm text-[#878787] mt-1">{category}</div>
        </div>
    </div>
);

export default AtomCard;
