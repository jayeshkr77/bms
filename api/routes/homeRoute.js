//Dependencies
let express = require('express');
let router = express.Router();
let db = require('./../models/db');
let model = require('./../models/model');

//Home Route
router.get('/', (req, res) => {

  if (req.session.loggedIn) {
    var query = 'call homedata();'
    query += 'select sum(debit) "sum" from bank_account;'
    query += 'select sum(credit) "sum" from bank_account;'
    query += 'select sum(debit) "sum" from cash_account;'
    query += 'select sum(credit) "sum" from cash_account;'
    query += 'show tables;'

    db.connector.query(query, (err, success) => {
      //console.log(success);

      totalDebit = success[7][0].sum + success[9][0].sum;
      totalCredit = success[8][0].sum + success[10][0].sum;

      let accounts = model.getAccounts(success[11]);

      var debtors = 0, creditors = 0;

      model.getDebtorsCount(accounts, (count) => {
        console.log(count);
      })

      res.render('index.ejs', {
        daily_journal: success[0],
        journal_entry: success[1],
        sales_account: success[2],
        purchase_account: success[3],
        cash_account: success[5],
        bank_account: success[4],
        cashOutFlow: totalCredit,
        cashInFlow: totalDebit,
        debtors: debtors,
        creditors: creditors
      })
    })
  }
  else
    res.redirect('/login')

})

//Login Route
router.get('/login', (req, res) => {
  if (!req.session.loggedIn)
    res.render('login.ejs', { msg: '' });
  else
    res.redirect('/')
})

//Login POST Route
router.post('/login', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  var query = `select * from user where username='${username}'`;

  db.connector.query(query, (err, success) => {
    if (err)
      res.send(err)
    else {
      if (success.length > 0) {
        if (password == success[0].password) {
          req.session.loggedIn = success[0].id;
          res.send({ err: false, msg: 'Login Successfull' });
        }
        else {
          res.send({ err: true, msg: 'Incorrect Password' })
        }
      } else {
        res.send({ err: true, msg: 'User doesnot exist!' })
      }
    }
  })
})

//New Transaction route
router.get('/new-transaction', (req, res) => {
  if (req.session.loggedIn)
    res.render('addTransactions.ejs');
  else
    res.redirect('/login')
})

//New Post Transaction route
router.post('/new-transaction', (req, res) => {
  var date = req.body.date;
  var particular = req.body.particular;
  var type = req.body.type;
  var description = req.body.description;
  var name = req.body.name;
  var debit = req.body.debit;
  var credit = req.body.credit;

  var query = `insert into daily_journal(name, particular, description, debit, credit, Date, type)
    values ('${name}', '${particular}', '${description}', '${debit}', '${credit}', '${date}', '${type}')`;

  db.connector.query(query, (err, success) => {

    if (err) {
      console.log(err)
      res.send('An Error Occured');
    } else {
      var particular2 = model.getJournalEntryParticular({ particular: particular, name: name, type: type })
      var debit2 = debit != 0 ? debit : credit;
      var credit2 = debit != 0 ? debit : credit;

      var query2 = `insert into journal_entry(particular, description, debit, credit, date) 
        values('${particular2}', '${description}', ${debit2}, ${credit2}, '${date}')`

      db.connector.query(query2, (err, success2) => {
        if (err) {
          console.log(err)
          res.send("An error occured")
        }
        else {
          model.updateLedger({ date: date, particular: particular2, debit: debit2, credit: credit2 }, (err, success) => {
            if (err) {
              console.log(err)
              res.send("An error Occured");
            } else
              res.redirect('/');
          });
        }
      })
    }
  })
})

//Route for deleteing entry
router.post('/delete', (req, res) => {
  var id = req.body.id;

  query = `delete from daily_journal where id=${id};`
  query += `delete from journal_entry where id=${id}`

  db.connector.query(query, (err, success) => {
    if (err) {
      console.log(err)
      res.send({ err: true, msg: err });
    } else {
      res.send({ err: false, msg: 'done' })
    }
  })

})

//Route for editing Transactions
router.get('/edit', (req, res) => {

  var data = JSON.parse(req.query.data);

  console.log(data)

  res.render('edit.ejs', {
    data: data
  })
})

router.post('/edit', (req, res) => {
  var id = req.body.id;

  query = `select * from daily_journal where id=${id}`

  db.connector.query(query, (err, success) => {
    if (err) {
      console.log(err);
      res.send({ err: true, msg: err });
    } else {
      res.send({ err: false, msg: success[0] });
    }
  })
})

//<!-- analytics routes ->
router.get('/dashboard',(req, res) => {
  var customers = [];
  var data = {};
  // data = await database(customers,data,res);
  // console.log(data);
  query = `show tables`;
  var query1 = '';
  db.connector.query(query,async (err,success)=>{
    
    for (const item of success) {
      var pattern = /_ac$/;

      if(pattern.test(item.Tables_in_mine)){
        data[item.Tables_in_mine] = [];
        query1 += `select SUM(debit) as debit ,SUM(credit) as credit from ${item.Tables_in_mine};`;  
      }

    }//end of for of item of success
    data['bank_account'] = [];
    data['cash_account'] = [];
    data['sales_account'] = [];
    data['purchase_account'] = [];
    query1 += `select SUM(debit) as debit ,SUM(credit) as credit from bank_account;`;
    query1 += `select SUM(debit) as debit ,SUM(credit) as credit from cash_account;`;
    query1 += `select SUM(debit) as debit ,SUM(credit) as credit from sales_account;`;
    query1 += `select SUM(debit) as debit ,SUM(credit) as credit from purchase_account;`;    
    //console.log(query1);
    
    await db.connector.query(query1,async(err,success) =>{
      //data[1]=success;
      //console.log(success);
      var i=0;
      Object.keys(data).forEach((key)=>{
        data[key] =success[i++][0];
      })
      console.log(data);
      res.render('analytics.ejs', {d : data})
    });
  })//show tables
})

//<!-- end of analytics routes -->

module.exports = router;