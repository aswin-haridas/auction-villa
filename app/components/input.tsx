import React from 'react'

const Input = ({type,placeholder}: {type: string , placeholder: string}) => {
  return (
    <input
          type= {type}
          placeholder={placeholder}
          className="border-2 border-red-600 placeholder-gray-500 font-bold px-2 bg-transparent text-white h-10 rounded-sm "
        />
  )
}

export default Input