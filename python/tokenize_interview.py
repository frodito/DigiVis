from spacy.lang.de import German
import json
import sys

nlp = German()
tokenizer = nlp.Defaults.create_tokenizer(nlp)
result = dict()
to_remove = [',', '.', '[', ']', '...', '!', '?']

# print(sys.argv[1])

with open(sys.argv[1], 'r') as file:
    json_data = json.load(file)
    for index, item in enumerate(json_data['interview']):
        tokens = tokenizer(item['text'])
        # for token in tokens:
        #     print(token.text)
        item['tokens'] = list(set([token.text for token in tokens if token.text not in to_remove]))
        # print(item)
    print(json.dumps(json_data))
