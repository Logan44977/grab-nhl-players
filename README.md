# NHL API Player Name & ID grabber

## Introduction

>This Node JS project is designed to grab NHL player names and ids since the NHL's API does not provide this ability currently. 

## Code Samples

> To run this project make sure that you have NPM, MYSQL, and Node installed on your machine. Then run:
<Code>npm install</Code> and then <Code>Node index.js</Code>


>You will need to replace the ENV variables with your own DB info or create an .env file in the root directory.
>The DB table I use is named players_table & has 2 columns, playerId & playerName. The playerId is used as the table's PK so that it doesn't write a player twice. 
