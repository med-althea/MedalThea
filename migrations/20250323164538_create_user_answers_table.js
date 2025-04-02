// migrations/YYYYMMDDHHMMSS_create_user_answers_table.js
export function up(knex) {
    return knex.schema.createTable('user_answers', (table) => {
      table.increments('id').primary();
      table.uuid('user_id').references('user_id').inTable('users').onDelete('CASCADE');
      table.uuid('quiz_id').references('quiz_id').inTable('quizzes').onDelete('CASCADE');
      table.integer('question_id').references('question_id').inTable('quiz_questions').onDelete('CASCADE');
      table.string('user_answer').notNullable();
      table.boolean('is_correct').defaultTo(false);
    });
  }
  
  export function down(knex) {
    return knex.schema.dropTableIfExists('user_answers');
  }
  