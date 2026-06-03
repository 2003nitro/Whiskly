import re
from pathlib import Path

state_terms = []

def measurementConvert():
    """
    Converts the measurement of an ingredient to a standard unit (e.g., grams, milliliters).
    """


def _clean_ingredient_name(line):
    """
    Return the base ingredient name from one bullet line in Ingredients.txt.
    This removes the quantity/unit prefix and any descriptor after ' - '.
    """
    text = line.strip().lstrip('•- ').strip()
    if not text:
        return None

    # Ignore section headings such as 'Coating', 'Filling', 'Glaze'.
    if text.lower() in {"coating", "filling", "glaze"}:
        return None

    # Keep the ingredient name only, not the notes after the dash.
    text = text.split(' - ', 1)[0].strip()

    # Remove quantity and unit words from the front of the line.
    text = re.sub(
        r'^\s*(?:\d+\s+\d/\d+|\d+/\d+|\d+\s*-\s*\d+|\d+)\s*'
        r'(?:tbps?|tablespoons?|teaspoons?|tsp|cups?|pounds?|lbs?|ounces?|oz|grams?|g|milliliters?|ml|liters?|l)?\s*',
        '',
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(r'\s+', ' ', text).strip()
    return text or None


def InputIngredients(file_path='Ingredients.txt'):
    """
    Asks the user for input on what ingredients they want to add and if there are any headings
    """
    all_ingredients = []

    while True:
        counter = 1
        # add the option to have no category and add one after if the user wants
        userCat = input("Enter a category name or enter 'done' to finish: ")
        if userCat.lower() == 'done':
            break
        else:
            while True:
                userIngr = input(f"Enter ingredient {counter}for category {userCat} or enter 'done' to finish category: ")
                if userIngr.lower() == 'done':
                    break
                
                # check if a "-" is in the ingredient and if so check to see if a state term is present and if so remove from the ingredient
                userIngr = userIngr.split(' - ')
                if len(userIngr) > 1:
                    if userIngr[1] not in state_terms:
                        state_terms.append(userIngr[1])
                        userIngr = userIngr[0]
                all_ingredients.append(userIngr)

                counter += 1

    print("All ingredients entered:")
    print(all_ingredients)
    print("State terms identified:")
    print(state_terms)

InputIngredients()