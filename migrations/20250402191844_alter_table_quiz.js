export function up(knex) {
    return knex.schema.alterTable("quiz_questions", (table) => {
      table.text("image").nullable();
    });
  }
  
  export function down(knex) {
    return knex.schema.alterTable("quiz_questions", (table) => {
      table.dropColumn("image");
    });
  }
  