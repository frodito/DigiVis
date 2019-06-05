import argparse


class DigiVisNER():
	
	def __init__(self):
		pass


# parse arguments
parser = argparse.ArgumentParser()
parser.add_argument("-f", dest='text_file')

args = parser.parse_args()
if args.processes is None:
	exit("no argument given")
