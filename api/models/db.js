let mysql = require('mysql');

//Create Connection to MySQL Database
let connector = mysql.createConnection({
  host: '139.59.66.232',
  user: 'harsh',
  password: 'bjn721',
  database: 'mine',
  multipleStatements: true
})

//Connect to Database
let connect = (callback) =>{
  connector.connect((err) => {
    callback(err)
  })
}

module.exports = {
  connect,
  connector
}