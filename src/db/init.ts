import { getDb } from "./index.js";
import { schema, defaultCategories } from "./schema.js";

/**
 * initialize database with schema and default data
 */
function init(): void {
  console.log("Initializing database...");

  const db = getDb();

  // run schema
  db.exec(schema);
  console.log("Schema created.");

  // seed default categories
  const insertCategory = db.prepare(
    "INSERT OR IGNORE INTO categories (name, description, color) VALUES (?, ?, ?)",
  );

  for (const cat of defaultCategories) {
    insertCategory.run(cat.name, cat.description, cat.color);
  }
  console.log("Default categories seeded.");

  db.close();
  console.log("Database initialized successfully!");
}

init();
