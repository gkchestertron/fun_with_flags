#!/bin/bash
clear
if [[ $@ == **-l** ]]
then
	node "`dirname $0`"/fli "$@" | less -R
else
	node "`dirname $0`"/fli "$@"
fi