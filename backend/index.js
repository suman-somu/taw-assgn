const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Razorpay = require('razorpay');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/orders', async (req, res) => {
    const razorpay = new Razorpay({
        key_id: 'rzp_test_aIYCBi1ZWuZCuU',
        key_secret: 'BYRXinTlBK1itSRT2bhnob1R'
    })

    const options = {
        amount: req.body.amount,
        currency: req.body.currency,
        receipt: 'receipt#1',
        payment_capture: 1
    }
        
    try{
        const response = await razorpay.orders.create(options);
        res.json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount
        })
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
})

app.get("/payment/:paymentId", async (req, res) => {
    const { paymentId } = req.params;

    const razorpay = new Razorpay({
        key_id: 'rzp_test_aIYCBi1ZWuZCuU',
        key_secret: 'BYRXinTlBK1itSRT2bhnob1R'
    })

    try {
        const payment = await razorpay.payments.fetch(paymentId);
        if(!payment) {
            res.status(500).json('Error at razorpay loading payment');
        }

        res.json({
            status: payment.status,
            method: payment.method,
            amount: payment.amount,
            currency: payment.currency
        })
    } catch (error) {
        console.log(error);
        res.status(500).send('failed to fetch');
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});