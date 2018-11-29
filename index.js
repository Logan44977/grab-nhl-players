require('dotenv').config({path: __dirname + '/.env'});

const mysql = require('mysql');
const rp = require('request-promise');

// Creates the MYSQL connection using ENV variables
const con = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DBPORT || 3306,
    database: 'players'
});


// Connects or throws Error
con.connect(function(err) {
    if (err) throw err;
    console.log("connected!");
});


// Array with the team Ids from every NHL Team according to their api
const team_ids = [1,2,3,4,5,6,7,8,9,10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 52, 53, 54];

// last ID in the dataset
const lastId = 54;


let counter = 0;


callPromise();


function callPromise(){

    // String that is used for inserting into db
    let dataString = "";

    rp(`http://www.nhl.com/stats/rest/skaters?isAggregate=false&reportType=shooting&isGame=false&reportName=skatersummaryshooting&cayenneExp=gameTypeId=2%20and%20seasonId=20182019%20and%20teamId=${team_ids[counter]}`)
    .then(function(data){
        data = JSON.parse(data);

        for (i = 0; i < data.data.length; i++){

            let position, team = '';

            // gets the players position put in format I want
            switch(data.data[i].playerPositionCode ){
                case 'C':
                    position = 'Center';
                    break;
                case 'L':
                    position = "Left Wing";
                    break;
                case 'R':
                    position = "Right Wing";
                    break;
                case 'D':
                    position = "Defenseman";
                    break;
                default :
                    position = null;
            }

             // Only grabs player's current team
            const teamNames = data.data[i].playerTeamsPlayedFor.length 

            if(teamNames.length > 3){
                team = teamNames[teamNames.length - 3] + teamNames[teamNames.length - 2] + teamNames[teamNames.length - 1];
            }
            else{
                team = data.data[i].playerTeamsPlayedFor;
            }


            dataString += `(${data.data[i].playerId}, "${data.data[i].playerName}", "${data.data[i].playerFirstName}", "${data.data[i].playerLastName}", "${position}", "${team}")`;

            if(i !== data.data.length - 1){
                // seperates the rows (but not the last one)
                dataString += ", "
            }
        }

        const sql = `INSERT IGNORE INTO players_table(playerId, playerName, playerFirst, playerLast, playerPosition, playerTeam) VALUES ${dataString}`;

        con.query(sql, function(err, result){
            if(err) throw err;
            console.log(`Inserted Team ${counter} into DB`);
        })

        if(team_ids !== lastId){
            counter ++;
            callPromise();
        }

    })
    .catch(function(err){
        console.log('Promise failed! Here is why:' + err);
        console.log('ending connection');
        con.end();
    });


}

if(counter >= team_ids.length){
    // ends connection 
    console.log('ending connection');
    con.end();
}