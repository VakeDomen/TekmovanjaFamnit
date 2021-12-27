<?php


$competitionId = "c33ecdf8-1ff0-4d5d-836b-4dcb6bf53993";

$ch = curl_init("https://tekmovanje.famnit.upr.si/api/round/competition/".$competitionId);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer asdfghjk'
));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$response = curl_exec($ch);
//print ($response);
$result = json_decode($response, true);
curl_close($ch); 


$ch = curl_init("https://tekmovanje.famnit.upr.si/api/competition/".$competitionId);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer asdfghjk'
));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$comp = curl_exec($ch);
$competitionData = json_decode($comp, true);
curl_close($ch); 



if($result["code"] !=200){
    die();
}
$currentRound = $result["data"]["round"]["id"];
$roundId = $result["data"]["round"]["round_type_id"];
$roundType = $result["data"]["round"]["type"];
$gamesPerPlayer = 5;
$resourcePrefix="../api";
$dirName = "matches/" . $currentRound;

colorLog("Current Round: ".$currentRound . " with id: " . $roundId);

if (!file_exists('matches')) {
    mkdir('matches', 0777, true);
}

mkdir($dirName);
$players = array();
foreach ($result["data"]["contestants"]as $id => $player) {
    array_push($players, $player);
}
colorLog("There are " . count($players) . " players in this round..");

foreach ($players as $id => $player) {
    $playerFolder = $dirName . "/" . $player["contestant_id"];
    mkdir($playerFolder);
    for ($i=0; $i < $gamesPerPlayer; $i++) { 
        $opponent = $players[array_rand($players)];
        $gameFolder = $playerFolder. "/" . $opponent["contestant_id"];
        mkdir($gameFolder);
        mkdir($gameFolder."/A");
        mkdir($gameFolder."/B");
        //copy player
        copy($resourcePrefix ."/".$player["path"], $gameFolder."/A/A.zip");
        //unzip player
        $zip = new ZipArchive;
        $zip->open($gameFolder."/A/A.zip");
        $zip->extractTo($gameFolder."/A/");
        $zip->close();
        //compile player
        $compile_out = compilePlayer($gameFolder."/A");
        //copy opponent
        copy($resourcePrefix ."/".$opponent["path"], $gameFolder."/B/B.zip");
        //unzip opponent
        $zip = new ZipArchive;
        $zip->open($gameFolder."/B/B.zip");
        $zip->extractTo($gameFolder."/B/");
        $zip->close();
        //compile player
        $compile_out = compilePlayer($gameFolder."/B");
        //run the game
        $output=null;
             $result = array(
            "round" => $roundId,
            "submission_id_1" => $player["contestant_id"],
            "submission_id_2" => $opponent["contestant_id"],
            "competition_id" => $competitionData["id"];
        );
        colorLog("Running game between : " . $result["submission_id_1"] . " vs " . $result["submission_id_2"],"d");
        exec("java -jar Evaluator.jar SpaceBattleship ". $gameFolder."/A " . $gameFolder."/B", $output);
        $lastLine =explode(" ", $output[count($output)-1]);
        if(substr($lastLine[1], -1) == "A"){
            $result["submission_id_winner"] =$player["contestant_id"];
        }else{
            $result["submission_id_winner"] =$opponent["contestant_id"];
        }
        colorLog("Winner: " . $result["submission_id_winner"],"d");
        sendResult($result);
        colorLog("Results submitted", "s");
    }
}


class Planet{
    private $id,$x, $y, $size, $fleet, $color;
    function __construct($id,$x, $y, $size, $fleet, $color) {
        $this->id = $id;
        $this->x = $x;
        $this->y = $y;
        $this->size = $size;
        $this->fleet = $fleet;
        $this->color = $color;
      }
}


class Stats{
    public $fleets, $lostShipsRed, $lostShipsBlue, $lostPlanetsRed, $lostPlanetsBlue;
}

function compilePlayer($playerPath){
    $output=null;
    exec("javac ". $playerPath ."/*.java", $output);
    return $output;
}


function parseLog($log){


}

function sendResult($result){

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


function colorLog($str, $type = 'i'){
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
?>