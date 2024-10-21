function keepTopN(dictionary, N) {
    // Extract key-value pairs into an array of tuples
    var items = Object.entries(dictionary);

    // Sort the array of key-value pairs in descending order based on values
    items.sort((a, b) => b[1] - a[1]);

    // Keep only the top N entries
    var topNItems = items.slice(0, N);

    // Reconstruct the dictionary with only the top N entries
    var topNDictionary = {};
    topNItems.forEach(function(item) {
        topNDictionary[item[0]] = item[1];
    });

    return topNDictionary;
}

// Example usage:
var unsortedDictionary = { "apple": 3, "banana": 1, "orange": 2, "grape": 5, "peach": 4 };
var N = 3; // Keep the top 3 entries
var topNDictionary = keepTopN(unsortedDictionary, N);
console.log(topNDictionary);
