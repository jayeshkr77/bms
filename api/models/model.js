let db = require('./db');


//Convert Daily Journal to Journal Entry
let getJournalEntryParticular = (data) => {
  var particular = ''
  
  switch(data.particular){
    case 'Goods Sold':
      switch(data.type){
        case 'cash':
          particular = 'Cash Account DR to Sales Account'
          break;
        case 'bank':
          particular = 'Bank Account DR to Sales Account'
          break;
        case 'other':
          particular = data.name+' A/C DR to Sales Account'
          break;
      }
      break;
    
    case 'Goods Purchased':
      switch(data.type){
        case 'cash':
          particular = 'Purchase Account DR to Cash Account';
          break;
        case 'bank':
          particular = 'Purchase Account DR to Bank Account'; 
          break;
        case 'other':
          particular = 'Purchase Account DR to '+data.name+' A/C';
          break;
      }
      break;

    case 'Cash Recieved':
      particular = 'Cash Account DR to '+data.name+' A/C'
      break;
    
    case 'Cheque Recieved':
      particular = 'Bank Account DR to '+data.name+' A/C'
      break;
    
    case 'Cash Paid':
      particular = data.name+' A/C DR to Cash Account'
      break;

    case 'Cheque Paid':
      particular = data.name+' A/C DR to Bank Account'
      break;
    
    case 'Salary Paid':
      particular = 'Salary Account DR to Bank Account'
      break;
    
    case 'Cash Drawn':
      particular = 'Drawing Account DR to Bank Account'
      break;

    case 'Expenses':
      particular = 'Expenses Account DR to Bank Account'
  }

  return particular;
}

let updateLedger = (data, callback) => {
  var date = data.date
  console.log("date = "+date)
  var debitAccount = data.particular.split(' DR to')[0];
  var creditAccount = data.particular.split('DR to ')[1];
  var debitParticular = 'To '+creditAccount;
  var creditParticular = 'By '+debitAccount;
  var debit = data.debit;
  var credit = data.credit;

  debitAccount = debitAccount.split(' ').join('_').toLowerCase();
  debitAccount = debitAccount.replace('/', '');
  creditAccount = creditAccount.split(' ').join('_').toLowerCase();
  creditAccount = creditAccount.replace('/', '')

  //console.log(debitAccount)
  //console.log(creditAccount)

  var query = `create table if not exists ${debitAccount}(
    id int primary key,
    date date,
    particular varchar(100),
    debit int,
    credit int,
    foreign key (id) references journal_entry(id) on delete cascade
  );`;
  query += `create table if not exists ${creditAccount}(
    id int primary key,
    date date,
    particular varchar(100),
    debit int,
    credit int,
    foreign key (id) references journal_entry(id) on delete cascade
  );`;
  query += `insert into ${debitAccount} (id, date, particular, debit, credit) values (LAST_INSERT_ID(), '${date}', '${debitParticular}', ${debit}, 0);`
  query += `insert into ${creditAccount} (id, date, particular, debit, credit) values (LAST_INSERT_ID(), '${date}', '${creditParticular}', 0, ${credit});`

  db.connector.query(query, (err, success) => {
    callback(err, success);
  })

}

let getAccounts = (data) => {

  var accounts = [];

  for(var i=0;i<data.length; i++){
    
    switch(data[i].Tables_in_mine){
      case 'bank_account':
      case 'cash_account':
      case 'daily_journal':
      case 'drawing_account':
      case 'expenses_account':
      case 'journal_entry':
      case 'purchase_account':
      case 'salary_account':
      case 'sales_account':
      case 'user':
        break;
      default:
        accounts.push(data[i].Tables_in_mine);
    }
  }
  
  return accounts;
}


let isDebtorOrCreditor = (account, callback) => {
  
  query = `select sum(debit) "sumDebit", sum(credit) "sumCredit" from ${account};`

  db.connector.query(query, (err, success) => {
    if(err)
      return callback('Err')
    else{
      //console.log(success[0]);
      if(success[0].sumDebit > success[0].sumCredit)
        return callback('Debtor');
      else if(success[0].sumDebit < success[0].sumCredit)
        return callback('Creditor');
      else
        return callback('None');
    }    
  })
}

let getDebtorsCount = (accounts, callback) => {
  var debtor = 0;

  accounts.forEach(account => {
    isDebtorOrCreditor(account, (type) => {
      //console.log(type)
      if(type == 'Debtor')
        debtor++;
    });
  }, () => {
    callback(debtor)
  })
}

module.exports = {
  getJournalEntryParticular,
  updateLedger,
  getAccounts,
  isDebtorOrCreditor,
  getDebtorsCount
}