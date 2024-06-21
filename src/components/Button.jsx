import React from 'react';

const Button = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white font-semibold py-2 px-4 rounded shadow-md
                 hover:bg-blue-600 hover:shadow-lg focus:outline-none focus:ring-2
                 focus:ring-blue-400 focus:ring-opacity-75 active:bg-blue-700 active:shadow-none
                 transition duration-200 ease-in-out"
    >
      {children}
    </button>
  );
};

export default Button;
