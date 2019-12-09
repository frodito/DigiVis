import sklearn
import json
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from collections import Counter


def read_data(file):
    with open(file, 'r') as fh:
        return json.load(fh)


def prepare_data(data, key_to_extract):
    X = []
    y = []
    for curr in data['dvextract']:
        X.append(curr['quote'])
        y.append(curr[key_to_extract])
    
    print(str(len(X)) + ' samples')
    print(str(len(set(y))) + ' different labels')
    print('label distribution', Counter(y))
    return X, y


def naive_classifier(X, y):
    vectorizer = CountVectorizer(stop_words='english', analyzer='char',
                                 ngram_range=(2, 4))
    X = vectorizer.fit_transform(X)
    
    clf = RandomForestClassifier(n_estimators=100)
    scores = cross_val_score(clf, X, y, cv=5)
    
    print("Accuracy: %0.2f (+/- %0.2f)" % (scores.mean(), scores.std()
                                           * 2))
    print(scores)


data = read_data('/home/frod/gdrive/DigiVis/extract/20190813/annotation_extract.json')
# print(json.dumps(data, indent=2, sort_keys=True))
X, y = prepare_data(data, 'category')
naive_classifier(X, y)
