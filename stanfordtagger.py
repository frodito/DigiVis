# https://pythonprogramming.net/named-entity-recognition-stanford-ner-tagger/

from nltk.tag import StanfordNERTagger
from nltk.tokenize import word_tokenize


class NER():
    classes = '/home/frod/Downloads/stanford-ner/classifiers/english.all.3class.distsim.crf.ser.gz'
    tagger = '/home/frod/Downloads/stanford-ner/stanford-ner.jar'

    def __init__(self, filename):
        self.st = StanfordNERTagger(self.classes, self.tagger, encoding='utf-8')
        self.read_text(filename)
        self.tokenized_text = word_tokenize(self.text)
        self.classified_text = self.st.tag(self.tokenized_text)

    def read_text(self, filename):
        with open(filename, "r") as file:
            self.text = file.read().replace('/n', ' ')

    def print_text(self):
        print(self.text)

    def print_tokenized_text(self):
        for token in self.tokenized_text:
            print(token)

    def print_classified_text(self):
        print(self.classified_text)


myner = NER('text.txt')
myner.print_tokenized_text()
myner.print_classified_text()