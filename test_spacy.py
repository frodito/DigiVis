import spacy

# Load English tokenizer, tagger, parser, NER and word vectors
# nlp = spacy.load('en_core_web_sm')

def run_dt():
	nlp = spacy.load('de')
	text_dt = open('text_dt.txt', "r").read().replace('\n', ' ')
	doc_dt = nlp(text_dt)
	for entity in doc_dt.ents:
		print(entity.text, entity.label_)


def run_en():
	nlp = spacy.load('en')
	# Process whole documents
	text_en = open('text_en.txt', "r").read().replace('\n', ' ')
	doc_en = nlp(text_en)
	
	# Find named entities, phrases and concepts
	for entity in doc_en.ents:
		print(entity.text, entity.label_)
	print(doc_en)
	
run_en()