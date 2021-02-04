<?php
//require_once 'interview.php';

/*
  authors:  Caroline Haller
            Manfred Moosleitner
 */

if(isset( $_POST['functionname'])) {
	$interview = new Interview();
	$result = $interview->getArraysJSON();
	echo $result;
}