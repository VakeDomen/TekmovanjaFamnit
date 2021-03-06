<?php

chdir("/var/www/TekmovanjaFamnit/cli/");

$competitionId = "c33ecdf8-1ff0-4d5d-836b-4dcb6bf53993";

$ch = curl_init("https://tekmovanje.famnit.upr.si/api/round/competition/" . $competitionId);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer asdfghjk'
));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$response = curl_exec($ch);
//print ($response);
$result = json_decode($response, true);
curl_close($ch);


$ch = curl_init("https://tekmovanje.famnit.upr.si/api/competition/" . $competitionId);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer asdfghjk'
));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$comp = curl_exec($ch);
$competitionData = json_decode($comp, true);
curl_close($ch);



if ($result["code"] != 200) {
    die();
}
$currentRound = $result["data"]["round"]["id"];
$roundId = $result["data"]["round"]["round_type_id"];
$roundType = $result["data"]["round"]["type"];
$gamesPerPlayer = 5;
$resourcePrefix = "/var/www/TekmovanjaFamnit/api";
$dirName = "/var/www/TekmovanjaFamnit/cli/matches/" . $currentRound;

colorLog("Current Round: " . $currentRound . " with id: " . $roundId);

if (!file_exists('matches')) {
    mkdir('matches', 0777, true);
}

mkdir($dirName);
$players = array();
foreach ($result["data"]["contestants"] as $id => $player) {
    array_push($players, $player);
}
colorLog("There are " . count($players) . " players in this round..");
foreach ($players as $id => $player) {
    $playerFolder = $dirName . "/" . $player["active_submission_id"];
    mkdir($playerFolder);
    for ($i = 0; $i < $gamesPerPlayer; $i++) {
        colorLog("*************** GAME START ***************");
        $opponent = $players[array_rand($players)];
        $gameFolder = $playerFolder . "/" . $i . "_" . $opponent["active_submission_id"];
        if (!file_exists($gameFolder)) {
            mkdir($gameFolder);
        }
        if (!file_exists($gameFolder . "/A")) {
            mkdir($gameFolder . "/A");
        }
        if (!file_exists($gameFolder . "/B")) {
            mkdir($gameFolder . "/B");
        }
        //copy player
        copy($resourcePrefix . "/" . $player["path"], $gameFolder . "/A/A.zip");
        //unzip player
        $zip = new ZipArchive;
        $zip->open($gameFolder . "/A/A.zip");
        $zip->extractTo($gameFolder . "/A/");
        $zip->close();
        //compile player
        $compile_out = compilePlayer($gameFolder . "/A");
        //copy opponent
        copy($resourcePrefix . "/" . $opponent["path"], $gameFolder . "/B/B.zip");
        //unzip opponent
        $zip = new ZipArchive;
        $zip->open($gameFolder . "/B/B.zip");
        $zip->extractTo($gameFolder . "/B/");
        $zip->close();
        //compile player
        $compile_out = compilePlayer($gameFolder . "/B");
        //run the game
        $output = null;
        $result = array(
            "round" => $currentRound,
            "submission_id_1" => $player["active_submission_id"],
            "submission_id_2" => $opponent["active_submission_id"],
            "competition_id" => $competitionData["data"][0]["id"]
        );
        colorLog("Running game between submissions: " . $result["submission_id_1"] . " vs " . $result["submission_id_2"], "d");
        
        
        while (@ ob_end_flush()); // end all output buffers if any
        $proc = popen("/usr/bin/java -jar /var/www/TekmovanjaFamnit/cli/Evaluator.jar SpaceBattleship " . $gameFolder . "/A " . $gameFolder . "/B", 'r');
        $winner = "none";
        $output = array();
        while (!feof($proc))
        {
            $logLine = fread($proc, 4096);
            $output = array_merge($output, explode("\n", $logLine));
            $winner = findWinner($logLine);
            if (strcmp($winner, "none")) {
                colorLog("Someone won! - " . $winner, 'i');
                break;
            }
        }

        exec("/usr/bin/pkill -9 -f 'SpaceBattleship'");
        exec("/usr/bin/pkill -9 -f 'java Igralec'");

        if (strcmp($winner, "A") == 0) {
            $result["submission_id_winner"] = $player["active_submission_id"];
        } else {
            $result["submission_id_winner"] = $opponent["active_submission_id"];
        }

        $result["additional_data"] = json_encode(parseLog($output));
        colorLog("Winner: " . $result["submission_id_winner"], "d");
        sendResult($result);
        colorLog("Results submitted", "s");
        colorLog("*****************************************\n");
    }
}

