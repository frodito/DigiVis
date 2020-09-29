# Code for DigiVis NER

import os
import spacy
from datetime import datetime
import json
from langdetect import detect


class DigiVisNER:
	"""
	The class DigiVisNER is to be used in the context of the MediaWiki extension DigiVis.
	The intended use for this program is to be called from PHP, read a JSON string from a file in a
	specific folder. The JSON string needs to contain pairs of key (identifies the annotation) and
	value (holds the annotated text). The program analyzes the texts of the annotations with named
	entity recognition, creates a python dict from the results, and print the resulting dictionary
	as json string to pass it back to PHP. In the current version, only English texts are supported.
	The JSON string can be distributed to several files, as all files in the folder are processed.
	"""
	
	# holds the information, which entity names should be renamed, and the new name
	# each entry is of the form "name_to_replace": "use this for replacement",
	# e.g., "glasersfeld": "Ernst von Glasersfeld"
	rename = {
	
	}
	
	# holds the information about which entities should be of type PERSON
	to_person = [
	
	]
	
	# holds the information of recognized entities, which are actually none
	delete = [
	
	]
	
	# list of labels to process
	labels = [
		"ORG",
		"PERSON",
		"GPE",
		"NORP",
		"LOC"
	]
	
	def __init__(self, model='en_core_web_lg'):
		"""
		Construct DigiVisNER object with default english, large model from spacy and no debugging
		output
		:param model: model to be used by spacy, default is english large, models must be installed separately
		"""
		
		# absolute path to the folder where the text_files to analyze are stored on the server
		# the names of the textfiles should contain some kind of key
		self.textfile_folder_absolute_path = ''
		
		# build list of files to process and print warning if no files are found before exiting
		self.filelist = [f for f in os.listdir(self.textfile_folder_absolute_path) if os.path.isfile(os.path.join(self.textfile_folder_absolute_path, f))]
		if len(self.filelist) == 0:
			print("No files found in", self.textfile_folder_absolute_path, "exiting.")
			exit(1)
		self.model = model
		self.nlp = spacy.load(self.model)
		self.result = {}
		self.run_ner()
		self.print_results()
	
	def read_json_from_file(self, filename):
		"""
		Reads the JSON string from the specified file and construct a python dict from ti
		:param filename: the name of the file to load
		:return: returns the the JSON string from the file as python dict
		"""
		try:
			with open(os.path.join(self.textfile_folder_absolute_path, filename), "r") as file:
				return json.load(file)
		except Exception as error:
			print(error)
			print('Error reading json data from file {}'.format(filename))
	
	def process_entity(self, annotation, text_key, entity):
		"""
		Postprocessing for single entites, stores the result in python dict
		:param annotation: the key of the annotation this entity is from
		:param text_key: the text value of the name of the entity in lowercase
		:param entity: the entity as occured in the annotation
		:return: nothing
		"""
				# use rename-value if specified in self.rename
		# replace text_key as specified in dict self.rename
		text_content = self.rename[text_key] if text_key in self.rename else entity.text
		
		# replace label with PERSON if specified in list self.to_person
		label = 'PERSON' if text_key in self.to_person else entity.label_
		
		# put entity name in results dict only once per annotation
		if text_content not in self.result[annotation][label]:
			self.result[annotation][label].append(text_content)
	
	def initialize_results_dict_per_annotation(self, annotation):
		"""
		Initialize the result dict for each annotation
		:param annotation:  the key of the annotation, which is used in the results dict
		:return: nothing
		"""
		self.result[annotation] = {}
		for label in self.labels:
			self.result[annotation][label] = []
	
	def run_ner(self):
		"""
		Runs the analysis for the read annotations.
		First, the JSON strings are read from the specified folder. Second, each entry in the JSON
		is NERed.
		:return: nothing
		"""
		for filename in self.filelist:
			json_parsed = self.read_json_from_file(filename)
			for annotation, quote in json_parsed.items():
				
				# replace newline- and tabulator-symbols with space
				quote = quote.replace("\n", " ").replace("\t", " ")
				
				# detect language of text
				language = detect(quote)
				self.initialize_results_dict_per_annotation(annotation)
				
				if language == 'en':  # process only english texts
					
					# run NER on the text
					doc = self.nlp(quote)
					
					for entity in doc.ents:
						
						# only process entities with labels as specified
						if entity.label_ not in self.labels:
							continue
						
						text_key = entity.text.lower()
						
						# skip entity if specified
						if text_key in self.delete:
							continue
						
						# process the entity
						self.process_entity(annotation, text_key, entity)
	
	def print_results(self):
		"""
		Return the results to PHP by converting the results dict to JSON string and print the string.
		:return: nothing
		"""
		print(json.dumps(self.result))


# create an ner-analyzer with default properties
ner = DigiVisNER()
