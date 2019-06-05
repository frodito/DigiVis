from nltk.tokenize import word_tokenize
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
import os
import subprocess


class TextMatrixViz:
    
    def __init__(self,
                 amount=None,
                 rlbs=False,
                 rpunct=False,
                 convert=False,
                 test=False):
        self.test = test
        self.textdir = './texts/'
        self.fileindex = self.make_fileindex()
        self.amount = len(self.fileindex.items()) if amount is None else amount
        if convert:
            self.convert_files()
        self.punctuation = [",", ".", "!", "“", "”", ":", ";", "(", ")", "–"]
        self.texts = {}
        self.tokenized_texts = {}
        self.matrices = {}
        
        if test:
            self.fileindex = {0: 'lyrics.txt'}
            self.texts.update({0: self.load_text_file(filename='lyrics.txt')})
            self.tokenized_texts.update({0: self.tokenize_text(self.texts[0], rpunct=rpunct)})
        else:
            for idx in range(self.amount):
                textfile = str(idx) + '.txt'
                self.texts.update({idx: self.load_text_file(filename=textfile, rlbs=rlbs)})
                self.tokenized_texts.update(
                    {idx: self.tokenize_text(self.texts[idx], rpunct=rpunct)})
    
    def make_fileindex(self):
        if self.test:
            return {0: "lyrics.txt"}
        else:
            fileindex = {}
            idx = 0
            for filename in sorted(os.listdir("./texts/")):
                if filename.endswith(".pdf"):
                    fileindex.update({idx: filename})
                    idx = idx + 1
            return fileindex
    
    def convert_files(self):
        cmd = 'pdftotext'
        textdir = self.textdir
        for idx, pdf in self.fileindex.items():
            filename = str(idx) + '.txt'
            exists = os.path.isfile(textdir + filename)
            if not exists:
                p = subprocess.Popen([cmd, pdf, filename], cwd=textdir)
                p.wait()
            else:
                print(filename + ' already exists, no conversion of ' + pdf)
    
    def load_text_file(self, filename, rlbs=False):
        text = open(self.textdir + filename, "r").read()
        # remove linebreaks
        if rlbs:
            text = text.replace('\n', ' ')
        return text
    
    def tokenize_text(self, text, rpunct=True):
        tokens = word_tokenize(text)
        if rpunct:
            tokens = [token for token in tokens if not token in self.punctuation]
        return tokens
    
    def print_tokenized_text(self, num):
        for token in self.tokenized_texts[num]:
            print(token, end=', ')
    
    def create_matrices_all(self):
        for i in range(self.amount):
            for j in range(i, self.amount):
                self.create_matrix(i, j)
    
    def create_matrix(self, idx1, idx2):
        matrix = [[1 if x == y else 0 for x in self.tokenized_texts[idx1]] for y in
                  self.tokenized_texts[idx2]]
        self.matrices.update({(idx1, idx2): matrix})
    
    def print_matrix_values(self, idx1, idx2):
        print()
        for row in self.matrices[(idx1, idx2)]:
            for cell in row:
                print(cell, end=' ')
            print()
    
    def print_matrices_all(self):
        for i in range(self.amount):
            for j in range(i, self.amount):
                self.print_matrix(i, j)
    
    def print_matrix(self, idx1, idx2):
        # cmap = ListedColormap(['w', 'k'])
        
        fig = plt.figure(figsize=(12, 12))
        fig.suptitle('Self-Similarity Matrix for \n' + self.fileindex[idx1] + '\n and \n' +
                     self.fileindex[
                         idx2])
        # plt.matshow(self.matrices[(idx1, idx2)], fignum=1, cmap=cmap)
        plt.matshow(self.matrices[(idx1, idx2)], fignum=1)
        plt.show()


# tmv = TextMatrixViz(rpunct=True)
# tmv = TextMatrixViz(filename="text_edited.txt", rpunct=False)
tmv = TextMatrixViz(amount=2, rpunct=True, convert=False, test=False)

# tmv.print_tokenized_text()
# tmv.print_matrix_values()
# tmv.create_matrix(idx1=0, idx2=1)
# tmv.print_matrix(idx1=0, idx2=1)
tmv.create_matrices_all()
tmv.print_matrices_all()
