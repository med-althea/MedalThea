// migrations/YYYYMMDDHHMMSS_create_quiz_questions_table.js
export function up(knex) {
    return knex.schema.createTable('quiz_questions', (table) => {
      table.increments('question_id').primary();
      table.uuid('quiz_id').references('quiz_id').inTable('quizzes').onDelete('CASCADE');
      table.string('question').notNullable();
      table.string('option_a').notNullable();
      table.string('option_b').notNullable();
      table.string('option_c').notNullable();
      table.string('option_d').notNullable();
      table.string('answer').notNullable();
      table.text('explanation').nullable();
      table.smallint('status').defaultTo(1).comment('1: Active, 2: Inactive, 3: Deleted');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }
  
  export function down(knex) {
    return knex.schema.dropTableIfExists('quiz_questions');
  }
  