// migrations/YYYYMMDDHHMMSS_create_user_scores_table.js
export function up(knex) {
    return knex.schema.createTable('user_scores', (table) => {
      table.increments('id').primary();
      table.uuid('user_id').references('user_id').inTable('users').onDelete('CASCADE');
      table.uuid('quiz_id').references('quiz_id').inTable('quizzes').onDelete('CASCADE');
      table.integer('score').defaultTo(0);
      table.integer('unattempted').defaultTo(0);
      table.integer('total_questions').notNullable();
      table.timestamp('submitted_at').defaultTo(knex.fn.now());
    });
  }
  
  export function down(knex) {
    return knex.schema.dropTableIfExists('user_scores');
  }
  