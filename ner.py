# https://towardsdatascience.com/named-entity-recognition-with-nltk-and-spacy-8c4a7d88e7da

import nltk
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag

class NER():

	def __init__(self, filename):
		self.read_text(filename)
		self.preprocessed = self.preprocess(self.text)
		self.chunking()

	def read_text(self, filename):
		with open (filename, "r") as file:
			self.text = file.read().replace('/n', ' ')

	def chunking(self):
		pattern = 'NP: {<DT>?<JJ>*<NN>}'
		cp = nltk.RegexpParser(pattern)
		self.chunkedSentence = cp.parse(self.preprocessed)

	def print_text(self):
		print(self.text)

	def print_preprocessed(self):
		print(self.preprocessed)

	def print_chunkedSentence(self):
		print(self.chunkedSentence)

	def preprocess(self, sent):
		sent = nltk.word_tokenize(sent)
		sent = nltk.pos_tag(sent)
		return sent

myner = NER('text.txt')
# myner.print_preprocessed()
myner.print_chunkedSentence()