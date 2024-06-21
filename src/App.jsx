import React, { Fragment } from 'react';
import axios from 'axios';
import Button from './components/Button';
import PaymentCard from './components/PaymentCard';

function App() {
  const [token, setToken] = React.useState("");
  const [razorpaykey, setRazorpayKey] = React.useState("");
  const [paymentId, setPaymentId] = React.useState("");
  const [signature, setSignature] = React.useState("");
  const [_id, setId] = React.useState("");
  const [verification, setVerification] = React.useState(false);
  const [mobileNumber, setMobileNumber] = React.useState("");


  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(true);
      }
      script.onerror = () => {
        resolve(false);
      }
      document.body.appendChild(script);
    });
  }

  const getRazorpayKey = (token) => {
    axios.post('https://api.testbuddy.live/v1/payment/key', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        setRazorpayKey(response.data.key);
      })
      .catch(error => {
        console.error("Error at getting Razorpay key:", error);
      });
  }

  const verifyOTP = () => {
    const data = JSON.stringify({
      mobile: mobileNumber,
      otp: "8899"  // Note: You might want to add an input for OTP as well
    });

    axios.post('https://api.testbuddy.live/v1/auth/verifyotp', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        setToken(response.data.token);
      })
      .catch(error => {
        console.error("error at ", error);
      });
  }

  const createRazorpayOrder = (amount) => {
    const data = JSON.stringify({
      packageId: "6613d6fbbf1afca9aa1b519e",
      pricingId: "662caa2d50bf43b5cef75232",
      finalAmount: "441",
      couponCode: "NEET25"
    });

    axios.post('https://api.testbuddy.live/v1/order/create', data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        setId(response.data._id);  
        handleRazorpayScreen(response.data.amount, response.data.transactionOrderId);
      })
      .catch(error => {
        console.error("Error at order creation:", error);
      });
  };

  const handleRazorpayScreen = async (amount, order_id) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const options = {
      key: razorpaykey,
      amount: amount,
      currency: 'INR',
      name: 'Suman Sahoo',
      description: 'Payment to Suman Sahoo',
      image: 'https://example.com/your_logo',
      order_id: order_id,
      handler: function (response) {
        setPaymentId(response.razorpay_payment_id);
        setSignature(response.razorpay_signature);
      },
      prefill: {
        name: 'Suman Sahoo',
        email: 'ssamsomu@gmail.com',
      },
      theme: {
        color: '#F4C430',
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  }

  const verifyPayment = () => {
    const data = JSON.stringify({
      transactionId: _id,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature
    });

    axios.post('https://api.testbuddy.live/v1/order/verify', data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        setVerification(response.data.success);
      })
      .catch(error => {
        console.error("Error at order creation:", error);
      });
  };

  return (
    <div className="bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen flex justify-center items-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Payment Gateway</h1>
        <div className="space-y-4">
          <PaymentCard
            title="OTP Verification"
            value={token && `Token: ${token}`}
            buttonText="Verify OTP"
            onClick={verifyOTP}
          >
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter mobile number"
              className="w-full p-2 border rounded mb-2"
            />
          </PaymentCard>
          <PaymentCard
            title="Razorpay Key"
            value={razorpaykey && `Key: ${razorpaykey}`}
            buttonText="Get Razorpay Key"
            onClick={() => getRazorpayKey(token)}
          />
          <PaymentCard
            title="Make Payment"
            buttonText="Pay ₹4000"
            onClick={() => createRazorpayOrder(400000)}
          />
          <PaymentCard
            title="Payment Verification"
            value={verification !== undefined && `Status: ${verification.toString()}`}
            buttonText="Verify Payment"
            onClick={verifyPayment}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
