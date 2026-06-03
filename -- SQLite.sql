-- SQLite
CREATE TABLE Ingredients (
    IngredientID INTEGER PRIMARY KEY AUTOINCREMENT,
    Item TEXT NOT NULL UNIQUE,
    Calories REAL NOT NULL,
    Protein REAL NOT NULL,
    Carbs REAL NOT NULL,
    Fat REAL NOT NULL,
    Fiber REAL NOT NULL,
    Sugar REAL NOT NULL,
    Sodium REAL NOT NULL
    );