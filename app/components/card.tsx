import React from "react";

interface CardProps {
  image: string;
  name: string;
  price: number;
}

const Card = ({ image, name, price }: CardProps) => (
  <div className="relative border border-[#A7A7A7] w-[250px] cursor-pointer overflow-hidden hover:border-2 hover:border-[#A7A7A7]">
    <div className="w-full mb-2">
      <img src={image} alt={name} className="w-full block object-cover" />
    </div>
    <div className="p-2">
      <div className="text-base mb-1 text-[#FAF9F6]">{name}</div>
      <div className="flex justify-between items-center mt-1">
        <div className="text-base font-bold text-[#BA3737]">{price}u</div>
        <div className="text-sm text-[#FAF9F6]">33:44</div>
      </div>
    </div>
    <div
      className="absolute bottom-[-2px] right-[-6px]"
      style={{
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '8px solid #A7A7A7',
        transform: 'rotate(-45deg)',
      }}
    />
  </div>
);

export default Card;
