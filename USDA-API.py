import re
import requests
from difflib import SequenceMatcher


# ============================================================
# CONFIGURATION
# ============================================================

USDA_API_KEY = "ZoSI9xnzRgjxHBd78axFUAIExUDNbICunSpP8tU1"

SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

RESULT_LIMIT = 5

# Number of candidates to retrieve from EACH USDA data type.
SEARCH_PAGE_SIZE = 50


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize(text):
    """
    Normalizes text so USDA descriptions are easier to compare.

    Example:
        "Butter, Stick, Salted"
    becomes:
        "butter stick salted"
    """

    text = text.lower()

    # Treat hyphens like spaces.
    text = text.replace("-", " ")

    # Remove punctuation.
    text = re.sub(r"[^\w\s]", " ", text)

    # Remove duplicate spaces.
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ============================================================
# USDA API SEARCH
# ============================================================

def search_usda(query, data_types, page_size=50):
    """
    Searches USDA FoodData Central.

    data_types should be a list such as:
        ["Foundation"]
        ["SR Legacy"]
        ["Survey (FNDDS)"]
        ["Branded"]
    """

    payload = {
        "query": query,
        "dataType": data_types,
        "pageSize": page_size
    }

    response = requests.post(
        SEARCH_URL,
        params={
            "api_key": USDA_API_KEY
        },
        json=payload,
        timeout=10
    )

    # Give us useful information if USDA rejects the request.
    if not response.ok:
        print("\nUSDA API ERROR")
        print("-----------------------------")
        print("Status:", response.status_code)
        print("Response:", response.text)
        print(
            "Rate Limit:",
            response.headers.get("X-RateLimit-Limit")
        )
        print(
            "Remaining:",
            response.headers.get("X-RateLimit-Remaining")
        )
        print("-----------------------------\n")

        response.raise_for_status()

    data = response.json()

    return data.get("foods", [])


# ============================================================
# FOOD SCORING
# ============================================================

def score_food(food, original_query):
    """
    Gives each USDA result a relevance score.

    Higher score = better match.
    """

    query = normalize(original_query)

    description = normalize(
        food.get("description", "")
    )

    query_words = set(query.split())
    description_words = set(description.split())

    score = 0


    # --------------------------------------------------------
    # 1. EXACT MATCH
    # --------------------------------------------------------

    # Example:
    #
    # Query:
    #   cheddar cheese
    #
    # Description:
    #   cheddar cheese

    if description == query:
        score += 300


    # --------------------------------------------------------
    # 2. DESCRIPTION STARTS WITH QUERY
    # --------------------------------------------------------

    # Example:
    #
    # Query:
    #   butter
    #
    # Description:
    #   butter stick salted

    if description.startswith(query):
        score += 100


    # --------------------------------------------------------
    # 3. QUERY WORD MATCHING
    # --------------------------------------------------------

    matching_words = (
        query_words & description_words
    )

    if query_words:

        word_match_ratio = (
            len(matching_words)
            / len(query_words)
        )

        score += word_match_ratio * 100


    # --------------------------------------------------------
    # 4. REWARD RESULTS CONTAINING ALL QUERY WORDS
    # --------------------------------------------------------

    if (
        query_words
        and query_words.issubset(description_words)
    ):
        score += 75


    # --------------------------------------------------------
    # 5. GENERAL TEXT SIMILARITY
    # --------------------------------------------------------

    similarity = SequenceMatcher(
        None,
        query,
        description
    ).ratio()

    score += similarity * 50


    # --------------------------------------------------------
    # 6. PREFER SIMPLER FOOD DESCRIPTIONS
    # --------------------------------------------------------

    # For a basic recipe ingredient we generally prefer:
    #
    # Butter, salted
    #
    # over something extremely specific like:
    #
    # Butter, whipped, stick, reduced calorie, with salt

    extra_words = (
        description_words - query_words
    )

    score -= len(extra_words) * 2


    # --------------------------------------------------------
    # 7. USDA DATA TYPE PRIORITY
    # --------------------------------------------------------

    data_type = food.get("dataType", "")

    # Foundation is our preferred source.
    if data_type == "Foundation":
        score += 50

    # SR Legacy is our second choice.
    elif data_type == "SR Legacy":
        score += 25

    # FNDDS is still generic, but less preferred.
    elif data_type == "Survey (FNDDS)":
        score += 10

    # Branded should be our last resort.
    elif data_type == "Branded":
        score -= 25


    return score


# ============================================================
# REMOVE DUPLICATES
# ============================================================

