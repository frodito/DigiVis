from nltk.tokenize import word_tokenize


class Histogram():
	
	def __init__(self, filename):
		self.histogram = {}
		self.read_text(filename)
		self.tokenize_text()
		self.count_words()
	
	def read_text(self, filename):
		with open(filename, "r") as file:
			self.text = file.read().replace('/n', ' ')
	
	def tokenize_text(self):
		self.tokenized_text = word_tokenize(self.text)
	
	def count_words(self):
		for token in self.tokenized_text:
			if token in self.histogram:
				self.histogram[token] = self.histogram[token] + 1
			else:
				self.histogram[token] = 1
	
	def print_histogram(self):
		for k, v in self.histogram.items():
			print(k, ' : ', v)


h = Histogram("text.txt")
h.print_histogram()
