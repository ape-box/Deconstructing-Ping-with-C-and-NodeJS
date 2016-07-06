'use strict';

let raw = require ("raw-socket");
let header = [];

//
//  1. Create the structure where we are going to
//     save our header
//
let type            = new Buffer(1);
let code            = new Buffer(1);
let chksum          = new Buffer(2);
let identifier      = new Buffer(2);
let sequence_number = new Buffer(2);
let data            = new Buffer(4);

//
//  2. Write the appropriate values.
//
type.writeUInt8(0x8, 0);
code.writeUInt8(0x0, 0);
chksum.writeUInt16LE(0xfff7, 0);
identifier.writeUInt16LE(0x0, 0);
sequence_number.writeUInt16LE(0x0, 0);
data.writeUInt32LE(0x0, 0);

//
//  3. push each separated buffer to the array
//
header.push(type);
header.push(code);
header.push(chksum);
header.push(identifier);
header.push(sequence_number);
header.push(data);

//
//  4. Combine all the buffers in to one
//
let headerConcat = new Buffer.concat(header, 12);

//
//  5. Creating the socket using the ICMP protocol
//
var socket = raw.createSocket(
    {
        protocol: raw.Protocol.ICMP
    }
);

//
//  6. Sending the request for a ping
//
socket.send(headerConcat, 0, 12, "8.8.8.8", function(error, bytes)
    {
        //
        //  -> If there is any error, show it.
        //
        if (error)
        {
            console.log(error.toString());
        }
    }
);

//
//  7. Listen for the remote host response
//
socket.on("message", function (buffer, source) {


    //
    //  8. Create a buffer that will hold just our ICMP reply, we don't need
    //     the whole TCP blob :)
    //
    let icmpResponseBuffer = new Buffer(8);

    //
    //  9.Copy only the fragment from the response that interest us,
    //    starting at byte 20
    //
    buffer.copy(icmpResponseBuffer, 0, 20);

    //
    //  10. Create all the buffers where we are going to store the different
    //      information from the ICMP reply.
    //
    let type = new Buffer(1);
    let code = new Buffer(1);
    let checksum = new Buffer(2);
    let identifier = new Buffer(2);
    let sequence_number = new Buffer(2);

    //
    //  11. Copy bytes in to the appropriate buffer
    //
    icmpResponseBuffer.copy(type, 0, 0);
    icmpResponseBuffer.copy(code, 0, 1);
    icmpResponseBuffer.copy(checksum, 0, 2);
    icmpResponseBuffer.copy(identifier, 0, 4);
    icmpResponseBuffer.copy(sequence_number, 0, 6);

    //
    //  -> Display in a human readable form the response that we got
    //
    console.log("type: %s, code: %s, checksum: %s, identifier: %s, sequence: %s",
                type.toString('hex'),
                code.toString('hex'),
                checksum.toString('hex'),
                identifier.toString('hex'),
                sequence_number.toString('hex')
            );

    //
    //  12. Once we have our response we can exit the app
    //
    process.exit()

});
