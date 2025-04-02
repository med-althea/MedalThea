export function up(knex) {
    return knex.schema.alterTable("quizzes", (table) => {
      table.integer("category_id").unsigned().references("category_id").inTable("categories").onDelete("CASCADE");
      table.integer("topic_id").unsigned().references("topic_id").inTable("topics").onDelete("CASCADE");
      table.integer("set_id").unsigned().references("set_id").inTable("sets").onDelete("CASCADE");
      table.dropColumn("category");
      table.dropColumn("topics");
      table.dropColumn("set");
    });
  }
  
  export function down(knex) {
    return knex.schema.alterTable("quizzes", (table) => {
      table.dropColumn("category_id");
      table.dropColumn("topic_id");
      table.dropColumn("set_id");
      table.integer("category");
      table.string("topics", 255);
      table.string("set", 255);
    });
  }
  