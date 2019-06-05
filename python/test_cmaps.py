from gensim.utils import simple_preprocess
from gensim.models.doc2vec import TaggedDocument, Doc2Vec
from matplotlib import cm
import matplotlib.pyplot as plt
from multiprocessing import cpu_count
from nltk import tokenize
import os
from scipy.spatial.distance import cosine

idx_max = 100

mat = []

for i in range(idx_max):
    mat.append([])
    for j in range(idx_max):
        print(i, j)
        mat[i].append(j)


# make pretty picture
fig = plt.figure(figsize=(10, 10))
cmap = cm.get_cmap('hot')
plt.matshow(mat, fignum=1, cmap=cmap)
plt.show()
