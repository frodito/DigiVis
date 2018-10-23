# https://pythonprogramming.net/named-entity-recognition-stanford-ner-tagger/

from nltk.tag import StanfordNERTagger
from nltk.tokenize import word_tokenize
from nltk.chunk import conlltags2tree
from nltk.tree import Tree
from nltk import pos_tag


class NER():
	classes = '/home/frod/Downloads/stanford-ner/classifiers/english.all.3class.distsim.crf.ser.gz'
	# classes = '/home/frod/Downloads/stanford-ner/classifiers/english.muc.7class.distsim.crf.ser.gz'
	# classes = '/home/frod/Downloads/stanford-ner/classifiers/german.conll.germeval2014.hgc_175m_600.crf.ser.gz'
	tagger = '/home/frod/Downloads/stanford-ner/stanford-ner.jar'
	bio_tagged = []
	
	def __init__(self, filename):
		self.st = StanfordNERTagger(self.classes, self.tagger, encoding='utf-8')
		self.read_text(filename)
		self.tokenize_text()
		self.tag_text()
		self.bio_tagger()
		self.stanford_tree()
		self.structure_ne()
	
	def tokenize_text(self):
		self.tokenized_text = word_tokenize(self.text)
	
	def tag_text(self):
		self.tagged_text = self.st.tag(self.tokenized_text)
	
	def bio_tagger(self):
		self.bio_tagged = []
		prev_tag = "O"
		for token, tag in self.tagged_text:
			if tag == "O":  # O
				self.bio_tagged.append((token, tag))
				prev_tag = tag
				continue
			if tag != "O" and prev_tag == "O":  # Begin NE
				self.bio_tagged.append((token, "B-" + tag))
				prev_tag = tag
			elif prev_tag != "O" and prev_tag == tag:  # Inside NE
				self.bio_tagged.append((token, "I-" + tag))
				prev_tag = tag
			elif prev_tag != "O" and prev_tag != tag:  # Adjacent NE
				self.bio_tagged.append((token, "B-" + tag))
				prev_tag = tag
	
	def stanford_tree(self):
		tokens, ne_tags = zip(*self.bio_tagged)
		pos_tags = [pos for token, pos in pos_tag(tokens)]
		conlltags = [(token, pos, ne) for token, pos, ne in zip(tokens, pos_tags, ne_tags)]
		self.ne_tree = conlltags2tree(conlltags)
	
	def structure_ne(self):
		self.ne = []
		for subtree in self.ne_tree:
			if type(subtree) == Tree:  # If subtree is a noun chunk, i.e. NE != "O"
				ne_label = subtree.label()
				ne_string = " ".join([token for token, pos in subtree.leaves()])
				self.ne.append((ne_string, ne_label))
	
	def read_text(self, filename):
		with open(filename, "r") as file:
			self.text = file.read().replace('/n', ' ')
	
	def print_text(self):
		print('print_textŝ')
		print(self.text)
	
	def print_tokenized_text(self):
		print('print_tokenized_text')
		for token in self.tokenized_text:
			print(token)
	
	def print_tagged_text(self):
		print('print_tagged_text')
		print(self.tagged_text)
	
	def print_bio_tagged_text(self):
		print(self.bio_tagged)
	
	def print_ne_tree(self):
		print('print_bio_tagged_text')
		print(self.ne_tree)
	
	def print_ne(self):
		print('print_ne')
		print(self.ne)


myner = NER('text_en.txt')
# myner = NER('text_dt.txt')
# myner.print_tokenized_text()
# myner.print_tagged_text()
# myner.print_bio_tagged_text()
# myner.print_ne_tree()
myner.print_ne()
