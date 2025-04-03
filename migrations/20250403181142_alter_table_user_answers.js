export function up(knex) {
    return knex.schema.alterTable("user_scores", (table) => {
      table.integer("incorrect").nullable();
    });
  }
  
  export function down(knex) {
    return knex.schema.alterTable("user_scores", (table) => {
      table.dropColumn("incorrect");
    });
  }
  