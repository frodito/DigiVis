import nltk
from nltk.tokenize import MWETokenizer

with open("texts/0.txt", "r") as file:
    text = file.read().replace('/n', ' ')
    tokens = nltk.word_tokenize(text)
    mwetokenizer = MWETokenizer([('Ernst', 'von', 'Glasersfeld'), ('John', 'Locke')], separator=' ')
    mwetokens = mwetokenizer.tokenize(tokens)
    
    for entry in mwetokens:
        print(entry)
