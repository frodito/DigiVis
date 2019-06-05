# from document import Document
# import os
# import pandas as pd
#
# def make_filelist():
#     filelist = []
#     for filename in sorted(os.listdir('./texts/')):
#         if filename.endswith(".txt"):
#             filelist.append(filename)
#     return filelist
#
#
# filelist = make_filelist()
#
# doclist = []
# for filename in filelist:
#     doc = Document(filename=filename)
#     doc.apply_pos_tagging()
#     doclist.append()
#
# for doc in doclist:
#     doc.apply_pos_tagging()
#     doc.print_tokens()
#     break


# data = pd.read_csv("data_gen_digivis.csv")
#
# for index, row in data.iterrows():
#     print(row["jahr"], row["quellentyp"], row["titel"], row["author"])

# from document import Document
# doc1 = Document()
# doc1.print_tokens_words()

# color = {
#     "Anpassung": "#E74C3C",
#     "Erfahrung": "#1abc9c",
#     "Lernen": "#283747",
#     "Raum und Zeit": "#f39c12",
#     "Realität": "#5499c7",
#     "Wirklichkeit": "#f0c40f",
#     "Sprache": "#82e0aa",
#     "Viabilität": "#cacfd2",
#     "Wahrnehmung": "#ff00ff",
# }
# # text = "Anpassung"
# # print(color)
# # print(color["Anpassung"])
# # print(color[text])
#
# import pandas as pd
# import numpy as np
# import json, urllib
# import plotly.plotly as py
#
# data = pd.read_csv("data_parallel.csv")
#
# colors = []
# for (idx, cells) in data.iterrows():
#     colors.append(color(cells['Thema'])
#
# print(colors)

# import pandas as pd
# data = pd.read_csv("data_parallel.csv")
# aggregation = data.groupby(['Thema', 'Jahr'])['Thema'].count()
# for (k1, k2), v in aggregation.items():
# 	print(k1, k2, v)


import pandas as pd
from pySankey import sankey

df = pd.read_csv("data_parallel.csv")

leftLabels = [thema for thema in sorted(list(set(df['Thema'])), reverse=True)]
rightLabels = [jahr for jahr in sorted(list(set(df['Jahr'])), reverse=True)]
print(rightLabels)

colorDict = {
    "Anpassung": "#E74C3C",
    "Erfahrung": "#1abc9c",
    "Lernen": "#283747",
    "Raum und Zeit": "#f39c12",
    "Realität": "#5499c7",
    "Wirklichkeit": "#f0c40f",
    "Sprache": "#82e0aa",
    "Viabilität": "#cacfd2",
    "Wahrnehmung": "#ff00ff",
}

sankey.sankey(
    left=df['Thema'], right=df['Jahr'], aspect=20,
    leftLabels=leftLabels, rightLabels=rightLabels,
    fontsize=20, figure_name="Stränge"
)