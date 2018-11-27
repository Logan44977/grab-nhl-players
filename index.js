require('dotenv').config();
const mysql = require('mysql');
const rp = require('request-promise');

// Creates the MYSQL connection using ENV variables
const con = mysql.createConnection({
    host: process.env.HOST || 'localhost',
    user: process.env.USER,
    password: process.env.PASSWORD,
    port: process.env.DBPORT || 3306,
    database: 'players'
});

// Connects or throws Error
con.connect(function(err) {
    if (err) throw err;
    console.log("connected!");
});

// String that is used for inserting into db
let dataString = "";

// teamId to pull data for
const teamId = 3;

rp(`http://www.nhl.com/stats/rest/skaters?isAggregate=false&reportType=shooting&isGame=false&reportName=skatersummaryshooting&cayenneExp=gameTypeId=2%20and%20seasonId=20182019%20and%20teamId=${teamId}`)
    .then(function(data){
        data = JSON.parse(data);

        for (i = 0; i < data.data.length; i++){
            dataString += `(${data.data[i].playerId}, "${data.data[i].playerName}")`;

            if(i !== data.data.length - 1){
                // seperates the rows (but not the last one)
                dataString += ", "
            }
        }

        const sql = `INSERT IGNORE INTO players_table(playerId, playerName) VALUES ${dataString}`;

        con.query(sql, function(err, result){
            if(err) throw err;
            console.log(`Inserted Team with ID of ${teamId} into DB`);
        })

        // ends connection 
        con.end();

    })
    .catch(function(err){
        console.log('Promise failed! Here is why:' + err);
    });
