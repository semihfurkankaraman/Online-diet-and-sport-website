const mysql=require("mysql2");
const config =require("../config");

const Sequelize = require("sequelize");

let connection =mysql.createConnection(config.db);


// const sequelize = new Sequelize(config.db.database , config.db.user , config.db.password , {
//     dialect:"mysql",
//     host: config.db.host,
//     define: {
//         timetamps: false
//     },
//     storage: ".session.mysql"
// });


connection.connect(function(err) {

    if(err){
        console.log(err);
    }
    else{
        console.log("mysql connection provided.");
    }

    
});


    



module.exports = connection.promise();