import React from "react";
import { playfair } from "../font/fonts";

interface CardProps {
  image: string;
  name: string;
  category: string;
}

const AtomCard = ({ image, name, category }: CardProps) => (
  <div className="relative w-[250px] cursor-pointer hover:underline hover:underline-offset-2">
    <div className="w-full mb-2">
      {image && (
        <img src={image} alt={name} className="w-full block object-cover" />
      )}
    </div>
    <div>
      <div className={`text-lg text-[#FAF9F6] ${playfair.className}`}>
        {name}
      </div>
      <div className="text-sm text-[#878787]">{category}</div>
    </div>
  </div>
);

export default AtomCard;
