#!/usr/bin/python3
# -*- coding: UTF-8 -*-# enable debugging
import os.path

print("Content-Type: text/html;charset=utf-8")
print()
print("Hello World!")
print()

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "bla.txt"), "w") as file1:
	file1.write("Write what you want into the field")

