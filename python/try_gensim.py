import os
from multiprocessing import cpu_count

import matplotlib.pyplot as plt
from gensim.models.doc2vec import TaggedDocument, Doc2Vec
from gensim.utils import simple_preprocess
from matplotlib import cm
from nltk import tokenize
from scipy.spatial.distance import cosine
from mpl_toolkits.axes_grid1 import make_axes_locatable


class Sent2Vec(object):
    offsets = [0]
    documents = []
    
    def __init__(self, textdir='./texts', test=False, print_values=False):
        """
        Initialize object
        :param textdir: folder where the texts are found
        :param test: uses the smaller text "lyrics.txt" if True
        :param print_values: prints the values of the matrix in console when True
        """
        print('Preprocessing texts...', end='')
        self.textdir = textdir
        self.test = test
        self.print_values = print_values
        
        self.filelist = self.make_filelist()
        self.num_files = len(self.filelist)
        self.model = self.process_texts_all()
        print('finished.')
    
    def make_filelist(self):
        """
        Create list of textfiles in a prior given directory
        :return: list of filenames
        """
        filelist = []
        if self.test:
            filelist.append('lyrics.txt')
        else:
            for filename in sorted(os.listdir(self.textdir)):
                if filename.endswith(".txt"):
                    filelist.append(filename)
        return filelist
    
    def load_text_file(self, filename):
        """
        Load textfile given in filename from a specified folder and return the content
        :return: content of the given file
        """
        try:
            with open('./texts/' + filename, "r") as file:
                text = file.read()
                return text
        except IOError:
            print('IOError when opening File', filename)
    
    def process_texts_all(self):
        """
        Load all files in filelist, tokenize into sentences, and preprocess for doc2vec.
        After processing all documents, the doc2vec-model is trained.
        :return: the model trained on processed texts
        """
        for doc_idx, filename in enumerate(self.filelist):
            text = self.load_text_file(filename)
            sentences = tokenize.sent_tokenize(text)
            words = [simple_preprocess(sent) for sent in sentences]
            
            # store words with sequence-number as tag
            tag_doc = [TaggedDocument(doc, [self.offsets[doc_idx] + counter_w])
                       for counter_w, doc in enumerate(words)]
            for tag in tag_doc:
                self.documents.append(tag)
            # save document offsets
            self.offsets.append(self.offsets[doc_idx] + len(sentences))
        # create and train model on documents
        model = Doc2Vec(self.documents, min_count=0, workers=cpu_count(), epochs=1)
        return model
    
    def calculate_cosine_matrix(self, idx_doc1, idx_doc2):
        """
        Calculate matrix with cosine similarites between sentences of 2 documents.
        :return: cosine similariy matrix
        """
        cos_mat = []
        for nr_sent1 in range(self.offsets[1 if idx_doc1 <= 0 else idx_doc1]):
            cos_mat.append([])
            for nr_sent2 in range(self.offsets[1 if idx_doc2 <= 0 else idx_doc2]):
                vec1 = self.model.docvecs.vectors_docs[self.offsets[idx_doc1] + nr_sent1]
                vec2 = self.model.docvecs.vectors_docs[self.offsets[idx_doc2] + nr_sent2]
                # sim = (1 - cosine(vec1, vec2))
                sim = 1 - cosine(vec1, vec2)
                cos_mat[nr_sent1].append(sim)
        return cos_mat
    
    def calculate_print_similarity_matrix(self, idx_doc1, idx_doc2):
        """
        Calculate similarity matrix between 2 documents and plot result.
        :param idx_doc1: id of document 1 in filelist
        :param idx_doc2: id of document 2 in filelist
        :return:
        """
        mat = self.calculate_cosine_matrix(idx_doc1, idx_doc2)
        title = self.filelist[idx_doc1] + ' ' + self.filelist[idx_doc2]
        self.plot_matrix(mat=mat, xlabel=self.filelist[idx_doc1], ylabel=self.filelist[idx_doc2])
        
        # print values in console
        if self.print_values:
            self.print_mat_values(mat)
    
    def plot_matrix(self, mat, title='Cosine-Similarity', xlabel='x', ylabel='y'):
        """
        Plot the matrix supplied in mat with title and labels
        :param mat: 2D list with values to plot with title and labels
        :param title: title for the plot
        :param xlabel: x-axis-label for the plot
        :param ylabel: y-axis-label for the plot
        :return:
        """
        fig = plt.figure(figsize=(10, 10))
        ax = fig.add_subplot(111)
        ax.set_xlabel(xlabel)
        ax.set_ylabel(ylabel)
        cax = ax.matshow(mat, cmap=cm.get_cmap('hot'))
        divider = make_axes_locatable(ax)
        cax2 = divider.append_axes("right", size="5%", pad=0.5)
        fig.colorbar(cax, cax=cax2)
        plt.show()
    
    def calc_sim_mat_zero_to_x(self, idx1=0, max=1):
        """
        Calculate similarity matrix with between document x and y in filelist
        :param idx1: id in filelist to start
        :param max: upto this this id in filelist
        :return:
        """
        max = max if max < len(self.filelist) else len(self.filelist)
        for idx2 in range(max):
            self.calculate_print_similarity_matrix(idx1, idx2)
    
    def print_mat_values(self, mat):
        """
        Output of the values of the 2D list given on console.
        :param mat: 2D list with values
        :return:
        """
        min = 101
        max = 0
        for i in range(len(mat)):
            for j in range(len(mat[0])):
                min = min if min < mat[i][j] else mat[i][j]
                max = max if max > mat[i][j] else mat[i][j]
                print('%06.2f' % mat[i][j], end=' ')
            print()
        print('min: ', min, 'max: ', max)


# // Todo: Scatterplot
# blubb = Sent2Vec(test=True, print_values=True)
# blubb.print_sim_mat(0, 0)
# blubb.print_sim_mat(0, 2)
# blubb.calc_sim_mat_zero_to_x(0, 1)
