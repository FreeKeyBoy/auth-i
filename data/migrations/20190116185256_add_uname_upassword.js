
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', users => {
      users.increments(); //primary key
      users.string('username')
        .notNullable()
        .unique()
      users.string('password') //password reqs
        .notNullable()
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('users');
};
