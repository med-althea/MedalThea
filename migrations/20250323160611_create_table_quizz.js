export function up(knex) {
    return knex.schema.createTable('quizzes', (table) => {
      table.uuid('quiz_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('title').nullable();
      table.smallint('category').notNullable().comment('1: PYQ, 2: MRB, 3: Flashcards');
      table.string('set').nullable();
      table.string('topics').nullable();
      table.smallint('status').defaultTo(1).comment('1: Active, 2: Inactive, 3: Deleted');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.timestamp('deleted_at').nullable();
    });
  }
  
  export function down(knex) {
    return knex.schema.dropTableIfExists('quizzes');
  }