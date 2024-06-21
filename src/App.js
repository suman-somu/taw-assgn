import './App.css';
import React, { Fragment } from 'react';
import axios from 'axios';

function App() {
  const [token, setToken] = React.useState("");
  const [razorpaykey, setRazorpayKey] = React.useState("");
  const [paymentId, setPaymentId] = React.useState("");
  const [signature, setSignature] = React.useState("");
  const [_id, setId] = React.useState("");
  const [verification, setVerification] = React.useState(false);


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
      mobile: "+912144419015",
      otp: "8899"
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
        console.log("Order created:", JSON.stringify(response.data));
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
        console.log("signature ", response.razorpay_signature)
        console.log("payment id ", response.razorpay_payment_id)
        console.log("order id ", response.razorpay_order_id)
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
        console.log(JSON.stringify(response.data));
        console.log("Payment verified:", response.data.success)
        setVerification(response.data.success);
      })
      .catch(error => {
        console.error("Error at order creation:", error);
      });
  };

  return (
    <Fragment>
      <main>
        {token && <p>{token}</p>}
        <button onClick={verifyOTP}> verify OTP</button>
        <br />
        {razorpaykey && <p>{razorpaykey}</p>}
        <button onClick={getRazorpayKey} >get razorpay key</button>
        <br />
        <button onClick={() => createRazorpayOrder(400000)}>Pay</button>
        <br />
        {verification && <p>{verification.toString()}</p>}
        <button onClick={verifyPayment}>verify</button>
      </main>
    </Fragment>
  );
}

export default App;