//cleanup
rmdir_recursive("./matches");


class Planet
{
    private $id, $x, $y, $size, $fleet, $color;
    function __construct($id, $x, $y, $size, $fleet, $color)
    {
        $this->id = $id;
        $this->x = $x;
        $this->y = $y;
        $this->size = $size;
        $this->fleet = $fleet;
        $this->color = $color;
    }
}


class Stats
{
    public $fleets, $lostShipsRed, $lostShipsBlue, $lostPlanetsRed, $lostPlanetsBlue;
}


function findWinner($logLine) {
    $logLine = str_replace(["\n"], " ", $logLine);
    $lineTokens = explode(" ", $logLine);
    $i = 0;
    $len = count($lineTokens);
    while ($i < $len) {
        if (!strcmp(trim($lineTokens[$i]), "L")) {
            colorLog($lineTokens[$i + 2], "i");
            if (!strcmp(substr($lineTokens[$i + 1], -1), "A")) {
                return "B";
            } else {
                return "A";
            }
        }
        $i++;
    }
    
    return "none";
}

function compilePlayer($playerPath)
{
    $output = null;
    exec("javac " . $playerPath . "/*.java", $output);
    return $output;
}

function parseLog($log)
{
    $stats = array();
    $myColor = "red";
    $planets = array();
    $fleets = array();
    foreach ($log as $key => $line) {
        $tokens = explode(" ", $line);
        switch ($tokens[0]) {
            case "U":
                break;
            case "P":
                $planets[$tokens[1]] = array("size" => $tokens[4], "color" => $tokens[6], "fleet" => $tokens[4]);
                break;
            case "F":
                $fleets[$tokens[1]] = array("color" => $planets[$tokens[4]]["color"], "size" => $tokens[2]);
                break;
            case "E":
                $planets = array();
                break;
        }
    }
    $stats["myFleetSize"] = 0;
    $stats["hisFleetSize"] = 0;
    $stats["numFleetsMine"] = 0;
    $stats["FleetsTotalSize"] = 0;
    foreach ($fleets as $key => $fleet) {
        if ($fleet["color"] == $myColor) {
            $stats["myFleetSize"] += $fleet["size"];
            $stats["numFleetsMine"] += 1;
        } else {
            $stats["hisFleetSize"] += $fleet["size"];
        }
        $stats["FleetsTotalSize"] += $fleet["size"];
    }
    $stats["numFleetsHis"] = count($fleets) - $stats["numFleetsMine"];
    $stats["numFleetsTotal"] = count($fleets);

    return $stats;
}

function sendResult($result)
{

    $ch = curl_init('https://tekmovanje.famnit.upr.si/api/match');
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Authorization: Bearer asdfghjk'
    ));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $result);

    // execute!
    $response = curl_exec($ch);

    // close the connection, release resources used
    curl_close($ch);
}


function colorLog($str, $type = 'i')
{
    switch ($type) {
        case 'e': //error
            echo "\033[31m$str \033[0m\n";
            break;
        case 's': //success
            echo "\033[32m$str \033[0m\n";
            break;
        case 'w': //warning
            echo "\033[33m$str \033[0m\n";
            break;
        case 'd': //data
            echo "\033\e[95m$str \033[0m\n";
            break;
        case 'i': //info
            echo "\033[36m$str \033[0m\n";
            break;
        default:
            # code...
            break;
    }
}
function rmdir_recursive($dir) {
    foreach(scandir($dir) as $file) {
        if ('.' === $file || '..' === $file) continue;
        if (is_dir("$dir/$file")) rmdir_recursive("$dir/$file");
        else unlink("$dir/$file");
    }
    rmdir($dir);
}
