import argparse
import spacy
from spacy import displacy


class DigiVisNER:
    
    def __init__(self, model='xx_ent_wiki_sm', filename=None, remove_linesbreak=False):
        self.model = model
        self.filename = filename
        self.doc = None
        self.text_annotated = None
        
        if self.filename is None:
            self.text = 'Alan Mathison Turing was an English mathematician, ' \
                        'computer scientist, logician, cryptanalyst, philosopher ' \
                        'and theoretical biologist. Turing was highly influential ' \
                        'in the development of theoretical computer science, ' \
                        'providing a formalisation of the concepts of algorithm ' \
                        'and computation with the Turing machine, which can be ' \
                        'considered a model of a general-purpose computer. ' \
                        'Turing is widely considered to be the father of ' \
                        'theoretical computer science and artificial intelligence. ' \
                        'Despite these accomplishments, he was never fully ' \
                        'recognised in his home country during his lifetime, ' \
                        'due to his homosexuality, which was then a crime in the UK.'
        else:
            self.text = self.load_text_file(remove_linesbreak)
        self.run_ner()
        self.annotate_text()
    
    def load_text_file(self, remove_linebreaks=False):
        text = open(self.filename, "r").read()
        if remove_linebreaks:
            text = text.replace('\n', ' ')
        return text
    
    def run_ner(self):
        nlp = spacy.load(self.model)
        self.doc = nlp(self.text)
    
    def print_results(self, outputmode='displacy'):
        if outputmode == 'print':
            for entity in self.doc.ents:
                print(entity.text, entity.label_)
        
        elif outputmode == 'displacy':
            displacy.serve(self.doc, style='ent')
        
        elif outputmode == 'table':
            for entity in self.doc.ents:
                print(entity.text, entity.start_char, entity.end_char, entity.label_, sep=';')
        
        elif outputmode == 'convert':
            print(self.text_annotated)
        
        else:
            pass
    
    def annotate_text(self):
        
        prev_end = 0
        new_text = ''
        
        # loop over named entities
        for entity in self.doc.ents:
            # copy text from start to first entity
            if prev_end == 0 and entity.start_char != 0:
                new_text += self.text[0:entity.start_char]
            else:
                # append normal text before annotation
                new_text += self.text[prev_end:entity.start_char]
            
            # smw-annotate text with its label and append
            new_text += '{{' \
                        + entity.label_ \
                        + '|text=' \
                        + self.text[entity.start_char:entity.end_char] \
                        + '}}'
            prev_end = entity.end_char
        
        # append leftover text, if any
        if prev_end != len(self.text):
            new_text += self.text[prev_end:]
        
        self.text_annotated = new_text
    
    def print_annotated_text(self):
        print(self.text_annotated)
    
    def update_model(self):
        pass
    
    
# parse arguments
parser = argparse.ArgumentParser()
parser.add_argument("-f", dest='text_file')

args = parser.parse_args()

# myner = DigiVisNER(filename=args.text_file)
# myner = DigiVisNER(filename='text.txt', model='xx_ent_wiki_sm')
# myner = TrySpacy(filename='text.txt', model='en_core_web_sm')
myner = TrySpacy(filename='./texts/01.txt')
myner.print_results(outputmode='table')
# myner.print_annotated_text()
