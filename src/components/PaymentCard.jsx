import Button from "./Button";

const PaymentCard = ({ children, title, value, buttonText, onClick }) => (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        {value && <p className="text-gray-600 mb-3 break-words">{value}</p>}
        {children}
        <Button onClick={onClick} className="w-full">
            {buttonText}
        </Button>
    </div>
);

export default PaymentCard;