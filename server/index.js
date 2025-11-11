const mongoose = require('mongoose');
const morgan = require('morgan');
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });
const userRoutes = require('./app/routes/userRoutes')
const cors = require ('cors')
const tripRoutes = require('./app/routes/tripRoutes')
const bookingRoutes = require('./app/routes/bookingRoutes')
const availabilityRoutes = require("./app/routes/availabilityRoutes")
const chatRoutes = require('./app/routes/chatRoutes');

app = express()
app.use(cors( {
    origin : '*',
    methods:["GET", "POST","PUT", "PATCH", "DELETE"],
    credentials: true
}))
app.use(express.json())
app.use(morgan());


const DB = process.env.MONGO_URI
mongoose.connect(DB)
    .then(con=>{
        console.log("connected to mongoDB")
    })
    .catch(err => {
        console.log(`error connecting to db ${err}`)
    })

app.get('/',(req,res)=>{
    res.status(200).json({
        message: "Api is working,"
    })
})
app.use('/api/users',userRoutes);
app.use('/api/trips',tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use("/api/availability", availabilityRoutes);
app.use('/api/chat', chatRoutes);

const port = process.env.PORT ||5000
app.listen(port, '0.0.0.0', ()=>{
    console.log(`App running on http://localhost:${port}`)
})

module.exports = app;

