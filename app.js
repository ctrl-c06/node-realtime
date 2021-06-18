const express = require('express');
const app = express();
const { v4 : uuidv4 } = require('uuid');
const port = process.env.port || 3030;
let mysql = require('mysql');

// Your database credentials here same with the laravel app.
let connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'realtime_app',
});

// Now let's create a server that will listen to our port.
const server = app.listen(`${port}`, () => {
    console.log(`Server started on port ${port}`);
    // Connect to our database.
    connection.connect();
});

// Intialize Socket
const io = require("socket.io")(server, {
    cors : { origin : "*" }
});

// Setup Socket IO.
io.on('connection', (socket) => {
    console.log('Client connected!');
    
    // Listener when user emit a order event
    socket.on('order', (data) => {
        // Prepare data for table insertion for orders.
        let order = {
            order_code : uuidv4(),
            item_id : data.item_id,
            created_at : mysql.raw('CURRENT_TIMESTAMP()'),
            updated_at : mysql.raw('CURRENT_TIMESTAMP()')
        };
        
        // Insert the database
        connection.query('INSERT INTO orders SET ?', order, (error, results) => {
            if(error) throw error;
            // Success
            console.log(results);
            // now let's notify the admin that there is an order from a user.
            io.emit('order_processed', order);
        });
    });


    socket.on('disconnect', () => {
        console.log('Client disconnected!');
    });
});
