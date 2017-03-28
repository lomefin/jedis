Jedis
=======
A Redis-like library for javascript browser clients with persistence.

[![Build Status](https://travis-ci.org/lomefin/jedis.svg?branch=master)](https://travis-ci.org/lomefin/jedis)

What it is
---------------
Or in other words, a Javascript version of REDIS, in terms of commands.

What it isn't
---------------
This is not a Javascript REDIS client.

Why? - Use case
----------------
You feel comfortable with REDIS in your server, you like the structure you've got there and you would to have it in your browser app without needing to learn something.

You like using lists, sets, hashes but you also want them persisted, hassle-less.

Basic usage
-----------

    //Creates a new structure in memory (and in localstorage)
    var db = Jedis.new("myDB");
    db.set("TRIP_ID", "12345");

    db.get("TRIP_ID"); // 12345

    db.setex("EXPIRABLE_KEY", 10, "10 seconds to live");
    db.get("EXPIRABLE_KEY"); // 10 seconds to live

    // 10 seconds later

    db.get("EXPIRABLE_KEY"); // null


Status of this project
----------------------

This project was meant to help us in the development of a prototype for www.arribapp.com
Depending on the needs of the project we will expand the code to cover other areas.

We still don't know the best way to test out the app.

Available Commands
---------------------
FLUSHALL

GET

SET

DEL

_SAVELSKEY

_LOADLSKEY
