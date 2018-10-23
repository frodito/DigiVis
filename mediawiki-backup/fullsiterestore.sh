#!/bin/bash
#
# fullsiterestore.sh v1.1
#
# Restore of website file and database content made with full site backup.
#
# A number of variables defining file location and database connection
# information must be set before this script will run.
# This script expects a compressed tar file (tgz) made by fullsitebackup.sh.
# Website files should be in a tar file named filecontent.tar, and database
# content should be in a sqldump sql file named dbcontent.sql. This script
# expects the sql to drop the table before readdding the data. In other words,
# it does not do any database preparation.
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
# Parameters:
# tarfile # name of backup file to restore
#
#
# Database connection information
dbname="" # (e.g.: dbname=wikidb)
dbhost="" #
dbuser="" # (e.g.: dbuser=wikiuser)
dbpw="" # database user password

# Website location
webrootdir="" # (e.g.: where you keep your mediawiki directory structure)
#
# Variables

# Execution directory (script start point)
startdir=`pwd` # return of pwd() populates statdir var
logfile=$startdir/"fullsite.log" # file path and name of log file to use

# Temporary Directory
datestamp=`date +'%Y-%m-%d'` # uses US format
tempdir=$datestamp

#
# Begin logging
#
echo "Beginning mediawiki site restore using \'fullsiterestore.sh\' ..." > $logfile

#
# Input Parameter Check
#

# If no input parameter is given, echo usage and exit
if [ $# -eq 0 ]
then
echo " Usage: sh fullsiterestore.sh {backupfile.tgz}"
echo ""
exit
fi

tarfile=$1

# Check that the file exists
if [ ! -f "$tarfile" ]
then
echo " Can not find file: $tarfile" >> $logfile
echo " Exiting ..." >> $logfile
exit
fi

# Check that the webroot directory exists
if [ ! -d "$webrootdir" ]
then
# echo " Invalid internal parameter: webrootdir" >> $logfile
# echo " Directory: $webrootdir does not exist" >> $logfile
# echo " Exiting ..." >> $logfile
# exit
echo " Directory $webrootdir does not exist, but will be created"  >> $logfile
mkdir "$webrootdir"
fi

#
# Create temporary working directory and expand tar file
#
echo " Creating temp working dir ..." >> $logfile
mkdir $tempdir
cd $tempdir
echo " unTARing db and file tgz files ..." >> $logfile
tar xzf $startdir/$tarfile

#
# Remove old website files
#
echo " Removing old files from $webrootdir ..." >> $logfile
rm -r $webrootdir/*

#
# unTAR website files
#
echo " unTARing website files into $webrootdir ..." >> $logfile
cd $webrootdir
tar xf $startdir/$tempdir/filecontent.tar
sudo chown -R www-data:www-data $webrootdir
sudo chmod -R 774 $webrootdir

#
# Load database information
#
cd $startdir/$tempdir
echo " Restoring database ..." >> $logfile
echo " user: $dbuser; database: $dbname; host: $dbhost" >> $logfile
echo "use $dbname; source dbcontent.sql;" | mysql --password=$dbpw --user=$dbuser --host=$dbhost

#
# Cleanup
#
echo " Cleaning up ..." >> $logfile
cd $startdir
sudo rm -r $tempdir

#
# Exit banner
#
endtime=`date`
echo "Restoration completed $endtime for $tarfile. " >> $logfile
