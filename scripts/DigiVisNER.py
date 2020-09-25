import os
import spacy
from datetime import datetime
import json
from langdetect import detect


class DigiVisNER:
	rename = {
		"ashby": "William Ross Ashby",
		"alcmaeon": "Alcmaeon of Croton",
		"aristotle": "Aristotle of Stagira",
		"bateson": "Gregory Bateson",
		"bentham": "Jeremy Bentham",
		"berkeley": "George Berkeley",
		"bigelow": "Julian Himely Bigelow",
		"bower": "Tom G. R. Bower",
		"bridgman": "Percy Bridgman",
		"ceccato": "Silvio Ceccato",
		"charles hockett’s": "Charles Hockett",
		"conant": "James Ferguson Conant",
		"connolly": "Cyril Connolly",
		"craik": "Kennet Craik",
		"darwin": "Charles Darwin",
		"de saussure’s": "Ferdinand De Saussure",
		"dewey": "John Dewey",
		"dubrul": "Jack DuBrul",
		"eliane": "Eliane Vurpillot",
		"foerster": "Heinz von Foerster",
		"freud": "Sigmund Freud",
		"garcia": "Rolando Garcia",
		"gergen": "Kenneth Gergen",
		"glasersfeld": "Ernst von Glasersfeld",
		"goethe": "Johann Wolfgang von Goethe",
		"hebb": "Donald Hebb",
		"heraclitus": "Heraklit von Ephesos",
		"heron": "W. Heron",
		"hockett": "Charles Heckett",
		"hollis": "John Hollis",
		"hume": "David Hume",
		"ibsen": "Henrik Ibsen",
		"james": "William James",
		"jean piaget’s": "Jean Piaget",
		"kant": "Immanuel Kant",
		"kawai": "Masao Kawai",
		"lakatos": "Imre Lakatos",
		"locke": "John Locke",
		"malinowski": "Bronislaw Malinowski",
		"mason": "Bill Mason",
		"maturana": "Humberto Maturana",
		"meyendorff": "John Meyendorff",
		"mill": "John Stuart Mill",
		"mischel": "Theodore Mischel",
		"morse": "Samuel Morse",
		"newton": "Isaac Newton",
		"pask": "Gordon Pask",
		"peirce": "Charles Peirce",
		"piaget": "Jean Piaget",
		"piaget et al.": "Jean Piaget",
		"popper": "Karl Popper",
		"powers": "William Power",
		"premack": "David Premack",
		"prigogine": "Ilya Prigogine",
		"pyrrho": "Pyrrhon von Elis",
		"richards": "John Richards",
		"rorty": "Richard Rorty",
		"rosenblueth": "Arturo Rosenblueth",
		"rosenblueth et al.": "Arturo Rosenblueth",
		"schopenhauer": "Arthur Schoppenhauer",
		"sextus": "Sextus Empiricus",
		"thorndike": "Edward Lee Thorndike",
		"tomasello": "Michael Tomasello",
		"vergiles": "Nikolay Yu Vergiles",
		"vico": "Giambattista Vico",
		"von foerster": "Heinz von Foerster",
		"von glasersfeld": "Ernst von Glasersfeld",
		"vurpillot": "Eliane Vurpillot",
		"wittgenstein": "Ludwig Wittgenstein",
		"xenophanes": "Xenophanes von Kolophon",
		"zinchenko": "Vladimir Zinchenko",
	}
	
	to_person = [
		"ashby",
		"bentham",
		"berkeley",
		"bridgman",
		"conant",
		"garcia",
		"gergen",
		"heinz von foerster",
		"hockett",
		"hume",
		"lakatos",
		"maturana",
		"mill",
		"newton",
		"peirce",
		"piaget",
		"popper",
		"powers",
		"premack",
		"prigogine",
		"pyrrho",
		"sextus",
		"tomasello",
		"vergiles",
		"von foerster",
	]
	
	split = {
		"piaget & garcia": ["piaget", "garcia"]
	}
	
	delete = [
		"15-16",
		"7",
		"a red house",
		"a.i.",
		"auf",
		"bobby pin",
		"briton",
		"communication",
		"communicatory",
		"cybernetics",
		"darling",
		"darstellung",
		"df11",
		"df6",
		"effecter channel",
		"faust",
		"gestalt",
		"ghosts",
		"house",
		"imo",
		"knower",
		"lana",
		"languaging",
		"lucy",
		"monalisa",
		"ortichard",
		"phylogenesis",
		"piagetian",
		"piagetian",
		"premises",
		"quantum mechanics",
		"renaissance",
		"retina",
		"sarah",
		"sarily",
		"schlagen",
		"semanticity",
		"significant”—which",
		"snoopy",
		"social constructionists",
		"sue",
		"susan",
		"symbolicity",
		"the association of the word",
		"the construction of knowledge",
		"the nutritional feedback loop",
		"the wash basin",
		"time",
		"tn",
		"treffen",
		"volkswagen",
		"vorstellung",
		"vorstellung",
		"vorstellung",
		"washoe",
		"western",
		"wiener",
		"yerkish",
	]
	
	labels = [
		"ORG",
		"PERSON",
		"GPE",
		"NORP",
		"LOC"
	]
	
	def __init__(self, model='en_core_web_lg', debug=False):
		start = datetime.now()
		start2 = datetime.now()
		self.dir = '/var/www/html/mediawiki/extensions/DigiVis/tmp/ner'
		self.filelist = [f for f in os.listdir(self.dir) if os.path.isfile(os.path.join(self.dir, f))]
		if len(self.filelist) == 0:
			print("No files found in", self.dir, "exiting.")
			exit(1)
		self.model = model
		self.nlp = spacy.load(self.model)
		self.time_load_model = datetime.now() - start2
		self.result = {}
		start2 = datetime.now()
		self.run_ner()
		self.time_run_ner = datetime.now() - start2
		self.print_results()
		self.time_total = datetime.now() - start
		if debug:
			print()
			print("time to load model: ", self.time_load_model)
			print("time to run ner   : ", self.time_run_ner)
			print("time total        : ", self.time_total)
	
	def read_json_from_file(self, filename):
		try:
			with open(os.path.join(self.dir, filename), "r") as file:
				return json.load(file)
		except Exception as error:
			print(error)
			print('Error reading json data from file {}'.format(filename))
	
	def process_entity(self, annotation, text_key, entity):
		# use rename-value if specified in self.rename
		text_content = self.rename[text_key] if text_key in self.rename else entity.text
		
		# use PERSON as label
		label = 'PERSON' if text_key in self.to_person else entity.label_
		if text_content not in self.result[annotation][label]:
			self.result[annotation][label].append(text_content)
	
	def run_ner(self):
		for filename in self.filelist:
			json_parsed = self.read_json_from_file(filename)
			for annotation, quote in json_parsed.items():
				quote = quote.replace("\n", " ").replace("\t", " ")
				language = detect(quote)
				self.result[annotation] = {}
				self.result[annotation]['ORG'] = []
				self.result[annotation]['PERSON'] = []
				self.result[annotation]['GPE'] = []
				self.result[annotation]['NORP'] = []
				self.result[annotation]['LOC'] = []
				if language == 'en':  # process only english texts
					doc = self.nlp(quote)
					for entity in doc.ents:
						if entity.label_ not in self.labels:
							continue
						
						text_key = entity.text.lower()
						
						# skip entity
						if text_key in self.delete:
							continue
						
						# split "piaget & garcia"
						if text_key == "piaget & garcia":
							self.process_entity(annotation, "piaget", entity)
							self.process_entity(annotation, "garcia", entity)
						else:
							self.process_entity(annotation, text_key, entity)
	
	def print_results(self):
		print(json.dumps(self.result))


ner = DigiVisNER(model='en_core_web_lg')
# ner = DigiVisNER(model='de_core_news_md')
# ner = DigiVisNER(model='de_core_news_sm')
