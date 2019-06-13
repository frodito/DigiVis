from document import Document
import os

def make_filelist():
    filelist = []
    for filename in sorted(os.listdir('./texts/')):
        if filename.endswith(".txt"):
            filelist.append(filename)
    return filelist


filelist = make_filelist()

doclist = []
for filename in filelist:
    doc = Document(filename=filename)
    doc.apply_pos_tagging()
    doclist.append(doc)

for doc in doclist:
    doc.