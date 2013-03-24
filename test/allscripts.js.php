<?php
require "allscripturls.php";
header("Content-type: text/javascript");

$removeLogging = ("false" != $_POST["logging"]);

function doCommand($js, $commandStr) {
	$file = fopen("temp.js", "w");
	fwrite($file, $js);
	fclose($file);
	system($commandStr . " >tempout.js");
	$output = file_get_contents("tempout.js");
	unlink("temp.js");
	unlink("tempout.js");
	return $output;
}

function googleSimple($js) {
	return doCommand($js, "java -jar compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS <temp.js");
}

function googleAdvanced($js) {
	return doCommand($js, "java -jar compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS <temp.js");
}

for ($i = 0, $len = count($scripts); $i < $len; $i++) {
    if ($removeLogging) {
        $scriptLines = file('../js/' . $scripts[$i]);
        $allLines = array();
        for ($j = 0, $jLen = count($scriptLines); $j < $jLen; $j++) {
            $line = $scriptLines[$j];
            if (    !preg_match("/^\\s*log\\.(trace|debug|info|warn|error|fatal|time|timeEnd|group|groupEnd)/", $line) &&
                    !preg_match("/^\\s*var\s+log\\s*=/", $line)) {
                $allLines[] = $line;
            }
        }
        if ($_GET['compress']) {
            echo googleSimple(implode($allLines));
        } else {
            echo implode($allLines);
        }
    } else {
        require '../js/' . $scripts[$i];
    }
}

?>