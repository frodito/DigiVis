<?php
//require_once 'interview.php';

if(isset( $_POST['functionname'])) {
	$interview = new Interview();
	$result = $interview->getArraysJSON();
	echo $result;
}