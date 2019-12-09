from pycorenlp import StanfordCoreNLP
import json

nlp = StanfordCoreNLP("http://localhost:9000")

with open('data/interview_bruell.json', 'r') as file:
    json_data = json.load(file)
    for item in json_data['interview']:
        text = item['text']
        annotated = nlp.annotate(text, properties={
            'annotators': 'pos,ner',
            'outputFormat': 'json',
            'timeout': 1000,
        })
        t = dict()
        for sentence in annotated['sentences']:
            for token in sentence['tokens']:
                t[token['originalText']] = {
                    'text': token["originalText"],
                    'pos': token['pos'],
                    'ner': token['ner']
                }
            # print(token['originalText'], token['pos'], token['ner'])
        item['tokens'] = t
    
    print(json.dumps(json_data))
