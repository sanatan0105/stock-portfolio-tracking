module.exports = {
    async up(db) {
      let date = new Date();
      await db.collection('securitymodels').insert({
        'companyName': 'Tata Consultancy Services Limited (TCS)',
        'ticketSymbol': 'TCS',
        'sharePrice': 1843.45,
        'createdAt': date,
        'updatedAt': date,
        '__v': 0
      });

      await db.collection('securitymodels').insert({
        'companyName': 'Wipro Information technology company',
        'ticketSymbol': 'WIPRO',
        'sharePrice': 319.25,
        'createdAt': date,
        'updatedAt': date,
        '__v': 0
      });

      await db.collection('securitymodels').insert({
        'companyName': 'Godrej Industries Ltd',
        'ticketSymbol': 'GODREJIND',
        'sharePrice': 535.00,
        'createdAt': date,
        'updatedAt': date,
        '__v': 0
      })
    },

    down(db) {
    }
};
