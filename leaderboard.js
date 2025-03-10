// Preaching results of each day
const results_url = "https://gopreach-default-rtdb.firebaseio.com/counter.json";

// Users catalog - list of all users and their names
const user_catalog_url = "https://gopreach-default-rtdb.firebaseio.com/users.json";

const simple_board = document.getElementById('simple-board');
const valid_board = document.getElementById('valid-board');
const fruit_board = document.getElementById('fruit-board');


// Cuts anything beyond 2nd decimal after period
// Skips any fixation if number is a whole integer
function FixDecimal(number) {
    return Math.round(number * 100) / 100;
}

// Applies single board data to the selected board
// round: Can chose to round numbers to nearest integer (boolean)
function ApplyBoardData(board, data, round) {
    let max = data[0][1];   // Highest value in leaderboard (top 1)

    if (max == 0) {
        return;
    }

    const ranking = board.querySelector(".ranking")

    for (let i = 0; i < ranking.children.length; i++) {
        let position = ranking.children[i];
        let result = data[i][1];
        let name = result == 0 ? "--" : data[i][0];

        rank_name = position.querySelector('.rank-name');

        if (name.length > 11) {
            name = name.split(" ")[0]
        }

        rank_name.textContent = name;

        monthly_change_display = position.querySelector(".monthly-change");
        monthly_change_display.textContent = round ? parseInt(Math.round(result)) : FixDecimal(result);
        console.log(result, FixDecimal(result))

        progress_bar = position.querySelector(".progress-bar");
        let width = (result / max * 100) + "%"
        progress_bar.style.width = width;
    }

}

function UpdateLeaderboard(data) {

    if (!data) {
        data = GetData();
    }

    ApplyBoardData(simple_board, data['simple'], true)
    ApplyBoardData(valid_board, data['valid'], false)
    ApplyBoardData(fruit_board, data['fruit'], false)
}


// Getting data

// Gets current date in format MMDDYY
function GetCurrentDate() {
    // Getting current date
    var currentDate = new Date();

    // Get the current date
    var day = currentDate.getDate().toString();
    var month = (currentDate.getMonth() + 1).toString(); // Note: January is 0!
    var year = currentDate.getFullYear().toString();

    // Makes sure that day number is two digit number
    // 16 -> 16
    // 6 -> 06
    if (day.length == 1) {
        day = "0" + day;
    }

    if (month.length == 1) {
        month = "0" + month;
    }

    year = year.substring(2, 4);

    return {
        date: month + day + year,
        day: day,
        SetDay: function(target_day) {
            target_day = target_day.toString();
            if (target_day.length == 1) {
                target_day = "0" + target_day;
            }

            return month + target_day + year;
        }
    };
}


function HttpGet(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false); // false indicates synchronous
    xhr.send();

    return JSON.parse(xhr.responseText);
}


// Gets user name from ID in format (John D)
const usernames_cache = {}; // Caches [userID : username]
function GetUsernameFromID(userID) {

    const user_catalog = HttpGet(user_catalog_url);
    let username = usernames_cache[userID];

    if (!username) {
        for (const key in user_catalog) {
            
            const user_info = user_catalog[key];

            if (!usernames_cache[user_info.databaseUser]) {
                this_username = user_info.firstName + " " + user_info.lastName.substring(0, 1);
                usernames_cache[user_info.databaseUser] = this_username;
            }
        }
    }

    username = usernames_cache[userID];
    // console.log(username, userID)
    return username ? username : "--";
}


// Quicksort algorithm that sorts dictionary (string: number) in descending order
function keepTopN(dictionary, N) {
    // Extract key-value pairs into an array of tuples
    var items = Object.entries(dictionary);

    // Sort the array of key-value pairs in descending order based on values
    items.sort((a, b) => b[1] - a[1]);

    // Keep only the top N entries
    var topNItems = items.slice(0, N);

    // Reconstruct the dictionary with only the top N entries
    var topNArray = [];
    topNItems.forEach(function(item) {
        // topNDictionary[item[0]] = item[1];
        topNArray.push([item[0], item[1]])
    });

    return topNArray;
}

function FixDataNumber(data) {
    if (typeof data == "string") {
        let sum = 0;
        let result = data.split(".")
        
        if (result.length >= 3) {
            for (let i = 1; i < result.length; i++) {
                sum += Number(result[i - 1] + result[i].substring(0, 2)) / 100;
                result[i] = result[i].substring(2);
            }
            return sum;
        }
    }
    return Number(data);
    
}

function GetData() {
    const users_data = HttpGet(results_url);

    let new_rankings = {
        simple: [],
        valid: [],
        fruit: [],
    }

    const date = GetCurrentDate();

    for (let i = date.day; i >= 1; i--) {
        const day_data = users_data[date.SetDay(i)];

        // Skips empty days
        if (day_data == undefined) {
            continue;
        }

        // user - user ID of user that preached on that day
        // results - preaching results of that user on that day
        for (const userID in day_data) {
            const results = day_data[userID];
            const username = GetUsernameFromID(userID);
            // console.log(results)
            // Sets new data if no info for the user is set in ranking, yet


            if (!new_rankings.simple[username]) {
                new_rankings.simple[username] = FixDataNumber(results.simple);
            } else {
                new_rankings.simple[username] += FixDataNumber(results.simple);
            }

            if (!new_rankings.valid[username]) {
                new_rankings.valid[username] = FixDataNumber(results.valid);
            } else {
                new_rankings.valid[username] += FixDataNumber(results.valid);
            }

            if (!new_rankings.fruit[username]) {
                new_rankings.fruit[username] = FixDataNumber(results.baptism);
            } else {
                new_rankings.fruit[username] += FixDataNumber(results.baptism);
            }
        }
    }

    new_rankings.simple = keepTopN(new_rankings.simple, 3);
    new_rankings.valid = keepTopN(new_rankings.valid, 3);
    new_rankings.fruit = keepTopN(new_rankings.fruit, 3);

    return new_rankings;
}

UpdateLeaderboard(GetData())

// UpdateLeaderboard({
//     simple: [
//         ["Frederick", 477],
//         ["Jamie", 449],
//         ["Carrie", 448],
//     ],
//     valid: [
//         ["Joshua", 4.8],
//         ["Cedric", 3.3],
//         ["Jacob", 3],
//     ],
//     fruit: [
//         ["Leon", 1],
//         ["Joshua", 1],
//         ["Jacob", 0.5],
//     ]
// })
