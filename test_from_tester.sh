#!/bin/bash
# This file is meant to be placed and run on the tester machine. The script recevies generic arguments that can apply to any
# tester machine (number of connection is the main point) regardless of the testing machine, and the script determines 
# based on ram on the machine, whether to go with the higher setting or the lower setting. So this makes the code identical for
# all the machine.
#
# To copy the updated code from my machine to the tester, I use  parallel-ssh  +  sshpass (to by pass password prompt). However
# for some reason NOT the same code works for actual linxu machine as it works for the WSL machines. So run the 2 to update the
# file on tester machines. I do have some generality in this command that hopefully some time in the future will figure out why its
# not working for all the machines the same

#-------- update geniuine linux systems ---------
# $ sshpass -p sln parallel-scp --host "$(cat ~/git/tester_ips_{strong,weak}.txt)" --user root --askpass ~/git/live_stream_test/test_from_tester.sh    $(echo "$(if [ -e '/mnt/c/' ];then echo '/mnt/c/testing/live_stream_test/';else echo '/testing/';fi)")

#-------- update wsl linux ----------
# sshpass -p sln parallel-scp --host "$(echo 10.6.254.{236,239,245}:2222)" --user root --askpass ~/git/live_stream_test/test_from_tester.sh    '/mnt/c/testing/live_stream_test'

# ----- code that i want to work but doesn't work on wsl:
# sshpass -p sln parallel-scp --host "$(cat ../tester_ips_{strong,weak}.txt) $(echo 10.6.254.{245,236,239}:2222)" --user root --askpass test_from_tester.sh    $(echo "$(if [ -e '/mnt/c/' ];then echo '/mnt/c/testing/live_stream_test/';else echo '/testing/';fi)")


# To execute it, for windows machine gotta be in the  /mnt/c/testing/live_stream_test folder
#                for linux machine I dont think it matters


# passing named args to the script. Inspired by: https://unix.stackexchange.com/questions/129391/passing-named-arguments-to-shell-scripts

# Example node command to be run
#  $ node test.js --tabs-time 15s --tabs-no 10 --vid-len 10m --vid-quality 8 --proxy 10.6.254.37:8080 --graph --headless
while getopts ":l:o:p:q:t:T:v:x:z:" opt; do
  case $opt in
    l) vid_len="$OPTARG"
    ;;
    o) overlap_time="$OPTARG"
    ;;
    p) proxy="$OPTARG"
    ;;
    q) quality="$OPTARG"
    ;;
    T) tabs_no_strong="$OPTARG"
    ;;
    t) tabs_no_weak="$OPTARG"
    ;;
    v) verbose="--print"
    ;;
    x) just_show_cmd=1 
    ;;
    z) stop_test=1
    ;;
    \?) echo -e "Invalid option -$OPTARG  \\n usage: \\n\\t\\t test.sh  -o ovelap_time  -p proxy  -q quality  -t tabs_no_weak  -s tabs_no_strong \\n" && exit 1 && >&2
    ;;
  esac
done



if [ $stop_test ] || [ "$1" == '-z' ]; then
  # ----------- kill all instances of node and chrome -------------
  echo "exit_code: $stop_test"
  cmd='kill -9 $(pgrep node) $(pgrep chrome)'
  echo "shutting down the running tester via  $cmd"
  sleep 10
  eval $cmd
  echo "========== Double checking to see if all instances of node are killed in 10s ============"
  echo "node: $(pgrep node), chrome: $(pgrep chrome)"
else

  # ----------- determine if strong machine (number of tabs depend on it)--------------
  mem=$(cat /proc/meminfo | grep MemTotal | awk '{print $2}')
  if [ $mem -gt 9000000 ]; then is_strong=1; fi
  if [ $is_strong -eq 1 ] && [ $tabs_no_strong ] ; then cmd_tab_no="--tabs-no $tabs_no_strong"; fi
  if [ ! $is_strong ] && [ $tabs_no_weak ] ; then  cmd_tab_no="--tabs-no $tabs_no_weak";fi

  # ---------- determine if windows (location of files depend on it) -------
  if [ -e "/mnt/c/" ]; then win=1; fi
  if [ $win ]; then 
    #test_file="c:\\testing\\live_stream_test\\test.js"
    test_file="test.js"
    cmd_win="cmd.exe /c "
  else
    test_file="/testing/test.js"
  fi




  # ------------- set defaults to avoid having blanks for diff arguments when sent to node --------------------
  if [ $proxy ]; then cmd_proxy="--proxy $proxy"; fi
  if [ $quality ]; then cmd_quality="--vid-quality $quality"; fi

  if [ $vid_len ]; then
    cmd_time="--vid-len $vid_len"
  elif [ $overlap_time ]; then
    cmd_time="--overlap-time $overlap_time"
  fi


  cmd="node $test_file --headless --tabs-time 15s $cmd_proxy $cmd_time $cmd_quality $cmd_tab_no"
  if [ $win ]; then cmd="$cmd_win $cmd"; fi
  echo "cmd:  $cmd"

  if [ ! $just_show_cmd ]; then
    eval "$cmd"
  fi

fi

