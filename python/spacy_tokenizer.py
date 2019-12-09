from spacy.lang.de import German
import sys


class SpacyTokenizer:
    def __init__(self, text):
        nlp = German()
        self.tokenizer = nlp.Defaults.create_tokenizer(nlp)
        self.text = text
    
    def tokenize(self):
        return self.tokenizer(self.text)


# if len(sys.argv) >= 2:
#     text = sys.argv[1]
# else:
#     text = "Dies ist ein Testsatz. Er dient zur Überprüfung der gewünschten Funktionalitäten."
# tokenizer = SpacyTokenizer(text)
# tokens = tokenizer.tokenize()
# print(tokens.to_json())
# for token in tokens:
#     print(token)
