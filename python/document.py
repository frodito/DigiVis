import spacy
from nltk.tokenize import word_tokenize
from nltk import pos_tag
from nltk.corpus import stopwords
import string


class Document:
    
    def __init__(self, textfolder="./texts/", filename='1.txt', model_ner_spacy='xx_ent_wiki_sm'):
        self.textfolder = textfolder
        self.filename = filename
        self.model_ner_spacy = model_ner_spacy
        self.stop_words = set(stopwords.words('english'))
        self.text_raw = self.load_text_file()
        self.text_raw = self.text_raw.translate(dict((ord(char), None) for char in string.punctuation) )
        self.tokens_words = word_tokenize(self.text_raw)
        self.tokens_no_stopwords = self.remove_stopwords(self.tokens_words)
        self.text_ner_spacy = self.apply_ner_spacy(self.text_raw)
        self.text_pos_tagged = self.apply_pos_tagging(self.tokens_words)
    
    def load_text_file(self):
        """
        Load textfile given in filename from a specified folder and return the content
        :return: content of the given file
        """
        try:
            with open(self.textfolder + self.filename, "r") as file:
                text = file.read()
                return text
        except IOError:
            print('IOError when opening File', filename)
    
    def remove_stopwords(self, tokens):
        return [word for word in tokens if not word in self.stop_words]
    
    def apply_ner_spacy(self, text):
        nlp = spacy.load(self.model_ner_spacy)
        return nlp(text)
    
    def apply_pos_tagging(self, tokens):
        return pos_tag(tokens)
    
    def print_tokens_words(self):
        for token in self.tokens_words:
            print(token)
    
    def print_ner_spacy(self):
        for entity in self.text_ner_spacy.ents:
            print(entity.text, entity.label_)
    
    def print_tokens(self):
        print(self.tokens_words)

# doc1 = Document()
# doc1.apply_ner_spacy()
# doc1.print_ner_spacy()