def remove_duplicates(foods):
    """
    Removes foods with identical descriptions.

    This prevents results like:

        Butter, salted
        Butter, salted
        Butter, salted

    from taking multiple spots.
    """

    seen = set()
    unique = []

    for food in foods:

        description = normalize(
            food.get("description", "")
        )

        if description not in seen:

            seen.add(description)

            unique.append(food)

    return unique


# ============================================================
# RANK RESULTS
# ============================================================

def rank_foods(foods, query):
    """
    Scores every food and sorts from best to worst.
    """

    for food in foods:

        food["_matchScore"] = score_food(
            food,
            query
        )

    foods.sort(
        key=lambda food: food["_matchScore"],
        reverse=True
    )

    return foods


# ============================================================
# FIND FOOD OPTIONS
# ============================================================

def find_food_options(ingredient, limit=5):
    """
    Finds the best USDA matches for an ingredient.

    Search priority:

        Foundation
            ↓
        SR Legacy
            ↓
        Survey (FNDDS)
            ↓
        Branded (only if necessary)

    Each generic USDA database is searched separately so
    Foundation results cannot get buried underneath FNDDS
    or SR Legacy results.
    """


    # ========================================================
    # SEARCH FOUNDATION
    # ========================================================

    foundation_results = search_usda(
        ingredient,
        ["Foundation"],
        page_size=SEARCH_PAGE_SIZE
    )


    # ========================================================
    # SEARCH SR LEGACY
    # ========================================================

    sr_results = search_usda(
        ingredient,
        ["SR Legacy"],
        page_size=SEARCH_PAGE_SIZE
    )


    # ========================================================
    # SEARCH FNDDS
    # ========================================================

    fndds_results = search_usda(
        ingredient,
        ["Survey (FNDDS)"],
        page_size=SEARCH_PAGE_SIZE
    )


    # ========================================================
    # COMBINE GENERIC RESULTS
    # ========================================================

    generic_results = (
        foundation_results
        + sr_results
        + fndds_results
    )


    # Remove duplicate descriptions.
    generic_results = remove_duplicates(
        generic_results
    )


    # Rank all generic results together.
    generic_results = rank_foods(
        generic_results,
        ingredient
    )


    # Take the best results.
    results = generic_results[:limit]


    # ========================================================
    # BRANDED FALLBACK
    # ========================================================

    # Only search branded foods if we couldn't find enough
    # generic foods.

    if len(results) < limit:

        branded_results = search_usda(
            ingredient,
            ["Branded"],
            page_size=SEARCH_PAGE_SIZE
        )

        branded_results = remove_duplicates(
            branded_results
        )

        branded_results = rank_foods(
            branded_results,
            ingredient
        )

        needed = limit - len(results)

        results.extend(
            branded_results[:needed]
        )


    return results[:limit]


# ============================================================
# PRINT RESULTS
# ============================================================

def print_food_options(ingredient):
    """
    Displays the results in the console.
    """

    foods = find_food_options(
        ingredient,
        limit=RESULT_LIMIT
    )

    print()
    print("=" * 60)

    print(
        f"Best matches for: {ingredient}"
    )

    print("=" * 60)
    print()


    if not foods:

        print("No matching foods found.")

        return


    for index, food in enumerate(
        foods,
        start=1
    ):

        description = food.get(
            "description",
            "Unknown"
        )

        data_type = food.get(
            "dataType",
            "Unknown"
        )

        fdc_id = food.get(
            "fdcId",
            "Unknown"
        )

        score = food.get(
            "_matchScore",
            0
        )


        print(
            f"{index}. {description}"
        )

        print(
            f"   Type: {data_type}"
        )

        print(
            f"   FDC ID: {fdc_id}"
        )

        # Useful while developing.
        # You can remove this later.
        print(
            f"   Match Score: {score:.2f}"
        )

        print()


# ============================================================
# MAIN PROGRAM
# ============================================================

def main():

    print()
    print("USDA Ingredient Search")
    print("----------------------")

    while True:

        print()

        ingredient = input(
            "Enter an ingredient (or 'quit'): "
        ).strip()


        if ingredient.lower() in {
            "quit",
            "exit",
            "q"
        }:

            print("Goodbye!")

            break


        if not ingredient:

            continue


        try:

            print_food_options(
                ingredient
            )

        except requests.exceptions.RequestException as error:

            print()
            print(
                "There was an error communicating "
                "with the USDA API:"
            )

            print(error)


# ============================================================
# START PROGRAM
# ============================================================

if __name__ == "__main__":
    main()