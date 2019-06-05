#!/bin/bash
#
# fullsitebackup.sh V1.2
#
# Full backup of website files and database content.
#
# A number of variables defining file location and database connection
# information must be set before this script will run.
# Files are tar'ed from the root directory of the website. All files are
# saved. The MySQL database tables are dumped without a database name and
# and with the option to drop and recreate the tables.
#
# ----------------------
# 05-Jul-2007 - Quick adaptation for MediaWiki (currently testing)
# ----------------------
# March 2007 Updates - Version for Drupal
# - Updated script to resolve minor path bug
# - Added mysql password variable (caution - this script file is now a security risk - protect it)
# - Generates temp log file
# - Updated backup and restore scripts have been tested on Ubunutu Edgy server w/Drupal 5.1
#
# - Enjoy! BristolGuy
#-----------------------
#
## Parameters:
# tar_file_name (optional)
#
#
# Configuration
#

# Database connection information
dbname="wikidb" # (e.g.: dbname=wikidb)
dbhost="localhost"
dbuser="wikidb" # (e.g.: dbuser=wikiuser)
dbpw="G6sdYlDDUKhN0HUVMSEN" # (e.g.: dbuser password)

# Website Files
webrootdir="/var/www/html/mediawiki" # (e.g.: webrootdir=/home/user/public_html)

#
# Variables
#

# Default TAR Output File Base Name
tarnamebase=sitebackup-
datestamp=`date +'%m-%d-%Y'`

# Execution directory (script start point)
startdir=`pwd`
logfile=$startdir"/fullsite.log" # file path and name of log file to use

# Temporary Directory
tempdir=$datestamp

#
# Input Parameter Check
#

if test "$1" = ""
then
tarname=$tarnamebase$datestamp.tgz
else
tarname=$1
fi

#
# Begin logging
#
echo "Beginning mediawiki site backup using fullsitebackup.sh ..." > $logfile
#
# Create temporary working directory
#
echo " Creating temp working dir ..." >> $logfile
mkdir $tempdir

#
# TAR website files
#
echo " TARing website files into $webrootdir ..." >> $logfile
cd $webrootdir
tar cf $startdir/$tempdir/filecontent.tar .

#
# sqldump database information
#
echo " Dumping mediawiki database, using ..." >> $logfile
echo " user:$dbuser; database:$dbname host:$dbhost " >> $logfile
cd $startdir/$tempdir
mysqldump --host=$dbhost --user=$dbuser --password=$dbpw --add-drop-table $dbname > dbcontent.sql

#
# Create final backup file
#
echo " Creating final compressed (tgz) TAR file: $tarname ..." >> $logfile
tar czf $startdir/$tarname filecontent.tar dbcontent.sql

#
# Cleanup
#
echo " Removing temp dir $tempdir ..." >> $logfile
cd $startdir
rm -r $tempdir

#
# Exit banner
#
endtime=`date`
echo "Backup completed $endtime, TAR file at $tarname. " >> $logfile
